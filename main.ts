import { 
  App, 
  Editor, 
  MarkdownView, 
  Modal, 
  Notice, 
  Plugin, 
  PluginSettingTab, 
  Setting,
  WorkspaceLeaf,
  TFile,
  TFolder,
  Component,
  TextFileView,
  ViewStateResult,
  debounce
} from 'obsidian';

import { BufferParser, FileOperation, DirectoryLine } from './src/buffer-parser';
import { FileOperationsManager, OperationResult } from './src/file-operations-manager';

// Plugin settings interface
interface SugarRushSettings {
  // Navigation behavior
  enableMinusKeyNavigation: boolean;
  enableContinuousNavigation: boolean;
  returnToFileHotkey: string;
  
  // Display options
  showFileExtensions: boolean;
  showHiddenFiles: boolean;
  indentationStyle: 'spaces' | 'tabs';
  indentationSize: number;
  
  // Vim integration
  enableCustomVimCommands: boolean;
  customKeybindings: Record<string, string>;
  
  // Performance
  lazyLoadThreshold: number;
  debounceDelay: number;
  
  // Safety
  confirmDeletions: boolean;
  enableUndo: boolean;
  maxUndoHistory: number;
}

const DEFAULT_SETTINGS: SugarRushSettings = {
  enableMinusKeyNavigation: true,
  enableContinuousNavigation: true,
  returnToFileHotkey: 'Ctrl+^',
  showFileExtensions: true,
  showHiddenFiles: false,
  indentationStyle: 'spaces',
  indentationSize: 2,
  enableCustomVimCommands: true,
  customKeybindings: {},
  lazyLoadThreshold: 1000,
  debounceDelay: 500,
  confirmDeletions: true,
  enableUndo: true,
  maxUndoHistory: 50
};

// File operation types
interface FileOperation {
  type: 'rename' | 'move' | 'delete' | 'create';
  path: string;
  oldPath?: string;
  newPath?: string;
}

interface DirectoryLine {
  path: string;
  name: string;
  isFolder: boolean;
  depth: number;
  lineNumber: number;
  originalPath?: string;
  existsInOriginal?: boolean;
}

// Navigation Engine - handles the core navigation logic
class NavigationEngine {
  private app: App;
  private plugin: SugarRushPlugin;
  private previousViewState: any = null;

  constructor(app: App, plugin: SugarRushPlugin) {
    this.app = app;
    this.plugin = plugin;
  }

  async handleMinusKey(evt: KeyboardEvent): Promise<boolean> {
    // Only trigger in markdown views when vim mode is in normal mode
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return false;
    
    // Check if we're in vim normal mode (if vim mode is enabled)
    if (!this.isInNormalMode(activeView)) return false;
    
    // Store current view state for return navigation
    this.previousViewState = {
      file: activeView.file,
      cursor: activeView.editor.getCursor(),
      scrollTop: activeView.editor.getScrollInfo().top
    };
    
    // Get current file's parent directory
    const file = activeView.file;
    if (!file) return false;
    
    const parentPath = file.parent?.path || '/';
    
    // Transform current pane into directory view
    await this.showDirectoryInPane(parentPath, activeView.leaf);
    
    return true;
  }

  private isInNormalMode(view: MarkdownView): boolean {
    const vimMode = (this.app.vault as any).config?.vimMode;
    if (!vimMode) return true; // Always work if vim mode is disabled
    
    // Check CodeMirror vim state
    const cm = (view.editor as any).cm;
    if (!cm || !cm.state?.vim) return true;
    
    return cm.state.vim.mode === 'normal';
  }

  private async showDirectoryInPane(path: string, leaf: WorkspaceLeaf): Promise<void> {
    try {
      await leaf.setViewState({
        type: 'directory-edit',
        state: { path: path }
      });
    } catch (error) {
      console.error('Sugar Rush: Failed to show directory view:', error);
      new Notice('Failed to open directory view');
    }
  }

  async returnToPreviousFile(): Promise<void> {
    if (!this.previousViewState) return;
    
    const { file, cursor, scrollTop } = this.previousViewState;
    const leaf = this.app.workspace.getActiveLeaf();
    if (!leaf) return;
    
    try {
      await leaf.openFile(file);
      
      // Restore cursor and scroll position
      setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          view.editor.setCursor(cursor);
          view.editor.scrollTo(null, scrollTop);
        }
      }, 50);
      
      this.previousViewState = null;
    } catch (error) {
      console.error('Sugar Rush: Failed to return to previous file:', error);
      new Notice('Failed to return to previous file');
    }
  }
}

