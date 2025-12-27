# Design: Add Preview Support for Oil View

## Context

The preview feature enhances the oil view by showing file contents when the cursor is on a file line. This is a common pattern in file managers (Finder's Quick Look, Ranger, VS Code's file explorer) that improves browsing efficiency by letting users see content without fully opening files.

**Oil View Architecture:**
The oil view uses a TextFileView-based approach with Obsidian's native CodeMirror 6 editor:
- Extends `TextFileView` (not `ItemView`)
- Directory contents rendered as plain text: `folder-name/` for directories, `file.ext` for files
- Uses Obsidian's native editor with full vim mode support
- Access editor via `this.editor` property
- Use `editor.getCursor()` to get current line position
- Use `editor.getLine(lineNum)` to get line text
- Use `OilBuffer.getEntryForLine(lineText)` to resolve line text to `OilEntry`

**Constraints:**
- Must integrate with TextFileView-based oil view layout
- Must track cursor position via CodeMirror editor API
- Must not block or slow down directory navigation
- Must handle various file types gracefully
- Must respect Obsidian's theming and styling
- Must use Obsidian's caching APIs for performance
- Must work with vim mode keybindings (j/k navigation, etc.)
- Desktop-only (can use Electron APIs if needed)

**Stakeholders:**
- Users browsing directories looking for specific content
- Users reviewing images in folders
- Users exploring unfamiliar vault structures
- Vim users navigating with j/k motions

## Goals / Non-Goals

**Goals:**
- Show contextual preview when cursor is on a file line
- Support markdown rendering using Obsidian's built-in renderer
- Support image display for common image formats
- Show plain text preview for other file types
- Show folder metadata for directories
- Configurable preview position and size
- Toggle preview on/off with keyboard shortcut

**Non-Goals:**
- Preview of binary files (PDFs, videos, etc.) - defer to future
- Edit preview content - preview is read-only
- Preview multiple files at once
- Syntax highlighting for code files - plain text only for MVP
- Preview of external URLs or network resources

## Decisions

### Decision 1: Preview Pane Architecture

**What:** Create a separate PreviewPane class that manages its own container within the OilView

**Why:**
- Clean separation of concerns from oil view logic
- Can be easily toggled on/off
- Can be resized independently
- Supports different positioning (right/bottom)

**Trade-offs:**
- Slightly more complex view structure
- Must coordinate with oil view for cursor events

