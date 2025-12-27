# Design: Oil View (Virtual File with Native Editor)

## Context

This is the core feature of Sugar Rush - a custom Obsidian view that displays directory contents as editable text, similar to oil.nvim. Users can rename files by editing line text, delete by removing lines, and create by adding new lines.

**KEY DESIGN PRINCIPLE:** Use Obsidian's native text editor (CodeMirror 6) to leverage:
- Built-in vim mode support (when user has vim mode enabled)
- All existing keybindings and editor plugins
- Familiar editing experience
- Undo/redo for free
- Syntax highlighting and cursor behavior

**Virtual File Approach:**
Instead of using a contenteditable div, we create a virtual file that:
1. Exists only in memory (never saved to disk)
2. Contains directory listing as plain text
3. Is edited using Obsidian's native CodeMirror editor
4. Changes are intercepted on "save" (Mod+S) and converted to file mutations
5. The file path is a special internal path that Obsidian won't try to persist

**Stakeholders:**
- Users editing directory contents (especially vim users!)
- File mutation system (consumes pending mutations)
- Split navigation (opens new oil views)
- Preview system (reads current selection)

## Goals / Non-Goals

**Goals:**
- Display directory contents as editable text lines in Obsidian's native editor
- **Full vim mode support when user has vim enabled**
- All standard editor keybindings work (arrows, home/end, etc.)
- Track edits without immediately modifying filesystem
- Provide clear visual indicators for pending changes
- Integrate with Obsidian's view/tab system

**Non-Goals:**
- Actually performing file operations (separate proposal: add-file-mutations)
- Split/pane management (separate proposal: add-split-navigation)
- File preview (separate proposal: add-preview-support)

## Decisions

### Decision 1: Extend TextFileView with Virtual File

**What:** Create a custom view extending `TextFileView` that operates on a virtual (in-memory) file

**Why:**
- `TextFileView` provides full access to Obsidian's CodeMirror 6 editor
- Vim mode works automatically when enabled in Obsidian settings
- All editor features (undo/redo, selection, search) work for free
- No need to implement our own keyboard handling

**How it works:**
1. Create a virtual file adapter that provides file content without disk backing
2. The "file content" is the rendered directory listing
3. Override save behavior to intercept and apply mutations
4. Use Obsidian's editor API to track changes