// Directory Edit View - custom view for editing directories as buffers
class DirectoryEditView extends TextFileView {
  private directoryPath: string;
  private originalContent: string = '';
  private navigationEngine: NavigationEngine;
  private isLoading: boolean = false;
  private bufferParser: BufferParser;
  private fileOperationsManager: FileOperationsManager;
  private plugin: SugarRushPlugin;
  private debouncedSave: () => void;
  private hasUnsavedChanges: boolean = false;

  constructor(leaf: WorkspaceLeaf, app: App, navigationEngine: NavigationEngine, plugin: SugarRushPlugin) {
    super(leaf);
    this.navigation = false; // Disable default navigation
    this.navigationEngine = navigationEngine;
    this.plugin = plugin;
    this.bufferParser = new BufferParser();
    this.fileOperationsManager = new FileOperationsManager(app, plugin.settings.maxUndoHistory);
    
    // Set up debounced save
    this.debouncedSave = debounce(async () => {
      await this.executePendingOperations();
    }, plugin.settings.debounceDelay);
  }

  getViewType(): string {
    return 'directory-edit';
  }

  getDisplayText(): string {
    return this.directoryPath || 'Directory';
  }

  getIcon(): string {
    return 'folder';
  }

  async onLoadFile(file: TFile): Promise<string> {
    // This method is called by TextFileView, but we override it for directory handling
    return '';
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    
    const state = this.leaf.getViewState().state as any;
    if (state?.path) {
      this.directoryPath = state.path;
      await this.loadDirectoryContents();
    }
  }

  async onClose(): Promise<void> {
    await super.onClose();
  }