```typescript
// src/views/preview-pane.ts

import { Component, MarkdownRenderer, TFile, TFolder } from 'obsidian';
import type SugarRushPlugin from '../main';
import type { OilEntry } from '../types';
import { CSS_CLASSES } from '../constants';

export interface PreviewPaneOptions {
  position: 'right' | 'bottom';
  width: number; // percentage (0-100)
}

export class PreviewPane extends Component {
  private plugin: SugarRushPlugin;
  private containerEl: HTMLElement;
  private contentEl: HTMLElement;
  private currentEntry: OilEntry | null = null;
  private options: PreviewPaneOptions;
  private isVisible: boolean = true;

  constructor(
    plugin: SugarRushPlugin,
    parentEl: HTMLElement,
    options: PreviewPaneOptions
  ) {
    super();
    this.plugin = plugin;
    this.options = options;

    // Create preview container
    this.containerEl = parentEl.createDiv({
      cls: CSS_CLASSES.PREVIEW_PANE,
    });

    // Create content area
    this.contentEl = this.containerEl.createDiv({
      cls: 'preview-content',
    });

    // Apply initial positioning
    this.updateLayout();
  }

  /**
   * Update preview layout based on position setting
   */
  updateLayout(): void {
    const { position, width } = this.options;

    this.containerEl.removeClass('preview-right', 'preview-bottom');
    this.containerEl.addClass(`preview-${position}`);

    if (position === 'right') {
      this.containerEl.style.width = `${width}%`;
      this.containerEl.style.height = '100%';
    } else {
      this.containerEl.style.width = '100%';
      this.containerEl.style.height = `${width}%`;
    }
  }

  /**
   * Show preview for a specific entry
   */
  async showPreview(entry: OilEntry | null): Promise<void> {
    if (!entry || !this.isVisible) {
      this.clearPreview();
      return;
    }

    // Avoid re-rendering same entry
    if (this.currentEntry?.originalPath === entry.originalPath) {
      return;
    }

    this.currentEntry = entry;
    this.contentEl.empty();

    if (entry.isDirectory && entry.folder) {
      await this.renderFolderPreview(entry.folder);
    } else if (entry.file) {
      await this.renderFilePreview(entry.file);
    } else {
      this.renderPlaceholder('No preview available');
    }
  }

  /**
   * Render preview for a folder
   */
  private async renderFolderPreview(folder: TFolder): Promise<void> {
    const headerEl = this.contentEl.createDiv({ cls: 'preview-header' });
    headerEl.createEl('h3', { text: `📁 ${folder.name}` });

    const statsEl = this.contentEl.createDiv({ cls: 'preview-stats' });

    // Count children
    let fileCount = 0;
    let folderCount = 0;
    let totalSize = 0;

    const countRecursive = (f: TFolder) => {
      for (const child of f.children) {
        if (child instanceof TFolder) {
          folderCount++;
        } else if (child instanceof TFile) {
          fileCount++;
          totalSize += child.stat.size;
        }
      }
    };

    countRecursive(folder);

    // Display stats
    statsEl.createDiv({ text: `📄 ${fileCount} files` });
    statsEl.createDiv({ text: `📁 ${folderCount} folders` });
    statsEl.createDiv({ text: `💾 ${this.formatSize(totalSize)} total` });

    // Show recent files
    const recentEl = this.contentEl.createDiv({ cls: 'preview-recent' });
    recentEl.createEl('h4', { text: 'Contents' });

    const fileList = recentEl.createEl('ul');
    const children = folder.children.slice(0, 10); // First 10 items

    for (const child of children) {
      const li = fileList.createEl('li');
      const icon = child instanceof TFolder ? '📁' : '📄';
      li.setText(`${icon} ${child.name}`);
    }

    if (folder.children.length > 10) {
      fileList.createEl('li', {
        text: `... and ${folder.children.length - 10} more`,
        cls: 'preview-more',
      });
    }
  }

  /**
   * Render preview for a file based on its type
   */
  private async renderFilePreview(file: TFile): Promise<void> {
    const extension = file.extension.toLowerCase();

    // Image files
    if (this.isImageFile(extension)) {
      await this.renderImagePreview(file);
      return;
    }

    // Markdown files
    if (extension === 'md') {
      await this.renderMarkdownPreview(file);
      return;
    }

    // All other files - plain text preview
    await this.renderTextPreview(file);
  }

  /**
   * Check if file extension is an image
   */
  private isImageFile(extension: string): boolean {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'];
    return imageExtensions.includes(extension);
  }

  /**
   * Render image preview
   */
  private async renderImagePreview(file: TFile): Promise<void> {
    const headerEl = this.contentEl.createDiv({ cls: 'preview-header' });
    headerEl.createEl('h3', { text: `🖼️ ${file.name}` });

    // Get resource path for the image
    const resourcePath = this.plugin.app.vault.getResourcePath(file);

    const imgContainer = this.contentEl.createDiv({ cls: 'preview-image-container' });
    const img = imgContainer.createEl('img', {
      attr: {
        src: resourcePath,
        alt: file.name,
      },
      cls: 'preview-image',
    });

    // Add image dimensions after load
    img.onload = () => {
      const infoEl = this.contentEl.createDiv({ cls: 'preview-info' });
      infoEl.createDiv({ text: `Dimensions: ${img.naturalWidth} x ${img.naturalHeight}` });
      infoEl.createDiv({ text: `Size: ${this.formatSize(file.stat.size)}` });
    };

    img.onerror = () => {
      imgContainer.empty();
      imgContainer.createDiv({
        text: 'Failed to load image',
        cls: 'preview-error',
      });
    };
  }

  /**
   * Render markdown preview using Obsidian's renderer
   */
  private async renderMarkdownPreview(file: TFile): Promise<void> {
    const headerEl = this.contentEl.createDiv({ cls: 'preview-header' });
    headerEl.createEl('h3', { text: `📝 ${file.name}` });

    // Read file content using cached read for performance
    const content = await this.plugin.app.vault.cachedRead(file);

    // Truncate if very long
    const maxLength = 5000;
    const displayContent = content.length > maxLength
      ? content.slice(0, maxLength) + '\n\n... (truncated)'
      : content;

    // Create markdown render container
    const markdownEl = this.contentEl.createDiv({ cls: 'preview-markdown' });

    // Use Obsidian's markdown renderer
    await MarkdownRenderer.render(
      this.plugin.app,
      displayContent,
      markdownEl,
      file.path,
      this // Component for lifecycle management
    );
  }

  /**
   * Render plain text preview (first N lines)
   */
  private async renderTextPreview(file: TFile): Promise<void> {
    const headerEl = this.contentEl.createDiv({ cls: 'preview-header' });
    headerEl.createEl('h3', { text: `📄 ${file.name}` });

    // Show file info
    const infoEl = this.contentEl.createDiv({ cls: 'preview-info' });
    infoEl.createDiv({ text: `Type: ${file.extension.toUpperCase() || 'Unknown'}` });
    infoEl.createDiv({ text: `Size: ${this.formatSize(file.stat.size)}` });
    infoEl.createDiv({
      text: `Modified: ${new Date(file.stat.mtime).toLocaleString()}`,
    });

    // Read and display first N lines
    try {
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split('\n');
      const maxLines = 50;
      const previewLines = lines.slice(0, maxLines);

      const codeEl = this.contentEl.createEl('pre', { cls: 'preview-text' });
      const codeContent = codeEl.createEl('code');
      codeContent.setText(previewLines.join('\n'));

      if (lines.length > maxLines) {
        this.contentEl.createDiv({
          text: `... ${lines.length - maxLines} more lines`,
          cls: 'preview-more',
        });
      }
    } catch (error) {
      this.contentEl.createDiv({
        text: 'Unable to read file content',
        cls: 'preview-error',
      });
    }
  }

  /**
   * Clear preview content
   */
  clearPreview(): void {
    this.currentEntry = null;
    this.contentEl.empty();
    this.renderPlaceholder('Select a file to preview');
  }

  /**
   * Render placeholder message
   */
  private renderPlaceholder(message: string): void {
    this.contentEl.empty();
    this.contentEl.createDiv({
      text: message,
      cls: 'preview-placeholder',
    });
  }

  /**
   * Toggle preview visibility
   */
  toggle(): void {
    this.isVisible = !this.isVisible;
    this.containerEl.toggle(this.isVisible);

    if (!this.isVisible) {
      this.clearPreview();
    }
  }

  /**
   * Set preview visibility
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.containerEl.toggle(visible);
  }

  /**
   * Check if preview is visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Update options and re-apply layout
   */
  updateOptions(options: Partial<PreviewPaneOptions>): void {
    this.options = { ...this.options, ...options };
    this.updateLayout();
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  /**
   * Clean up on unload
   */
  onunload(): void {
    this.containerEl.remove();
  }
}
```

