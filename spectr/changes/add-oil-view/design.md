# Design: Oil View (Buffer-Based Directory Display)

## Context

This is the core feature of Sugar Rush - a custom Obsidian view that displays directory contents as editable text, similar to oil.nvim. Users can rename files by editing line text, delete by removing lines, and create by adding new lines.

**Critical Constraint:** Obsidian auto-saves files on edit. This means we CANNOT use a real Obsidian file/note as the buffer. Instead, we must:
1. Use a custom view with a textarea/contenteditable element
2. Track all edits as "pending mutations" in memory
3. Only apply mutations when user explicitly confirms (Mod+Enter)
4. Provide clear visual feedback that changes are pending

**Stakeholders:**
- Users editing directory contents
- File mutation system (consumes pending mutations)
- Split navigation (opens new oil views)
- Preview system (reads current selection)

## Goals / Non-Goals

**Goals:**
- Display directory contents as editable text lines
- Track edits without immediately modifying filesystem
- Provide clear visual indicators for pending changes
- Support keyboard-driven navigation (vim-like)
- Integrate with Obsidian's view/tab system

**Non-Goals:**
- Actually performing file operations (separate proposal: add-file-mutations)
- Split/pane management (separate proposal: add-split-navigation)
- File preview (separate proposal: add-preview-support)
- Undo/redo (defer to later enhancement)

## Decisions

### Decision 1: Custom View with ContentEditable

**What:** Use Obsidian's `ItemView` with a contenteditable div, not a real markdown file

**Why:**
- Real files trigger Obsidian's auto-save → mutations would apply immediately
- ContentEditable gives us full control over edit tracking
- Can style individual lines with CSS classes
- No interference with Obsidian's file system