  private async loadDirectoryContents(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const files = await this.getDirectoryFiles(this.directoryPath);
      const content = this.bufferParser.formatDirectoryAsBuffer(files, this.plugin.settings.showFileExtensions);
      
      this.originalContent = content;
      this.setViewData(content, false);
      this.hasUnsavedChanges = false;
      
      // Enable vim mode for this view if vim mode is enabled globally
      this.enableVimModeIfNeeded();
      
      // Set up content change monitoring for auto-save
      this.setupChangeMonitoring();
      
    } catch (error) {
      console.error('Sugar Rush: Failed to load directory contents:', error);
      this.setViewData('Error loading directory contents', false);
    } finally {
      this.isLoading = false;
    }
  }

  private async getDirectoryFiles(path: string): Promise<(TFile | TFolder)[]> {
    const folder = this.app.vault.getAbstractFileByPath(path);
    if (!folder || !(folder instanceof TFolder)) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    const files: (TFile | TFolder)[] = [];
    
    // Add parent directory entry (unless we're at root)
    if (folder.parent) {
      files.push({
        name: '..',
        path: folder.parent.path,
        parent: folder.parent.parent,
        vault: folder.vault
      } as TFolder);
    }

    // Add folders first, then files
    const children = folder.children.slice();
    children.sort((a, b) => {
      if (a instanceof TFolder && b instanceof TFile) return -1;
      if (a instanceof TFile && b instanceof TFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    files.push(...children);
    return files;
  }

  private setupChangeMonitoring(): void {
    const editor = (this as any).editor;
    if (!editor) return;

    // Monitor content changes for auto-save
    editor.on('change', () => {
      this.hasUnsavedChanges = true;
      this.debouncedSave();
    });
  }

  private async executePendingOperations(): Promise<void> {
    if (!this.hasUnsavedChanges) return;

    try {
      const currentContent = this.getViewData();
      const operations = this.bufferParser.parseFileOperations(
        this.originalContent, 
        currentContent, 
        this.directoryPath
      );

      if (operations.length === 0) {
        this.hasUnsavedChanges = false;
        return;
      }

      // Validate operations before execution
      const validation = this.bufferParser.validateOperations(operations);
      if (!validation.valid) {
        new Notice(`Invalid operations: ${validation.errors.join(', ')}`);
        return;
      }

      // Execute operations
      const results = await this.fileOperationsManager.executeFileOperations(operations);
      
      // Update original content and reload if operations were successful
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        this.hasUnsavedChanges = false;
        await this.loadDirectoryContents(); // Reload to reflect changes
      } else {
        // Show errors for failed operations
        const errors = results.filter(r => !r.success).map(r => r.error);
        new Notice(`Some operations failed: ${errors.join(', ')}`);
      }

    } catch (error) {
      console.error('Sugar Rush: Failed to execute pending operations:', error);
      new Notice('Failed to execute file operations');
    }
  }

  private enableVimModeIfNeeded(): void {
    const vimMode = (this.app.vault as any).config?.vimMode;
    if (!vimMode) return;

    const editor = (this as any).editor;
    if (!editor?.cm) return;

    try {
      const cm = editor.cm;
      cm.setOption('keyMap', 'vim');

      // Add custom keybindings for directory navigation
      this.setupDirectoryKeybindings(cm);
      
    } catch (error) {
      console.error('Sugar Rush: Failed to enable vim mode:', error);
    }
  }

  private setupDirectoryKeybindings(cm: any): void {
    // Define custom actions for directory operations
    if (typeof CodeMirror !== 'undefined' && CodeMirror.Vim) {
      
      // Enter key to open file/folder
      CodeMirror.Vim.defineAction('openFileOrFolder', (cm: any) => {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        this.handleFileOpen(line, cursor);
      });

      CodeMirror.Vim.map('<CR>', ':openFileOrFolder<CR>', 'normal');
      
      // Map minus key to go up to parent directory
      CodeMirror.Vim.defineAction('navigateUp', (cm: any) => {
        this.navigateToParent();
      });

      CodeMirror.Vim.map('-', ':navigateUp<CR>', 'normal');

      // Add file creation commands
      CodeMirror.Vim.defineAction('appendNewFile', (cm: any) => {
        const cursor = cm.getCursor();
        const newLine = cursor.line + 1;
        cm.replaceRange('\n📄 ', { line: cursor.line, ch: cm.getLine(cursor.line).length });
        cm.setCursor({ line: newLine, ch: 3 });
        CodeMirror.Vim.enterInsertMode(cm);
      });

      CodeMirror.Vim.defineAction('insertNewFile', (cm: any) => {
        const cursor = cm.getCursor();
        cm.replaceRange('📄 ', cursor);
        cm.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        CodeMirror.Vim.enterInsertMode(cm);
      });

      CodeMirror.Vim.map('a', ':appendNewFile<CR>', 'normal');
      CodeMirror.Vim.map('i', ':insertNewFile<CR>', 'normal');

      // Manual save command
      CodeMirror.Vim.defineAction('saveDirectory', (cm: any) => {
        this.executePendingOperations();
      });

      CodeMirror.Vim.map(':w', ':saveDirectory<CR>', 'normal');

      // Undo command
      CodeMirror.Vim.defineAction('undoOperations', (cm: any) => {
        this.undoLastOperations();
      });

      CodeMirror.Vim.map('u', ':undoOperations<CR>', 'normal');

      // Define ex commands for file operations
      if (this.plugin.settings.enableCustomVimCommands) {
        CodeMirror.Vim.defineEx('mkdir', 'mkdir', (cm: any, input: any) => {
          const dirName = input.args.join(' ');
          if (dirName) {
            this.createDirectory(dirName);
          }
        });

        CodeMirror.Vim.defineEx('touch', 'touch', (cm: any, input: any) => {
          const fileName = input.args.join(' ');
          if (fileName) {
            this.createFile(fileName);
          }
        });

        CodeMirror.Vim.defineEx('rename', 'ren', (cm: any, input: any) => {
          const newName = input.args.join(' ');
          if (newName) {
            this.renameCurrentFile(newName, cm);
          }
        });
      }
    }
  }

  private async handleFileOpen(line: string, cursor: any): Promise<void> {
    const fileName = this.extractFileNameFromLine(line);
    if (!fileName) return;

    if (fileName === '..') {
      await this.navigateToParent();
      return;
    }

    const filePath = this.directoryPath === '/' 
      ? fileName 
      : `${this.directoryPath}/${fileName}`;
    
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file) return;

    if (file instanceof TFolder) {
      // Navigate to subdirectory
      this.directoryPath = file.path;
      await this.loadDirectoryContents();
    } else if (file instanceof TFile) {
      // Open file in current pane
      await this.leaf.openFile(file);
    }
  }

  private async navigateToParent(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(this.directoryPath);
    if (folder && folder.parent) {
      this.directoryPath = folder.parent.path;
      await this.loadDirectoryContents();
    }
  }

  private extractFileNameFromLine(line: string): string | null {
    const fileInfo = this.bufferParser.extractFileFromLine(line);
    return fileInfo ? fileInfo.name : null;
  }

  private async createDirectory(name: string): Promise<void> {
    const editor = (this as any).editor;
    if (!editor) return;
    
    const cursor = editor.getCursor();
    const newLine = `📁 ${name}`;
    editor.replaceRange('\n' + newLine, { line: cursor.line, ch: editor.getLine(cursor.line).length });
    
    this.hasUnsavedChanges = true;
    this.debouncedSave();
  }

  private async createFile(name: string): Promise<void> {
    const editor = (this as any).editor;
    if (!editor) return;
    
    const cursor = editor.getCursor();
    const newLine = `📄 ${name}`;
    editor.replaceRange('\n' + newLine, { line: cursor.line, ch: editor.getLine(cursor.line).length });
    
    this.hasUnsavedChanges = true;
    this.debouncedSave();
  }

  private async renameCurrentFile(newName: string, cm: any): Promise<void> {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const fileInfo = this.bufferParser.extractFileFromLine(line);
    
    if (fileInfo) {
      const icon = fileInfo.isFolder ? '📁' : '📄';
      const newLine = `${icon} ${newName}`;
      cm.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
      
      this.hasUnsavedChanges = true;
      this.debouncedSave();
    }
  }

  private async undoLastOperations(): Promise<void> {
    await this.fileOperationsManager.undoLastOperations();
    await this.loadDirectoryContents();
  }

  async save(): Promise<void> {
    await this.executePendingOperations();
  }
}