### Decision 2: Oil View Integration (TextFileView + CodeMirror Editor)

**What:** Extend OilView to manage preview pane and track cursor position using Obsidian's native editor

**Why:**
- OilView extends TextFileView, providing access to CodeMirror editor via `this.editor`
- Preview needs to know which line is selected using editor cursor position
- Preview pane lifecycle tied to oil view
- Must integrate with vim mode and native editor keybindings

**Key Architecture Points:**
- OilView extends TextFileView (not ItemView)
- Uses Obsidian's native CodeMirror 6 editor with vim mode support
- Access editor via `this.editor` property
- Content is plain text: `folder-name/` for directories, `file.ext` for files
- Use `OilBuffer.getEntryForLine(lineText)` to resolve line text to OilEntry

```typescript
// src/views/oil-view.ts (additions for preview support)

import { PreviewPane } from './preview-pane';
import { EditorView } from '@codemirror/view';

// In OilView class, add these properties:
private previewPane: PreviewPane | null = null;
private currentPreviewLine: number = -1;

// In onOpen(), after super.onOpen():
async onOpen(): Promise<void> {
  await super.onOpen();

  // ... existing setup code (status bar, etc.) ...

  // Create wrapper for editor and preview layout
  const wrapperEl = this.contentEl.createDiv({ cls: 'oil-wrapper' });

  // The editor container is already created by TextFileView
  // We need to reparent it into our wrapper
  const editorContainer = this.contentEl.querySelector('.cm-editor')?.parentElement;
  if (editorContainer) {
    wrapperEl.appendChild(editorContainer);
  }

  // Create preview pane if enabled
  if (this.plugin.settings.preview.enabled) {
    this.previewPane = new PreviewPane(
      this.plugin,
      wrapperEl,
      {
        position: this.plugin.settings.preview.position,
        width: this.plugin.settings.preview.width,
      }
    );
    this.addChild(this.previewPane);
  }

  // Track cursor movement via CodeMirror editor events
  this.registerEditorCursorEvents();
}

/**
 * Register editor events to track cursor position for preview updates.
 * Uses CodeMirror's updateListener to detect cursor changes.
 */
private registerEditorCursorEvents(): void {
  if (!this.editor) return;

  // Get the underlying CodeMirror EditorView
  // @ts-ignore - accessing internal CM6 view
  const cmView: EditorView | undefined = this.editor.cm;

  if (cmView) {
    // Use CodeMirror's update listener for cursor changes
    const extension = EditorView.updateListener.of((update) => {
      if (update.selectionSet || update.docChanged) {
        this.handleCursorChange();
      }
    });

    // Note: In practice, we may need to dispatch this extension
    // during editor initialization. Alternative approach below.
  }

  // Alternative: Use DOM events on the editor container
  // This works reliably with both mouse and keyboard navigation
  const editorEl = this.contentEl.querySelector('.cm-editor');
  if (editorEl) {
    // Mouse clicks
    this.registerDomEvent(editorEl as HTMLElement, 'mouseup', () => {
      this.handleCursorChange();
    });

    // Keyboard navigation (arrows, vim motions, etc.)
    this.registerDomEvent(editorEl as HTMLElement, 'keyup', (e: KeyboardEvent) => {
      // Update on navigation keys
      const navKeys = ['ArrowUp', 'ArrowDown', 'j', 'k', 'g', 'G', 'Enter', 'Home', 'End', 'PageUp', 'PageDown'];
      if (navKeys.includes(e.key)) {
        this.handleCursorChange();
      }
    });
  }
}

/**
 * Handle cursor position changes to update preview.
 * Uses editor.getCursor() to get current line, then OilBuffer.getEntryForLine()
 * to resolve the line text to an OilEntry.
 */
private handleCursorChange(): void {
  if (!this.editor || !this.previewPane) return;

  // Get current cursor position from editor
  const cursor = this.editor.getCursor();
  const currentLine = cursor.line;

  // Skip if same line (avoid redundant updates)
  if (currentLine === this.currentPreviewLine) return;
  this.currentPreviewLine = currentLine;

  // Get the text content of the current line
  const lineText = this.editor.getLine(currentLine);

  // Use OilBuffer to resolve line text to entry
  const entry = this.buffer.getEntryForLine(lineText);

  // Update preview with the entry (or null if line is empty/invalid)
  this.previewPane.showPreview(entry);
}

/**
 * Get current line entry for preview (public accessor)
 */
getCurrentLineEntry(): OilEntry | null {
  if (!this.editor) return null;

  const cursor = this.editor.getCursor();
  const lineText = this.editor.getLine(cursor.line);
  return this.buffer.getEntryForLine(lineText);
}

// In registerEditorCommands(), add preview toggle alongside other keybindings:
private registerEditorCommands(): void {
  this.registerDomEvent(this.contentEl, 'keydown', (e: KeyboardEvent) => {
    // ... existing Mod+S, Escape, -, Enter handlers ...

    // Toggle preview with configured key (default: 'p')
    const toggleKey = this.plugin.settings.keybindings.togglePreview ?? 'p';
    if (e.key === toggleKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      // Only toggle if not in insert mode or at start of line
      const cursor = this.editor?.getCursor();
      const lineText = this.editor?.getLine(cursor?.line ?? 0) ?? '';
      if (cursor?.ch === 0 || lineText.trim() === '') {
        e.preventDefault();
        this.togglePreview();
        return;
      }
    }
  });
}

/**
 * Toggle preview pane visibility
 */
togglePreview(): void {
  if (this.previewPane) {
    this.previewPane.toggle();

    // If now visible, update with current selection
    if (this.previewPane.getIsVisible()) {
      const entry = this.getCurrentLineEntry();
      this.previewPane.showPreview(entry);
    }
  }
}

// In navigateTo(), after setting editor content:
async navigateTo(path: string): Promise<void> {
  // ... existing navigation code ...

  // Set the editor content
  if (this.editor) {
    this.editor.setValue(content);
    this.editor.setCursor(0, 0);
  }

  // Reset preview line tracking and update preview with first entry
  this.currentPreviewLine = 0;
  if (this.previewPane) {
    const firstLineText = this.editor?.getLine(0) ?? '';
    const firstEntry = this.buffer.getEntryForLine(firstLineText);
    this.previewPane.showPreview(firstEntry);
  }

  // ... rest of navigation code ...
}

// In onClose():
async onClose(): Promise<void> {
  // Preview pane cleanup handled automatically by addChild()
  await super.onClose();
}
```