```typescript
// src/views/oil-view.ts

import { TextFileView, WorkspaceLeaf, TFolder, TFile, Editor } from 'obsidian';
import type SugarRushPlugin from '../main';
import { OIL_VIEW_TYPE, CSS_CLASSES } from '../constants';
import type { OilEntry, FileMutation, OilViewState } from '../types';
import { OilBuffer } from './oil-buffer';

/**
 * OilView - Directory contents as editable text using Obsidian's native editor.
 *
 * ARCHITECTURE:
 * 1. Extends TextFileView to get CodeMirror 6 editor with vim mode support
 * 2. Uses a "virtual file" concept - content exists only in memory
 * 3. Directory contents rendered as plain text lines
 * 4. Save (Mod+S) intercepts and applies mutations instead of saving
 * 5. Escape discards changes and reloads original content
 */
export class OilView extends TextFileView {
  plugin: SugarRushPlugin;
  private buffer: OilBuffer;
  private state: OilViewState;
  private statusEl!: HTMLElement;
  private originalContent: string = '';

  constructor(leaf: WorkspaceLeaf, plugin: SugarRushPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.buffer = new OilBuffer(this.app, plugin.settings);
    this.state = {
      currentPath: '',
      history: [],
      historyIndex: -1,
      pendingMutations: [],
    };
  }

  getViewType(): string {
    return OIL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return `Oil: ${this.state.currentPath || '/'}`;
  }

  getIcon(): string {
    return 'folder-open';
  }

  /**
   * Called when view opens. Set up the editor and load initial directory.
   */
  async onOpen(): Promise<void> {
    await super.onOpen();

    // Add our CSS class to the view
    this.contentEl.addClass(CSS_CLASSES.OIL_VIEW);

    // Create status bar above the editor
    this.statusEl = this.contentEl.createDiv({ cls: 'oil-status-bar' });
    this.contentEl.prepend(this.statusEl);
    this.updateStatusBar();

    // Register our custom commands that work within the editor
    this.registerEditorCommands();

    // Load initial directory
    const activeFile = this.app.workspace.getActiveFile();
    const initialPath = activeFile?.parent?.path ?? '';
    await this.navigateTo(initialPath);
  }

  /**
   * Register oil-specific editor commands and keybindings
   */
  private registerEditorCommands(): void {
    // Register Mod+S to apply mutations (overrides normal save)
    this.registerDomEvent(this.contentEl, 'keydown', (e: KeyboardEvent) => {
      // Mod+S = Apply changes
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        this.applyChanges();
        return;
      }

      // Escape = Discard changes
      if (e.key === 'Escape') {
        e.preventDefault();
        this.discardChanges();
        return;
      }

      // `-` at start of line = Navigate to parent (vim-like)
      if (e.key === '-' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if at beginning of line or line is empty
        const editor = this.editor;
        if (editor) {
          const cursor = editor.getCursor();
          const lineText = editor.getLine(cursor.line);
          if (cursor.ch === 0 || lineText.trim() === '') {
            e.preventDefault();
            this.navigateUp();
            return;
          }
        }
      }

      // Enter = Navigate into folder or open file
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const handled = this.handleEnterKey();
        if (handled) {
          e.preventDefault();
        }
      }
    });

    // Listen for editor changes to track mutations
    this.registerEvent(
      this.app.workspace.on('editor-change', (editor: Editor) => {
        if (editor === this.editor) {
          this.onEditorChange();
        }
      })
    );
  }

  /**
   * Handle Enter key - navigate into folder or open file
   */
  private handleEnterKey(): boolean {
    const editor = this.editor;
    if (!editor) return false;

    const cursor = editor.getCursor();
    const lineText = editor.getLine(cursor.line);
    const entry = this.buffer.getEntryForLine(lineText);

    if (!entry) return false;

    if (entry.isDirectory) {
      // Navigate into directory
      const targetPath = this.state.currentPath
        ? `${this.state.currentPath}/${entry.displayName}`
        : entry.displayName;
      this.navigateTo(targetPath);
      return true;
    }

    if (entry.file) {
      // Open file in new leaf
      const leaf = this.app.workspace.getLeaf(false);
      leaf.openFile(entry.file);
      return true;
    }

    return false;
  }

  /**
   * Called when editor content changes - track mutations
   */
  private onEditorChange(): void {
    if (!this.editor) return;

    const currentContent = this.editor.getValue();
    const mutations = this.buffer.parseAndDiff(currentContent);
    this.state.pendingMutations = mutations;
    this.updateStatusBar();
  }

  /**
   * Navigate to a directory and display its contents
   */
  async navigateTo(path: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(path);

    if (path !== '' && !(folder instanceof TFolder)) {
      console.error(`Not a folder: ${path}`);
      return;
    }

    // Update history
    if (this.state.currentPath !== path) {
      this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
      this.state.history.push(path);
      this.state.historyIndex = this.state.history.length - 1;
    }

    this.state.currentPath = path;
    this.state.pendingMutations = [];

    // Load directory contents into buffer
    await this.buffer.loadDirectory(path);

    // Render to text and set in editor
    const content = this.buffer.renderToText();
    this.originalContent = content;

    // Set the editor content
    if (this.editor) {
      this.editor.setValue(content);
      this.editor.setCursor(0, 0);
    }

    // Update UI
    this.updateStatusBar();
    this.leaf.updateHeader();
  }

  /**
   * Navigate to parent directory
   */
  async navigateUp(): Promise<void> {
    if (this.state.currentPath === '') return;

    const parentPath = this.state.currentPath.split('/').slice(0, -1).join('/');
    await this.navigateTo(parentPath);
  }

  /**
   * Apply pending changes (called on Mod+S)
   */
  async applyChanges(): Promise<void> {
    if (this.state.pendingMutations.length === 0) {
      // No changes, just refresh
      await this.navigateTo(this.state.currentPath);
      return;
    }

    // Emit event for file-mutations system to handle
    this.app.workspace.trigger('sugar-rush:confirm-mutations', {
      mutations: this.state.pendingMutations,
      sourcePath: this.state.currentPath,
      onComplete: async (success: boolean) => {
        if (success) {
          await this.navigateTo(this.state.currentPath);
        }
      },
    });
  }

  /**
   * Discard changes and reload original content
   */
  discardChanges(): void {
    this.state.pendingMutations = [];
    if (this.editor) {
      this.editor.setValue(this.originalContent);
      this.editor.setCursor(0, 0);
    }
    this.updateStatusBar();
  }

  /**
   * Update status bar display
   */
  private updateStatusBar(): void {
    const pendingCount = this.state.pendingMutations.length;
    const pathDisplay = this.state.currentPath || '/';

    if (pendingCount > 0) {
      this.statusEl.setText(`${pathDisplay} [${pendingCount} pending - Mod+S to apply, Esc to discard]`);
      this.statusEl.addClass('has-pending');
    } else {
      this.statusEl.setText(pathDisplay);
      this.statusEl.removeClass('has-pending');
    }
  }

  /**
   * TextFileView requires these methods - we stub them for virtual file
   */
  getViewData(): string {
    return this.editor?.getValue() ?? '';
  }

  setViewData(data: string, clear: boolean): void {
    if (this.editor) {
      this.editor.setValue(data);
    }
  }

  clear(): void {
    if (this.editor) {
      this.editor.setValue('');
    }
  }
}
```

