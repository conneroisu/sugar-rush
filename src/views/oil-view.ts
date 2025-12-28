import { TextFileView, WorkspaceLeaf, TFolder, Editor } from 'obsidian';
import type SugarRushPlugin from '../main';
import { OIL_VIEW_TYPE, CSS_CLASSES } from '../constants';
import type { OilEntry, OilViewState } from '../types';
import { OilBuffer } from './oil-buffer';
import { SplitManager } from './split-manager';
import { NavigationHistoryManager } from './navigation-history';
import { PreviewPane } from './preview-pane';

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
  state: OilViewState;
  private statusEl!: HTMLElement;
  private originalContent: string = '';
  splitManager: SplitManager;
  historyManager: NavigationHistoryManager;
  private previewPane: PreviewPane | null = null;
  private currentLineIndex: number = 0;
  private wrapperEl!: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: SugarRushPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.buffer = new OilBuffer(this.app, plugin.settings);
    this.splitManager = new SplitManager(this.app);
    this.historyManager = new NavigationHistoryManager();
    this.state = {
      currentPath: '',
      history: { entries: [], currentIndex: -1 },
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

    // Create flex wrapper for editor + preview layout
    this.wrapperEl = this.contentEl.createDiv({ cls: 'oil-wrapper' });

    // Move editor into wrapper (TextFileView creates editorEl)
    const editorEl = this.contentEl.querySelector('.cm-editor');
    if (editorEl) {
      const editorContainer = this.wrapperEl.createDiv({ cls: 'oil-editor-container' });
      editorContainer.appendChild(editorEl);
    }

    // Initialize preview pane if enabled in settings
    if (this.plugin.settings.preview.enabled) {
      this.initPreviewPane();
    }

    // Register our custom commands that work within the editor
    this.registerEditorCommands();

    // Register cursor change events for preview updates
    this.registerCursorEvents();

    // Load initial directory
    const activeFile = this.app.workspace.getActiveFile();
    const initialPath = activeFile?.parent?.path ?? '';
    await this.navigateTo(initialPath);
  }

  /**
   * Initialize the preview pane component
   */
  private initPreviewPane(): void {
    const { position, width } = this.plugin.settings.preview;
    this.previewPane = new PreviewPane(this.plugin, this.wrapperEl, {
      position,
      width,
    });
    this.addChild(this.previewPane);
  }

  /**
   * Register cursor change events for preview updates
   */
  private registerCursorEvents(): void {
    // Listen for click events to detect cursor position changes
    this.registerDomEvent(this.contentEl, 'click', () => {
      this.handleCursorChange();
    });

    // Listen for keyup events (cursor movement via keyboard)
    this.registerDomEvent(this.contentEl, 'keyup', (e: KeyboardEvent) => {
      // Only check cursor on navigation keys
      if (['ArrowUp', 'ArrowDown', 'j', 'k', 'g', 'G', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        this.handleCursorChange();
      }
    });
  }

  /**
   * Handle cursor position changes - update preview if line changed
   */
  private handleCursorChange(): void {
    if (!this.editor || !this.previewPane) return;

    const cursor = this.editor.getCursor();
    const newLineIndex = cursor.line;

    // Only update preview if we moved to a different line
    if (newLineIndex !== this.currentLineIndex) {
      this.currentLineIndex = newLineIndex;
      this.updatePreview();
    }
  }

  /**
   * Update preview with current line's entry
   */
  private updatePreview(): void {
    if (!this.previewPane) return;

    const entry = this.getCurrentEntry();
    this.previewPane.showPreview(entry);
  }

  /**
   * Toggle preview pane visibility
   */
  togglePreview(): void {
    if (!this.previewPane) {
      // Preview was disabled, enable it now
      this.initPreviewPane();
      this.updatePreview();
    } else {
      this.previewPane.toggle();
      // If just became visible, update with current selection
      if (this.previewPane.getIsVisible()) {
        this.updatePreview();
      }
    }
  }

  /**
   * Register oil-specific editor commands and keybindings
   */
  private registerEditorCommands(): void {
    // Register Mod+S to apply mutations (overrides normal save)
    this.registerDomEvent(this.contentEl, 'keydown', async (e: KeyboardEvent) => {
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

      // Ctrl+Enter on folder -> open in vertical split (right)
      if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey && !e.metaKey) {
        const currentEntry = this.getCurrentEntry();
        if (currentEntry?.isDirectory) {
          e.preventDefault();
          e.stopPropagation();
          const targetPath = this.buildPath(currentEntry.displayName);
          await this.splitManager.openInSplit('vertical', targetPath);
          return;
        }
      }

      // Ctrl+Shift+Enter on folder -> open in horizontal split (below)
      if (e.key === 'Enter' && e.ctrlKey && e.shiftKey && !e.metaKey) {
        const currentEntry = this.getCurrentEntry();
        if (currentEntry?.isDirectory) {
          e.preventDefault();
          e.stopPropagation();
          const targetPath = this.buildPath(currentEntry.displayName);
          await this.splitManager.openInSplit('horizontal', targetPath);
          return;
        }
      }

      // Alt+Left -> go back in history
      if (e.key === 'ArrowLeft' && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        await this.navigateBack();
        return;
      }

      // Alt+Right -> go forward in history
      if (e.key === 'ArrowRight' && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        await this.navigateForward();
        return;
      }

      // Toggle preview key (default: 'p')
      const togglePreviewKey = this.plugin.settings.keybindings.togglePreview;
      if (e.key === togglePreviewKey && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Only toggle if at beginning of line or line is empty (to not interfere with editing)
        const editor = this.editor;
        if (editor) {
          const cursor = editor.getCursor();
          const lineText = editor.getLine(cursor.line);
          // Only toggle if cursor is at start of line or line is empty
          if (cursor.ch === 0 || lineText.trim() === '') {
            e.preventDefault();
            this.togglePreview();
            return;
          }
        }
      }

      // Enter = Navigate into folder or open file (plain Enter, no modifiers)
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
   * Build full path from relative name
   */
  private buildPath(name: string): string {
    return this.state.currentPath
      ? `${this.state.currentPath}/${name}`
      : name;
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

    // Save scroll/cursor position before navigating
    if (this.state.currentPath !== path && this.editor) {
      const cursor = this.editor.getCursor();
      this.historyManager.updateCurrentScroll(
        this.editor.getScrollInfo().top,
        cursor.line
      );
    }

    // Push new path to history (only if different from current)
    if (this.state.currentPath !== path) {
      this.historyManager.push(path);
    }

    this.state.currentPath = path;
    this.state.pendingMutations = [];

    // Load directory contents into buffer
    await this.buffer.loadDirectory(path);

    // Render to text and set in editor
    const content = this.buffer.renderToText();
    this.originalContent = content;

    // Set the editor content and reset cursor
    if (this.editor) {
      this.editor.setValue(content);
      this.editor.setCursor(0, 0);
    }

    // Reset cursor index for preview tracking
    this.currentLineIndex = 0;

    // Update UI
    this.updateStatusBar();
    this.leaf.updateHeader();

    // Update preview with first entry
    if (this.previewPane && this.previewPane.getIsVisible()) {
      this.previewPane.clearPreview();
      this.updatePreview();
    }
  }

  /**
   * Navigate to parent directory
   */
  async navigateUp(): Promise<void> {
    if (this.state.currentPath === '') {
      // Already at vault root
      return;
    }

    // Warn if pending mutations exist
    if (this.state.pendingMutations.length > 0) {
      console.log('Discarding pending changes on parent navigation');
      this.state.pendingMutations = [];
    }

    const parentPath = this.state.currentPath.split('/').slice(0, -1).join('/');
    await this.navigateTo(parentPath);
  }

  /**
   * Navigate back in history.
   * Restores cursor position and scroll using editor API.
   */
  async navigateBack(): Promise<void> {
    const entry = this.historyManager.goBack();
    if (!entry) return;

    // Navigate without pushing to history (already in history)
    this.state.currentPath = entry.path;
    this.state.pendingMutations = [];

    await this.buffer.loadDirectory(entry.path);

    // Set content in editor
    const content = this.buffer.renderToText();
    this.originalContent = content;

    if (this.editor) {
      this.editor.setValue(content);

      // Restore cursor position
      if (entry.selectedLine !== undefined) {
        this.editor.setCursor(entry.selectedLine, 0);
        this.currentLineIndex = entry.selectedLine;
      } else {
        this.currentLineIndex = 0;
      }

      // Restore scroll position
      if (entry.scrollTop !== undefined) {
        this.editor.scrollTo(null, entry.scrollTop);
      }
    }

    this.updateStatusBar();
    this.leaf.updateHeader();

    // Update preview
    if (this.previewPane && this.previewPane.getIsVisible()) {
      this.previewPane.clearPreview();
      this.updatePreview();
    }
  }

  /**
   * Navigate forward in history.
   * Restores cursor position and scroll using editor API.
   */
  async navigateForward(): Promise<void> {
    const entry = this.historyManager.goForward();
    if (!entry) return;

    this.state.currentPath = entry.path;
    this.state.pendingMutations = [];

    await this.buffer.loadDirectory(entry.path);

    // Set content in editor
    const content = this.buffer.renderToText();
    this.originalContent = content;

    if (this.editor) {
      this.editor.setValue(content);

      // Restore cursor position
      if (entry.selectedLine !== undefined) {
        this.editor.setCursor(entry.selectedLine, 0);
        this.currentLineIndex = entry.selectedLine;
      } else {
        this.currentLineIndex = 0;
      }

      // Restore scroll position
      if (entry.scrollTop !== undefined) {
        this.editor.scrollTo(null, entry.scrollTop);
      }
    }

    this.updateStatusBar();
    this.leaf.updateHeader();

    // Update preview
    if (this.previewPane && this.previewPane.getIsVisible()) {
      this.previewPane.clearPreview();
      this.updatePreview();
    }
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
   * Get current line entry (public accessor for other features)
   */
  getCurrentEntry(): OilEntry | null {
    if (!this.editor) return null;

    const cursor = this.editor.getCursor();
    const lineText = this.editor.getLine(cursor.line);
    return this.buffer.getEntryForLine(lineText);
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