**OilBuffer.getEntryForLine() Integration:**

The OilBuffer already provides `getEntryForLine(lineText)` which parses the line text and matches it to the original entry:

```typescript
// From oil-buffer.ts (already exists)
/**
 * Get entry for a given line text
 */
getEntryForLine(lineText: string): OilEntry | null {
  const name = lineText.trim().replace(/\/$/, '');
  return this.originalEntries.find(e => e.displayName === name) ?? null;
}
```

This method:
1. Trims whitespace from the line
2. Removes trailing `/` (directory indicator)
3. Matches against original entries by display name
4. Returns the OilEntry with full metadata (file/folder references, paths, etc.)

### Decision 3: CSS Styling for Preview Pane

**What:** Dedicated styles for the preview pane with responsive layout

**Why:**
- Consistent with Obsidian theming
- Supports both right and bottom positioning
- Handles various content types appropriately

```css
/* styles.css (additions for preview support) */

/* Wrapper for editor + preview layout */
.oil-wrapper {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* Preview positioned right */
.oil-wrapper:has(.preview-right) {
  flex-direction: row;
}

/* Preview positioned bottom */
.oil-wrapper:has(.preview-bottom) {
  flex-direction: column;
}

/* Editor takes remaining space */
.oil-wrapper .oil-editor {
  flex: 1;
  min-width: 200px;
  min-height: 100px;
  overflow: auto;
}

/* Preview Pane Base */
.sugar-rush-preview-pane {
  border-left: 1px solid var(--background-modifier-border);
  background: var(--background-primary);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Preview positioned right */
.sugar-rush-preview-pane.preview-right {
  border-left: 1px solid var(--background-modifier-border);
  border-top: none;
  min-width: 200px;
  max-width: 60%;
}

/* Preview positioned bottom */
.sugar-rush-preview-pane.preview-bottom {
  border-left: none;
  border-top: 1px solid var(--background-modifier-border);
  min-height: 100px;
  max-height: 60%;
}

/* Preview Content Area */
.preview-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

/* Preview Header */
.preview-header {
  border-bottom: 1px solid var(--background-modifier-border);
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-ui-medium);
  font-weight: 600;
  color: var(--text-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Preview Stats (for folders) */
.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  color: var(--text-muted);
  font-size: var(--font-ui-smaller);
}

/* Preview Recent Files List */
.preview-recent {
  margin-top: 12px;
}

.preview-recent h4 {
  margin: 0 0 8px 0;
  font-size: var(--font-ui-small);
  font-weight: 500;
  color: var(--text-muted);
}

.preview-recent ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: none;
}

.preview-recent li {
  padding: 2px 0;
  font-size: var(--font-ui-smaller);
  color: var(--text-normal);
}

.preview-more {
  color: var(--text-muted);
  font-style: italic;
}

/* Preview Image Container */
.preview-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
  max-height: 300px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 4px;
  background: var(--background-secondary);
}

/* Preview Info (file metadata) */
.preview-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
  padding: 8px;
  background: var(--background-secondary);
  border-radius: 4px;
  font-size: var(--font-ui-smaller);
  color: var(--text-muted);
}

/* Preview Markdown Content */
.preview-markdown {
  font-size: var(--font-ui-small);
  line-height: 1.5;
}

.preview-markdown h1,
.preview-markdown h2,
.preview-markdown h3 {
  margin-top: 12px;
  margin-bottom: 8px;
}

.preview-markdown p {
  margin: 8px 0;
}

.preview-markdown code {
  background: var(--background-secondary);
  padding: 2px 4px;
  border-radius: 3px;
}

.preview-markdown pre {
  background: var(--background-secondary);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

/* Preview Plain Text */
.preview-text {
  background: var(--background-secondary);
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  font-family: var(--font-monospace);
  font-size: var(--font-ui-smaller);
  line-height: 1.4;
  max-height: 400px;
}

.preview-text code {
  white-space: pre;
  color: var(--text-normal);
}

/* Preview Placeholder */
.preview-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-muted);
  font-style: italic;
}

/* Preview Error */
.preview-error {
  color: var(--text-error);
  padding: 12px;
  text-align: center;
}

/* Resize handle (future enhancement) */
.preview-resize-handle {
  position: absolute;
  background: transparent;
  transition: background 0.2s;
}

.preview-resize-handle:hover {
  background: var(--interactive-accent);
}

.preview-right .preview-resize-handle {
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
}

.preview-bottom .preview-resize-handle {
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
}
```