### Decision 2: Buffer with Text Rendering

**What:** OilBuffer generates plain text representation of directory contents

**Why:**
- Text format is what the editor displays
- Easy to parse back to detect mutations
- Each line = one file/folder entry

**Line Format:**
```
folder-name/
file-name.ext
.hidden-file
```

Simple, parseable, no emojis (let CSS handle icons).

```typescript
// src/views/oil-buffer.ts

import { App, TFolder, TFile, TAbstractFile } from 'obsidian';
import type { OilEntry, FileMutation, SugarRushSettings } from '../types';

export class OilBuffer {
  private app: App;
  private settings: SugarRushSettings;
  private originalEntries: OilEntry[] = [];
  private currentPath: string = '';

  constructor(app: App, settings: SugarRushSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Load directory contents
   */
  async loadDirectory(path: string): Promise<void> {
    this.currentPath = path;
    this.originalEntries = [];

    let children: TAbstractFile[];

    if (path === '') {
      children = this.app.vault.getRoot().children;
    } else {
      const folder = this.app.vault.getAbstractFileByPath(path);
      children = folder instanceof TFolder ? folder.children : [];
    }

    // Sort and filter
    children = this.sortAndFilter(children);

    // Build entries
    let lineNumber = 1;
    for (const child of children) {
      const isDirectory = child instanceof TFolder;
      this.originalEntries.push({
        originalPath: child.path,
        displayName: child.name,
        isDirectory,
        file: isDirectory ? null : (child as TFile),
        folder: isDirectory ? (child as TFolder) : null,
        lineNumber: lineNumber++,
      });
    }
  }

  /**
   * Sort and filter children
   */
  private sortAndFilter(children: TAbstractFile[]): TAbstractFile[] {
    // Filter hidden files if needed
    if (!this.settings.showHiddenFiles) {
      children = children.filter(c => !c.name.startsWith('.'));
    }

    // Sort
    const { sortOrder, directoryFirst } = this.settings.display;

    return [...children].sort((a, b) => {
      if (directoryFirst) {
        const aDir = a instanceof TFolder;
        const bDir = b instanceof TFolder;
        if (aDir && !bDir) return -1;
        if (!aDir && bDir) return 1;
      }

      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        case 'modified':
          const aTime = a instanceof TFile ? a.stat.mtime : 0;
          const bTime = b instanceof TFile ? b.stat.mtime : 0;
          return bTime - aTime;
        case 'size':
          const aSize = a instanceof TFile ? a.stat.size : 0;
          const bSize = b instanceof TFile ? b.stat.size : 0;
          return bSize - aSize;
        default:
          return 0;
      }
    });
  }

  /**
   * Render entries to plain text for editor
   */
  renderToText(): string {
    const lines = this.originalEntries.map(entry => {
      if (entry.isDirectory) {
        return `${entry.displayName}/`;
      }
      return entry.displayName;
    });
    return lines.join('\n');
  }

  /**
   * Get entry for a given line text
   */
  getEntryForLine(lineText: string): OilEntry | null {
    const name = lineText.trim().replace(/\/$/, '');
    return this.originalEntries.find(e => e.displayName === name) ?? null;
  }

  /**
   * Get all original entries
   */
  getEntries(): OilEntry[] {
    return [...this.originalEntries];
  }

  /**
   * Parse current editor content and diff against original
   */
  parseAndDiff(content: string): FileMutation[] {
    const mutations: FileMutation[] = [];
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const seenPaths = new Set<string>();

    // Parse each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isDir = line.endsWith('/');
      const name = isDir ? line.slice(0, -1) : line;

      if (!name) continue;

      // Find matching original
      const original = this.originalEntries[i];

      if (original) {
        seenPaths.add(original.originalPath);

        // Check if renamed
        if (original.displayName !== name) {
          const newPath = this.currentPath
            ? `${this.currentPath}/${name}`
            : name;

          mutations.push({
            type: 'rename',
            originalPath: original.originalPath,
            newPath,
            entry: { ...original, displayName: name },
          });
        }
      } else {
        // New entry
        const newPath = this.currentPath ? `${this.currentPath}/${name}` : name;

        mutations.push({
          type: 'create',
          originalPath: '',
          newPath,
          entry: {
            originalPath: '',
            displayName: name,
            isDirectory: isDir,
            file: null,
            folder: null,
            lineNumber: i + 1,
          },
        });
      }
    }

    // Check for deletions
    for (const entry of this.originalEntries) {
      if (!seenPaths.has(entry.originalPath)) {
        // Check if name appears anywhere
        const name = entry.displayName;
        const stillExists = lines.some(l => {
          const lineName = l.trim().replace(/\/$/, '');
          return lineName === name;
        });

        if (!stillExists) {
          mutations.push({
            type: 'delete',
            originalPath: entry.originalPath,
            entry,
          });
        }
      }
    }

    return mutations;
  }
}
```