// Main Plugin Class
export default class SugarRushPlugin extends Plugin {
  settings: SugarRushSettings;
  navigationEngine: NavigationEngine;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Initialize navigation engine
    this.navigationEngine = new NavigationEngine(this.app, this);

    // Register directory edit view
    this.registerView(
      'directory-edit',
      (leaf: WorkspaceLeaf) => new DirectoryEditView(leaf, this.app, this.navigationEngine, this)
    );

    // Register commands
    this.addCommand({
      id: 'navigate-parent',
      name: 'Navigate to parent directory',
      hotkeys: [{ modifiers: [], key: '-' }],
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (checking) return !!view && this.settings.enableMinusKeyNavigation;
        
        if (view && this.settings.enableMinusKeyNavigation) {
          this.navigationEngine.handleMinusKey(new KeyboardEvent('keydown', { key: '-' }));
        }
        return true;
      }
    });

    this.addCommand({
      id: 'return-to-file',
      name: 'Return to previous file',
      hotkeys: [{ modifiers: ['Ctrl'], key: '^' }],
      callback: () => {
        this.navigationEngine.returnToPreviousFile();
      }
    });

    // Register global keydown handler for more responsive navigation
    this.registerDomEvent(document, 'keydown', (evt: KeyboardEvent) => {
      if (evt.key === '-' && !evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && this.settings.enableMinusKeyNavigation) {
          const handled = this.navigationEngine.handleMinusKey(evt);
          if (handled) {
            evt.preventDefault();
            evt.stopPropagation();
          }
        }
      }
    });

    // Add settings tab
    this.addSettingTab(new SugarRushSettingTab(this.app, this));

    console.log('Sugar Rush plugin loaded');
  }

  onunload(): void {
    console.log('Sugar Rush plugin unloaded');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

// Settings Tab
class SugarRushSettingTab extends PluginSettingTab {
  plugin: SugarRushPlugin;

  constructor(app: App, plugin: SugarRushPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Sugar Rush Settings' });

    // Navigation Settings
    containerEl.createEl('h3', { text: 'Navigation' });

    new Setting(containerEl)
      .setName('Enable minus key navigation')
      .setDesc('Press - to navigate to parent directory')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableMinusKeyNavigation)
        .onChange(async (value) => {
          this.plugin.settings.enableMinusKeyNavigation = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable continuous navigation')
      .setDesc('Allow repeated minus key presses to traverse up multiple levels')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableContinuousNavigation)
        .onChange(async (value) => {
          this.plugin.settings.enableContinuousNavigation = value;
          await this.plugin.saveSettings();
        }));

    // Display Settings
    containerEl.createEl('h3', { text: 'Display' });

    new Setting(containerEl)
      .setName('Show file extensions')
      .setDesc('Display file extensions in directory views')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showFileExtensions)
        .onChange(async (value) => {
          this.plugin.settings.showFileExtensions = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show hidden files')
      .setDesc('Display hidden files and folders')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showHiddenFiles)
        .onChange(async (value) => {
          this.plugin.settings.showHiddenFiles = value;
          await this.plugin.saveSettings();
        }));

    // Vim Integration Settings
    containerEl.createEl('h3', { text: 'Vim Integration' });

    new Setting(containerEl)
      .setName('Enable custom vim commands')
      .setDesc('Add directory-specific vim commands and keybindings')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableCustomVimCommands)
        .onChange(async (value) => {
          this.plugin.settings.enableCustomVimCommands = value;
          await this.plugin.saveSettings();
        }));

    // Performance Settings
    containerEl.createEl('h3', { text: 'Performance' });

    new Setting(containerEl)
      .setName('Lazy load threshold')
      .setDesc('Number of files before switching to lazy loading')
      .addSlider(slider => slider
        .setLimits(100, 5000, 100)
        .setValue(this.plugin.settings.lazyLoadThreshold)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.lazyLoadThreshold = value;
          await this.plugin.saveSettings();
        }));
  }
}