### Decision 4: Type Definitions

**What:** Add preview-related types to the types module

```typescript
// src/types.ts (additions)

/**
 * Preview pane configuration
 */
export interface PreviewConfig {
  /** Whether preview is enabled */
  enabled: boolean;
  /** Position of preview pane */
  position: 'right' | 'bottom';
  /** Width (for right) or height (for bottom) as percentage */
  width: number;
}

/**
 * Content types for preview rendering
 */
export type PreviewContentType = 'markdown' | 'image' | 'text' | 'folder' | 'unsupported';

/**
 * Preview state
 */
export interface PreviewState {
  /** Currently previewed entry */
  currentEntry: OilEntry | null;
  /** Whether preview is visible */
  isVisible: boolean;
  /** Content type being displayed */
  contentType: PreviewContentType;
}
```

### Decision 5: Constants for Preview

**What:** Add preview-related CSS classes to constants

```typescript
// src/constants.ts (additions)

export const CSS_CLASSES = {
  // ... existing classes ...

  // Preview pane classes
  PREVIEW_PANE: 'sugar-rush-preview-pane',
  PREVIEW_RIGHT: 'preview-right',
  PREVIEW_BOTTOM: 'preview-bottom',
  PREVIEW_CONTENT: 'preview-content',
  PREVIEW_HEADER: 'preview-header',
  PREVIEW_IMAGE: 'preview-image',
  PREVIEW_MARKDOWN: 'preview-markdown',
  PREVIEW_TEXT: 'preview-text',
  PREVIEW_PLACEHOLDER: 'preview-placeholder',
} as const;

// Image extensions supported for preview
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'] as const;

// Maximum content length before truncation
export const PREVIEW_MAX_LENGTH = 5000;
export const PREVIEW_MAX_LINES = 50;
```