### Decision 3: View Registration

**What:** Register as a custom view type (not a file handler)

```typescript
// src/main.ts

import { OilView } from './views/oil-view';
import { OIL_VIEW_TYPE } from './constants';

// In onload():
this.registerView(OIL_VIEW_TYPE, (leaf) => new OilView(leaf, this));
```

### Decision 4: CSS Styling

**What:** Minimal CSS that doesn't interfere with editor

```css
/* styles.css */

.sugar-rush-oil-view {
  display: flex;
  flex-direction: column;
}

.oil-status-bar {
  padding: 4px 8px;
  background: var(--background-secondary);
  border-bottom: 1px solid var(--background-modifier-border);
  font-size: var(--font-ui-smaller);
  color: var(--text-muted);
  flex-shrink: 0;
}

.oil-status-bar.has-pending {
  background: var(--background-modifier-warning);
  color: var(--text-warning);
}

/* Directory lines styled via editor decorations */
.sugar-rush-directory-line {
  font-weight: 500;
}

/* Let the editor's line styling handle mutations
   We'll use editor decorations to mark changed lines */
```

## Why This Approach is Better

| Feature | Old Approach (contenteditable) | New Approach (TextFileView) |
|---------|-------------------------------|------------------------------|
| Vim mode | ❌ Not supported | ✅ Works automatically |
| Undo/redo | ❌ Must implement | ✅ Built-in |
| Selection | ❌ Basic only | ✅ Full editor selection |
| Search | ❌ Must implement | ✅ Cmd+F works |
| Keybindings | ❌ Custom handling | ✅ All Obsidian keybindings |
| Copy/paste | ⚠️ Basic | ✅ Full support |
| Line numbers | ❌ Must implement | ✅ Available if enabled |
| Accessibility | ⚠️ Poor | ✅ Editor is accessible |

## Risks / Trade-offs

### Risk 1: TextFileView Complexity
**Risk:** TextFileView may have behaviors we need to suppress
**Mitigation:** Override methods like `canAcceptExtension`, `getViewData`, etc.

### Risk 2: Save Interception
**Risk:** User muscle memory of Mod+S might expect file save
**Mitigation:** Clear status bar messaging that Mod+S applies changes

### Risk 3: Editor State
**Risk:** Editor may try to persist state we don't want
**Mitigation:** Override state methods, don't use file property

## Migration Plan

Not applicable - new feature implementation.

## Open Questions

1. **Line decorations:** How do we highlight pending changes in the editor?
   - Decision: Use CodeMirror decorations or Obsidian's editor API

2. **Cursor position:** Should we track and restore cursor on navigation?
   - Decision: Yes, use editor.getCursor() / setCursor()