**Trade-offs:**
- Must implement our own edit tracking
- No native Obsidian editor features (but we don't need them)
- Must handle keyboard events manually

```typescript
// src/views/oil-view.ts

import { ItemView, WorkspaceLeaf, TFolder, TFile } from 'obsidian';
import type SugarRushPlugin from '../main';
import { OIL_VIEW_TYPE, CSS_CLASSES } from '../constants';
import type { OilEntry, FileMutation, OilViewState } from '../types';
import { OilBuffer } from './oil-buffer';
import { OilRenderer } from './oil-renderer';

export class OilView extends ItemView {
  plugin: SugarRushPlugin;
  private buffer: OilBuffer;
  private renderer: OilRenderer;
  private state: OilViewState;
  private containerEl: HTMLElement;
  private editorEl: HTMLElement;
  private statusEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: SugarRushPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.buffer = new OilBuffer(this);
    this.renderer = new OilRenderer(this, plugin.settings);
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
    return this.state.currentPath || 'Oil View';
  }

  getIcon(): string {
    return 'folder-open';
  }

  async onOpen(): Promise<void> {
    this.containerEl = this.contentEl;
    this.containerEl.addClass(CSS_CLASSES.OIL_VIEW);

    // Create status bar at top
    this.statusEl = this.containerEl.createDiv({ cls: 'oil-status-bar' });
    this.updateStatusBar();

    // Create editable area
    this.editorEl = this.containerEl.createDiv({
      cls: 'oil-editor',
      attr: { contenteditable: 'true', spellcheck: 'false' },
    });

    // Register keyboard handlers
    this.registerDomEvent(this.editorEl, 'keydown', this.handleKeydown.bind(this));
    this.registerDomEvent(this.editorEl, 'input', this.handleInput.bind(this));
    this.registerDomEvent(this.editorEl, 'blur', this.handleBlur.bind(this));

    // Load initial directory (current file's parent or vault root)
    const activeFile = this.app.workspace.getActiveFile();
    const initialPath = activeFile?.parent?.path ?? '';
    await this.navigateTo(initialPath);
  }

  async onClose(): Promise<void> {
    // Warn if there are pending mutations
    if (this.state.pendingMutations.length > 0) {
      // Could show a notice, but don't block close
      console.log(`Oil view closed with ${this.state.pendingMutations.length} pending changes`);
    }
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
      // Truncate forward history if we navigated from middle
      this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
      this.state.history.push(path);
      this.state.historyIndex = this.state.history.length - 1;
    }

    this.state.currentPath = path;
    this.state.pendingMutations = [];

    // Load directory contents
    await this.buffer.loadDirectory(path);

    // Render the buffer
    this.renderer.render(this.editorEl, this.buffer.getEntries());

    // Update UI
    this.updateStatusBar();
    this.leaf.updateHeader();
  }

  /**
   * Navigate to parent directory (oil.nvim's `-` key behavior)
   */
  async navigateUp(): Promise<void> {
    if (this.state.currentPath === '') {
      // Already at vault root
      return;
    }

    const parentPath = this.state.currentPath.split('/').slice(0, -1).join('/');
    await this.navigateTo(parentPath);
  }

  /**
   * Handle keyboard events in the editor
   */
  private async handleKeydown(event: KeyboardEvent): Promise<void> {
    const { navigateUp, confirmChanges, discardChanges } = this.plugin.settings.keybindings;

    // Navigate up with `-` key (configurable)
    if (event.key === navigateUp && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      await this.navigateUp();
      return;
    }

    // Confirm changes with Mod+Enter
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      await this.confirmChanges();
      return;
    }

    // Discard changes with Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      this.discardChanges();
      return;
    }

    // Enter on a folder line → navigate into it
    if (event.key === 'Enter' && !event.shiftKey) {
      const currentLine = this.buffer.getCurrentLine();
      if (currentLine?.isDirectory) {
        event.preventDefault();
        const targetPath = this.state.currentPath
          ? `${this.state.currentPath}/${currentLine.displayName}`
          : currentLine.displayName;
        await this.navigateTo(targetPath);
        return;
      }
    }

    // Enter on a file → open it
    if (event.key === 'Enter' && !event.shiftKey) {
      const currentLine = this.buffer.getCurrentLine();
      if (currentLine?.file) {
        event.preventDefault();
        // getLeaf(false) returns existing navigable leaf or creates new one
        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(currentLine.file);
        return;
      }
    }
  }

  /**
   * Handle input events to track mutations
   */
  private handleInput(event: Event): void {
    // Parse the current buffer state and diff against original
    const mutations = this.buffer.parseAndDiff(this.editorEl.innerText);
    this.state.pendingMutations = mutations;

    // Update visual indicators
    this.renderer.updateHighlighting(this.editorEl, mutations);
    this.updateStatusBar();
  }

  /**
   * Handle blur to ensure we capture final state
   */
  private handleBlur(event: FocusEvent): void {
    // Reparse on blur to ensure state is current
    this.handleInput(event);
  }

  /**
   * Confirm and apply all pending mutations
   *
   * IMPORTANT: File operations use these Obsidian APIs:
   * - Rename: app.fileManager.renameFile(file, newPath) - updates links automatically
   * - Delete: app.fileManager.trashFile(file) - moves to trash (safe)
   * - Delete permanent: app.vault.delete(file, true) - permanent deletion
   * - Create file: app.vault.create(path, content)
   * - Create folder: app.vault.createFolder(path)
   */
  async confirmChanges(): Promise<void> {
    if (this.state.pendingMutations.length === 0) {
      return;
    }

    // Emit event for file-mutations system to handle
    // The file-mutations feature will listen for this and apply the changes
    this.app.workspace.trigger('sugar-rush:confirm-mutations', {
      mutations: this.state.pendingMutations,
      sourcePath: this.state.currentPath,
      onComplete: async (success: boolean) => {
        if (success) {
          // Reload directory to reflect changes
          await this.navigateTo(this.state.currentPath);
        }
      },
    });
  }

  /**
   * Discard all pending mutations and reset buffer
   */
  discardChanges(): void {
    this.state.pendingMutations = [];
    this.renderer.render(this.editorEl, this.buffer.getEntries());
    this.updateStatusBar();
  }

  /**
   * Update the status bar with current state
   */
  private updateStatusBar(): void {
    const pendingCount = this.state.pendingMutations.length;
    const pathDisplay = this.state.currentPath || '/';

    if (pendingCount > 0) {
      this.statusEl.setText(`${pathDisplay} [${pendingCount} pending changes - Mod+Enter to apply, Escape to discard]`);
      this.statusEl.addClass('has-pending');
    } else {
      this.statusEl.setText(pathDisplay);
      this.statusEl.removeClass('has-pending');
    }
  }

  /**
   * Get pending mutations for external systems
   */
  getPendingMutations(): FileMutation[] {
    return [...this.state.pendingMutations];
  }
}
```

### Decision 2: Buffer Parsing and Diff Tracking

**What:** Separate class to handle buffer text parsing and change detection

**Why:**
- Clean separation from view rendering
- Testable in isolation
- Can be reused if we add alternative input methods

```typescript
// src/views/oil-buffer.ts

import { TFolder, TFile, TAbstractFile } from 'obsidian';
import type { OilView } from './oil-view';
import type { OilEntry, FileMutation } from '../types';

export class OilBuffer {
  private view: OilView;
  private originalEntries: OilEntry[] = [];
  private currentPath: string = '';

  constructor(view: OilView) {
    this.view = view;
  }

  /**
   * Load directory contents into the buffer
   */
  async loadDirectory(path: string): Promise<void> {
    this.currentPath = path;
    this.originalEntries = [];

    const vault = this.view.app.vault;
    let children: TAbstractFile[];

    if (path === '') {
      // Vault root
      children = vault.getRoot().children;
    } else {
      const folder = vault.getAbstractFileByPath(path);
      if (folder instanceof TFolder) {
        children = folder.children;
      } else {
        children = [];
      }
    }

    // Sort children according to settings
    const settings = this.view.plugin.settings.display;
    children = this.sortChildren(children, settings);

    // Filter hidden files if needed
    if (!this.view.plugin.settings.showHiddenFiles) {
      children = children.filter(child => !child.name.startsWith('.'));
    }

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
   * Sort children according to display settings
   */
  private sortChildren(
    children: TAbstractFile[],
    settings: { sortOrder: string; sortDirection: string; directoryFirst: boolean }
  ): TAbstractFile[] {
    return [...children].sort((a, b) => {
      // Directories first if enabled
      if (settings.directoryFirst) {
        const aIsDir = a instanceof TFolder;
        const bIsDir = b instanceof TFolder;
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
      }

      // Sort by selected criteria
      let comparison = 0;
      switch (settings.sortOrder) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { numeric: true });
          break;
        case 'modified':
          const aTime = a instanceof TFile ? a.stat.mtime : 0;
          const bTime = b instanceof TFile ? b.stat.mtime : 0;
          comparison = bTime - aTime; // Newest first by default
          break;
        case 'size':
          const aSize = a instanceof TFile ? a.stat.size : 0;
          const bSize = b instanceof TFile ? b.stat.size : 0;
          comparison = bSize - aSize; // Largest first by default
          break;
      }

      return settings.sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get original entries (before any edits)
   */
  getEntries(): OilEntry[] {
    return [...this.originalEntries];
  }

  /**
   * Get current line based on cursor position
   */
  getCurrentLine(): OilEntry | null {
    // This would need to track cursor position
    // Simplified: return first entry for now
    return this.originalEntries[0] ?? null;
  }

  /**
   * Parse buffer text and generate mutations by diffing against original
   */
  parseAndDiff(bufferText: string): FileMutation[] {
    const mutations: FileMutation[] = [];
    const lines = bufferText.split('\n').filter(line => line.trim() !== '');

    // Track which original entries were seen
    const seenOriginals = new Set<string>();

    // Parse each line
    const parsedNames = lines.map(line => this.parseLineName(line));

    // Check for renames and track seen entries
    for (let i = 0; i < parsedNames.length; i++) {
      const name = parsedNames[i];
      if (!name) continue;

      // Find matching original entry by line position or name
      const originalEntry = this.originalEntries[i];

      if (originalEntry) {
        seenOriginals.add(originalEntry.originalPath);

        // Check if renamed
        if (originalEntry.displayName !== name) {
          const newPath = this.currentPath
            ? `${this.currentPath}/${name}`
            : name;

          mutations.push({
            type: 'rename',
            originalPath: originalEntry.originalPath,
            newPath,
            entry: { ...originalEntry, displayName: name },
          });
        }
      } else {
        // New entry (line added)
        const newPath = this.currentPath ? `${this.currentPath}/${name}` : name;

        mutations.push({
          type: 'create',
          originalPath: '',
          newPath,
          entry: {
            originalPath: '',
            displayName: name,
            isDirectory: name.endsWith('/'), // Convention: trailing slash = directory
            file: null,
            folder: null,
            lineNumber: i + 1,
          },
        });
      }
    }

    // Check for deletions (original entries not seen)
    for (const entry of this.originalEntries) {
      if (!seenOriginals.has(entry.originalPath)) {
        // Check if this name appears anywhere in parsed names
        const stillExists = parsedNames.includes(entry.displayName);
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

  /**
   * Parse a single line to extract the file/folder name
   * Strips icons and formatting
   */
  private parseLineName(line: string): string {
    // Remove leading icon characters and whitespace
    // Format: "📁 folder-name" or "📄 file-name.md"
    const match = line.match(/^[\s\p{Emoji}\p{Symbol}]*\s*(.+)$/u);
    return match?.[1]?.trim() ?? line.trim();
  }
}
```

### Decision 3: Line Rendering with Visual Indicators

**What:** Separate renderer class for line display and mutation highlighting

**Why:**
- Rendering logic isolated from data logic
- Easy to change visual style
- Supports theming

```typescript
// src/views/oil-renderer.ts

import type { OilEntry, FileMutation, SugarRushSettings } from '../types';
import { CSS_CLASSES } from '../constants';

export class OilRenderer {
  private view: any; // OilView
  private settings: SugarRushSettings;

  constructor(view: any, settings: SugarRushSettings) {
    this.view = view;
    this.settings = settings;
  }

  /**
   * Render entries to the editor element
   */
  render(editorEl: HTMLElement, entries: OilEntry[]): void {
    editorEl.empty();

    for (const entry of entries) {
      const lineEl = editorEl.createDiv({ cls: CSS_CLASSES.OIL_LINE });

      // Add type-specific class
      if (entry.isDirectory) {
        lineEl.addClass(CSS_CLASSES.DIRECTORY);
      } else {
        lineEl.addClass(CSS_CLASSES.FILE);
      }

      // Build line content
      let content = '';

      // Icon
      if (this.settings.display.showFileIcons) {
        content += entry.isDirectory ? '📁 ' : '📄 ';
      }

      // Name
      content += entry.displayName;

      // Directory indicator (trailing /)
      if (entry.isDirectory) {
        content += '/';
      }

      // Optional: file size
      if (this.settings.display.showFileSizes && entry.file) {
        const size = this.formatFileSize(entry.file.stat.size);
        content += `  ${size}`;
      }

      // Optional: modified date
      if (this.settings.display.showModifiedDate && entry.file) {
        const date = new Date(entry.file.stat.mtime).toLocaleDateString();
        content += `  ${date}`;
      }

      lineEl.setText(content);
    }

    // Add trailing newline for easier adding of new entries
    editorEl.createDiv({ cls: 'oil-line-placeholder', text: '' });
  }

  /**
   * Update line highlighting based on pending mutations
   */
  updateHighlighting(editorEl: HTMLElement, mutations: FileMutation[]): void {
    const lines = editorEl.querySelectorAll(`.${CSS_CLASSES.OIL_LINE}`);

    // Reset all highlighting
    lines.forEach(line => {
      line.removeClass(CSS_CLASSES.OIL_LINE_MODIFIED);
      line.removeClass(CSS_CLASSES.OIL_LINE_DELETED);
      line.removeClass(CSS_CLASSES.OIL_LINE_ADDED);
    });

    // Apply highlighting based on mutations
    for (const mutation of mutations) {
      const lineIndex = mutation.entry.lineNumber - 1;
      const lineEl = lines[lineIndex];

      if (!lineEl) continue;

      switch (mutation.type) {
        case 'rename':
        case 'move':
          lineEl.addClass(CSS_CLASSES.OIL_LINE_MODIFIED);
          break;
        case 'delete':
          lineEl.addClass(CSS_CLASSES.OIL_LINE_DELETED);
          break;
        case 'create':
          lineEl.addClass(CSS_CLASSES.OIL_LINE_ADDED);
          break;
      }
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
  }
}
```

### Decision 4: CSS Styling for Oil View

**What:** Dedicated styles for the oil view with mutation state indicators

```css
/* styles.css */

/* Oil View Container */
.sugar-rush-oil-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--font-monospace);
}

/* Status Bar */
.oil-status-bar {
  padding: 4px 8px;
  background: var(--background-secondary);
  border-bottom: 1px solid var(--background-modifier-border);
  font-size: var(--font-ui-smaller);
  color: var(--text-muted);
}

.oil-status-bar.has-pending {
  background: var(--background-modifier-warning);
  color: var(--text-warning);
}

/* Editor Area */
.oil-editor {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  outline: none;
  cursor: text;
  line-height: 1.6;
}

/* Individual Lines */
.sugar-rush-oil-line {
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
}

.sugar-rush-oil-line:hover {
  background: var(--background-modifier-hover);
}

/* Directory styling */
.sugar-rush-directory {
  font-weight: 500;
}

/* File styling */
.sugar-rush-file {
  color: var(--text-normal);
}

/* Mutation state highlighting */
.sugar-rush-oil-line-modified {
  background: var(--background-modifier-warning) !important;
  border-left: 3px solid var(--text-warning);
}

.sugar-rush-oil-line-deleted {
  background: var(--background-modifier-error) !important;
  text-decoration: line-through;
  opacity: 0.7;
  border-left: 3px solid var(--text-error);
}

.sugar-rush-oil-line-added {
  background: var(--background-modifier-success) !important;
  border-left: 3px solid var(--text-success);
}

/* Placeholder for new entries */
.oil-line-placeholder {
  min-height: 1.6em;
  opacity: 0.3;
}

.oil-line-placeholder::before {
  content: '+ new file or folder...';
  font-style: italic;
}
```

### Decision 5: View Registration and Commands

**What:** Register view type and wire up commands in main plugin

```typescript
// src/main.ts (additions)

import { OilView } from './views/oil-view';
import { OIL_VIEW_TYPE } from './constants';

// In onload():
this.registerView(OIL_VIEW_TYPE, (leaf) => new OilView(leaf, this));

// Update command registration to actually open views
// src/commands/index.ts (updated)

import { OIL_VIEW_TYPE } from '../constants';

export function registerCommands(plugin: SugarRushPlugin): void {
  // Open Oil view for current file's directory
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW,
    name: 'Open file explorer (current directory)',
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      const path = activeFile?.parent?.path ?? '';
      await openOilView(plugin, path);
    },
  });

  // Open Oil view at vault root
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_ROOT,
    name: 'Open file explorer (vault root)',
    callback: async () => {
      await openOilView(plugin, '');
    },
  });

  // Open Oil view for current file's parent
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_CURRENT,
    name: 'Open file explorer (parent of current file)',
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      const path = activeFile?.parent?.path ?? '';
      await openOilView(plugin, path);
    },
  });
}

async function openOilView(plugin: SugarRushPlugin, path: string): Promise<void> {
  const { workspace } = plugin.app;

  // Check if oil view already exists
  const existing = workspace.getLeavesOfType(OIL_VIEW_TYPE);

  if (existing.length > 0) {
    // Focus existing and navigate to path
    workspace.revealLeaf(existing[0]);
    const view = existing[0].view as OilView;
    await view.navigateTo(path);
  } else {
    // Create new view in right split
    const leaf = workspace.getLeaf('split', 'vertical');
    await leaf.setViewState({ type: OIL_VIEW_TYPE, active: true });
    const view = leaf.view as OilView;
    await view.navigateTo(path);
  }
}
```

## Risks / Trade-offs

### Risk 1: ContentEditable Complexity
**Risk:** ContentEditable is notoriously finicky across browsers
**Mitigation:**
- Keep formatting minimal (plain text lines)
- Use CSS for visual styling rather than HTML elements
- Test thoroughly in Electron (Obsidian's runtime)
- Consider switching to textarea if issues arise

### Risk 2: Large Directory Performance
**Risk:** Directories with 1000+ files may be slow to render/parse
**Mitigation:**
- Virtual scrolling can be added later if needed
- Initial implementation targets typical vault sizes (<500 items per folder)
- Defer pagination/virtualization to future enhancement

### Risk 3: Lost Changes on View Close
**Risk:** User closes view with pending mutations → changes lost
**Mitigation:**
- Status bar clearly shows pending change count
- Could add confirmation dialog on close (defer to later)
- Changes are intentionally ephemeral (like oil.nvim)

### Risk 4: Concurrent Edits
**Risk:** External changes to files while oil view is open
**Mitigation:**
- Listen for vault change events
- Warn user if underlying files changed
- Defer complex merge handling to later

## Migration Plan

Not applicable - new feature implementation.

## Open Questions

1. **Trailing slash convention:** Should new directories be indicated by trailing `/` in name?
   - Decision: Yes, matches common shell conventions

2. **Multi-selection:** Should we support selecting multiple lines for bulk operations?
   - Decision: Defer to future enhancement

3. **Cursor position tracking:** How precisely do we need to track cursor?
   - Decision: Line-level granularity sufficient for MVP