### Decision 6: Settings Tab Updates

**What:** Ensure preview settings section is fully functional

```typescript
// src/settings-tab.ts (preview section - already exists, ensure complete)

// Preview Section
containerEl.createEl('h2', { text: 'Preview' });

new Setting(containerEl)
  .setName('Enable preview')
  .setDesc('Show file preview when selecting files in the oil view')
  .addToggle(toggle => toggle
    .setValue(this.plugin.settings.preview.enabled)
    .onChange(async (value) => {
      this.plugin.settings.preview.enabled = value;
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Preview position')
  .setDesc('Where to show the preview pane relative to the file list')
  .addDropdown(dropdown => dropdown
    .addOption('right', 'Right')
    .addOption('bottom', 'Bottom')
    .setValue(this.plugin.settings.preview.position)
    .onChange(async (value: 'right' | 'bottom') => {
      this.plugin.settings.preview.position = value;
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Preview size')
  .setDesc('Width (when right) or height (when bottom) as a percentage (10-60)')
  .addSlider(slider => slider
    .setLimits(10, 60, 5)
    .setValue(this.plugin.settings.preview.width)
    .setDynamicTooltip()
    .onChange(async (value) => {
      this.plugin.settings.preview.width = value;
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Toggle preview key')
  .setDesc('Key to toggle preview visibility within oil view')
  .addText(text => text
    .setPlaceholder('p')
    .setValue(this.plugin.settings.keybindings.togglePreview)
    .onChange(async (value) => {
      this.plugin.settings.keybindings.togglePreview = value || 'p';
      await this.plugin.saveSettings();
    }));
```

## Risks / Trade-offs

### Risk 1: Large File Performance
**Risk:** Previewing large files (multi-MB text files) could cause lag
**Mitigation:**
- Use `cachedRead` for efficient file access
- Truncate content at configurable limit (5000 chars for markdown, 50 lines for text)
- Show truncation indicator
- Future: Add streaming/virtualization for very large files

### Risk 2: Image Memory Usage
**Risk:** Multiple large images could consume significant memory
**Mitigation:**
- Only load one image at a time (clear previous on navigation)
- Images are loaded via URL, browser handles caching
- Could add lazy loading in future

### Risk 3: Markdown Rendering Security
**Risk:** Malicious markdown could execute scripts
**Mitigation:**
- Use Obsidian's built-in MarkdownRenderer which sanitizes content
- Preview is read-only
- Same sandbox as regular Obsidian notes

### Risk 4: Editor Cursor Tracking
**Risk:** Cursor position detection needs to work reliably with vim mode and all editor keybindings
**Mitigation:**
- Use `editor.getCursor()` to get current line number (reliable API)
- Use `editor.getLine(lineNum)` to get line text content
- Track cursor via DOM events (mouseup, keyup) on `.cm-editor` element
- Navigation keys list covers standard and vim motions: ArrowUp/Down, j/k, g/G, etc.
- Fall back to first entry if line text doesn't match any entry
- `OilBuffer.getEntryForLine()` handles edge cases (empty lines, whitespace)

### Risk 5: Layout Conflicts
**Risk:** Preview pane might conflict with existing oil view styles
**Mitigation:**
- Use flex layout for responsive behavior
- Set min/max sizes to prevent extreme cases
- Test with both position options

## Migration Plan

Not applicable - new feature implementation. The preview settings already exist in the core-plugin settings schema from `add-core-plugin-infrastructure`, so no migration is needed.

## Open Questions

1. **Resize handle:** Should users be able to drag-resize the preview pane?
   - Decision: Defer to future enhancement. Initial version uses settings slider.

2. **Preview caching:** Should we cache rendered previews?
   - Decision: No caching initially. File content changes should reflect immediately.

3. **Syntax highlighting:** Should code files get syntax highlighting?
   - Decision: Defer. Plain text preview for MVP. Could add highlight.js later.

4. **PDF preview:** Should PDFs be supported?
   - Decision: Defer. Obsidian has PDF support but integration is complex.

5. **Auto-scroll in markdown preview:** Should long markdown auto-scroll?
   - Decision: No auto-scroll. Let user scroll manually.
