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
  debounce
} from 'obsidian';
import type { ViewStateResult } from 'obsidian';

import { BufferParser } from './src/buffer-parser';
import type { FileOperation, DirectoryLine } from './src/buffer-parser';
import { FileOperationsManager } from './src/file-operations-manager';
import type { OperationResult } from './src/file-operations-manager';
import { Logger, LogLevel, createComponentLogger } from './src/logger';
import type { LoggerSettings } from './src/logger';

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
  
  // Logging
  logging: LoggerSettings;
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
  maxUndoHistory: 50,
  logging: {
    logLevel: LogLevel.INFO,
    enableConsoleLogging: true,
    enableFileLogging: false,
    logFilePath: 'sugar-rush.log',
    maxLogFileSize: 10, // 10MB
    maxLogFiles: 5,
    includeStackTrace: true,
    timestampFormat: 'iso'
  }
};


// Navigation Engine - handles the core navigation logic
class NavigationEngine {
  private app: App;
  private plugin: SugarRushPlugin;
  private previousViewState: any = null;
  private log: ReturnType<typeof createComponentLogger>;

  constructor(app: App, plugin: SugarRushPlugin) {
    this.app = app;
    this.plugin = plugin;
    this.log = createComponentLogger(plugin.logger, 'NavigationEngine');
  }

  async handleMinusKey(evt: Event): Promise<boolean> {
    this.log.trace('Handle minus key pressed');
    
    // Only trigger in markdown views when vim mode is in normal mode
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      this.log.debug('No active markdown view found');
      return false;
    }
    
    // Check if we're in vim normal mode (if vim mode is enabled)
    if (!this.isInNormalMode(activeView)) {
      this.log.debug('Not in vim normal mode, ignoring minus key');
      return false;
    }
    
    // Store current view state for return navigation
    this.previousViewState = {
      file: activeView.file,
      cursor: activeView.editor.getCursor(),
      scrollTop: activeView.editor.getScrollInfo().top
    };
    
    // Get current file's parent directory
    const file = activeView.file;
    if (!file) {
      this.log.warn('No file in active view');
      return false;
    }
    
    const parentPath = file.parent?.path || '/';
    this.log.info('Navigating to parent directory', { currentFile: file.path, parentPath });
    
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
      this.log.debug('Setting view state for directory', { path });
      await leaf.setViewState({
        type: 'directory-edit',
        state: { path: path }
      });
      this.log.info('Successfully opened directory view', { path });
    } catch (error) {
      this.log.error('Failed to show directory view', { path }, error as Error);
      new Notice('Failed to open directory view');
    }
  }

  async returnToPreviousFile(): Promise<void> {
    if (!this.previousViewState) {
      this.log.debug('No previous view state to return to');
      return;
    }
    
    const { file, cursor, scrollTop } = this.previousViewState;
    const leaf = this.app.workspace.activeLeaf;
    if (!leaf) {
      this.log.warn('No active leaf to return to previous file');
      return;
    }
    
    try {
      this.log.info('Returning to previous file', { filePath: file?.path });
      await leaf.openFile(file);
      
      // Restore cursor and scroll position
      setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          view.editor.setCursor(cursor);
          view.editor.scrollTo(null, scrollTop);
          this.log.debug('Restored cursor and scroll position', { cursor, scrollTop });
        }
      }, 50);
      
      this.previousViewState = null;
      this.log.info('Successfully returned to previous file');
    } catch (error) {
      this.log.error('Failed to return to previous file', { filePath: file?.path }, error as Error);
      new Notice('Failed to return to previous file');
    }
  }
}

// Directory Edit View - custom view for editing directories as buffers
class DirectoryEditView extends TextFileView {
  private directoryPath: string = '';
  private originalContent: string = '';
  private navigationEngine: NavigationEngine;
  private isLoading: boolean = false;
  private bufferParser: BufferParser;
  private fileOperationsManager: FileOperationsManager;
  private plugin: SugarRushPlugin;
  private debouncedSave: () => void;
  private hasUnsavedChanges: boolean = false;
  private content: string = '';
  private log: ReturnType<typeof createComponentLogger>;

  constructor(leaf: WorkspaceLeaf, app: App, navigationEngine: NavigationEngine, plugin: SugarRushPlugin) {
    super(leaf);
    this.navigation = false; // Disable default navigation
    this.navigationEngine = navigationEngine;
    this.plugin = plugin;
    this.log = createComponentLogger(plugin.logger, 'DirectoryEditView');
    this.bufferParser = new BufferParser(plugin.logger);
    this.fileOperationsManager = new FileOperationsManager(app, plugin.settings.maxUndoHistory, plugin.logger);
    
    // Set up debounced save
    this.debouncedSave = debounce(async () => {
      await this.executePendingOperations();
    }, plugin.settings.debounceDelay);
    
    this.log.debug('DirectoryEditView created');
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

  async onLoadFile(file: TFile): Promise<void> {
    // This method is called by TextFileView, but we override it for directory handling
  }

  getViewData(): string {
    return this.content;
  }

  setViewData(data: string, clear: boolean): void {
    this.content = data;
  }

  clear(): void {
    this.content = '';
  }

  async onOpen(): Promise<void> {
    this.log.debug('DirectoryEditView opening');
    await super.onOpen();
    
    const state = this.leaf.getViewState().state as any;
    if (state?.path) {
      this.directoryPath = state.path;
      this.log.info('Loading directory contents', { path: this.directoryPath });
      await this.loadDirectoryContents();
    } else {
      this.log.warn('No directory path provided in view state');
    }
  }

  async onClose(): Promise<void> {
    this.log.debug('DirectoryEditView closing');
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
      // Create a special parent directory marker
      const parentMarker = {
        name: '..',
        path: folder.parent.path,
        parent: folder.parent.parent,
        vault: folder.vault,
        children: [],
        isRoot: () => false
      } as unknown as TFolder;
      files.push(parentMarker);
    }

    // Add folders first, then files
    const children = folder.children.slice();
    children.sort((a, b) => {
      if (a instanceof TFolder && b instanceof TFile) return -1;
      if (a instanceof TFile && b instanceof TFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    // Filter and add valid children
    children.forEach(child => {
      if (child instanceof TFile || child instanceof TFolder) {
        files.push(child);
      }
    });
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
    const CM = (globalThis as any).CodeMirror;
    if (typeof CM !== 'undefined' && CM.Vim) {
      
      // Enter key to open file/folder
      CM.Vim.defineAction('openFileOrFolder', (cm: any) => {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        this.handleFileOpen(line, cursor);
      });

      CM.Vim.map('<CR>', ':openFileOrFolder<CR>', 'normal');
      
      // Map minus key to go up to parent directory
      CM.Vim.defineAction('navigateUp', (cm: any) => {
        this.navigateToParent();
      });

      CM.Vim.map('-', ':navigateUp<CR>', 'normal');

      // Add file creation commands
      CM.Vim.defineAction('appendNewFile', (cm: any) => {
        const cursor = cm.getCursor();
        const newLine = cursor.line + 1;
        cm.replaceRange('\n📄 ', { line: cursor.line, ch: cm.getLine(cursor.line).length });
        cm.setCursor({ line: newLine, ch: 3 });
        CM.Vim.enterInsertMode(cm);
      });

      CM.Vim.defineAction('insertNewFile', (cm: any) => {
        const cursor = cm.getCursor();
        cm.replaceRange('📄 ', cursor);
        cm.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
        CM.Vim.enterInsertMode(cm);
      });

      CM.Vim.map('a', ':appendNewFile<CR>', 'normal');
      CM.Vim.map('i', ':insertNewFile<CR>', 'normal');

      // Manual save command
      CM.Vim.defineAction('saveDirectory', (cm: any) => {
        this.executePendingOperations();
      });

      CM.Vim.map(':w', ':saveDirectory<CR>', 'normal');

      // Undo command
      CM.Vim.defineAction('undoOperations', (cm: any) => {
        this.undoLastOperations();
      });

      CM.Vim.map('u', ':undoOperations<CR>', 'normal');

      // Define ex commands for file operations
      if (this.plugin.settings.enableCustomVimCommands) {
        CM.Vim.defineEx('mkdir', 'mkdir', (cm: any, input: any) => {
          const dirName = input.args.join(' ');
          if (dirName) {
            this.createDirectory(dirName);
          }
        });

        CM.Vim.defineEx('touch', 'touch', (cm: any, input: any) => {
          const fileName = input.args.join(' ');
          if (fileName) {
            this.createFile(fileName);
          }
        });

        CM.Vim.defineEx('rename', 'ren', (cm: any, input: any) => {
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
  settings!: SugarRushSettings;
  navigationEngine!: NavigationEngine;
  logger!: Logger;
  log!: ReturnType<typeof createComponentLogger>;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Initialize logger
    this.logger = new Logger(this.app, this.settings.logging);
    this.log = createComponentLogger(this.logger, 'Plugin');
    
    this.log.info('Sugar Rush plugin loading...');

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
          this.navigationEngine.handleMinusKey(new Event('keydown'));
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
    this.registerDomEvent((globalThis as any).document, 'keydown', (evt: Event) => {
      const keyEvent = evt as any;
      if (keyEvent.key === '-' && !keyEvent.ctrlKey && !keyEvent.altKey && !keyEvent.shiftKey && !keyEvent.metaKey) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && this.settings.enableMinusKeyNavigation) {
          this.navigationEngine.handleMinusKey(evt).then(handled => {
            if (handled) {
              keyEvent.preventDefault();
              keyEvent.stopPropagation();
            }
          });
        }
      }
    });

    // Add settings tab
    this.addSettingTab(new SugarRushSettingTab(this.app, this));

    this.log.info('Sugar Rush plugin loaded successfully');
  }

  async onunload(): Promise<void> {
    this.log?.info('Sugar Rush plugin unloading...');
    
    // Flush any pending logs
    if (this.logger) {
      await this.logger.flush();
    }
    
    this.log?.info('Sugar Rush plugin unloaded');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    
    // Update logger settings if logger is initialized
    if (this.logger) {
      this.logger.updateSettings(this.settings.logging);
      this.log?.debug('Logger settings updated');
    }
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

    // Logging Settings
    containerEl.createEl('h3', { text: 'Logging' });

    new Setting(containerEl)
      .setName('Log level')
      .setDesc('Minimum level of logs to record')
      .addDropdown(dropdown => dropdown
        .addOption(LogLevel.TRACE.toString(), 'Trace (Very verbose)')
        .addOption(LogLevel.DEBUG.toString(), 'Debug (Verbose)')
        .addOption(LogLevel.INFO.toString(), 'Info (Normal)')
        .addOption(LogLevel.WARN.toString(), 'Warning (Important)')
        .addOption(LogLevel.ERROR.toString(), 'Error (Critical)')
        .addOption(LogLevel.FATAL.toString(), 'Fatal (Critical)')
        .addOption(LogLevel.OFF.toString(), 'Off (Disabled)')
        .setValue(this.plugin.settings.logging.logLevel.toString())
        .onChange(async (value) => {
          this.plugin.settings.logging.logLevel = parseInt(value) as LogLevel;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable console logging')
      .setDesc('Log messages to the browser console')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.logging.enableConsoleLogging)
        .onChange(async (value) => {
          this.plugin.settings.logging.enableConsoleLogging = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable file logging')
      .setDesc('Save log messages to a file in your vault')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.logging.enableFileLogging)
        .onChange(async (value) => {
          this.plugin.settings.logging.enableFileLogging = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Log file path')
      .setDesc('Path where log files will be stored')
      .addText(text => text
        .setPlaceholder('sugar-rush.log')
        .setValue(this.plugin.settings.logging.logFilePath)
        .onChange(async (value) => {
          this.plugin.settings.logging.logFilePath = value || 'sugar-rush.log';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Max log file size (MB)')
      .setDesc('Maximum size before log files are rotated')
      .addSlider(slider => slider
        .setLimits(1, 100, 1)
        .setValue(this.plugin.settings.logging.maxLogFileSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.logging.maxLogFileSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Max log files')
      .setDesc('Number of rotated log files to keep')
      .addSlider(slider => slider
        .setLimits(1, 10, 1)
        .setValue(this.plugin.settings.logging.maxLogFiles)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.logging.maxLogFiles = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include stack traces')
      .setDesc('Include stack traces in error logs')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.logging.includeStackTrace)
        .onChange(async (value) => {
          this.plugin.settings.logging.includeStackTrace = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Timestamp format')
      .setDesc('Format for timestamps in log messages')
      .addDropdown(dropdown => dropdown
        .addOption('iso', 'ISO 8601 (2023-12-25T10:30:00.000Z)')
        .addOption('locale', 'Locale format (12/25/2023, 10:30:00 AM)')
        .addOption('unix', 'Unix timestamp (1703504200000)')
        .setValue(this.plugin.settings.logging.timestampFormat)
        .onChange(async (value) => {
          this.plugin.settings.logging.timestampFormat = value;
          await this.plugin.saveSettings();
        }));

    // Log management
    const logManagementDiv = containerEl.createDiv();
    logManagementDiv.createEl('h4', { text: 'Log Management' });

    new Setting(logManagementDiv)
      .setName('Clear log file')
      .setDesc('Remove all content from the current log file')
      .addButton(button => button
        .setButtonText('Clear logs')
        .setCta()
        .onClick(async () => {
          if (this.plugin.logger) {
            await this.plugin.logger.clearLogFile();
          }
        }));

    new Setting(logManagementDiv)
      .setName('View log file')
      .setDesc('Open the current log file in Obsidian')
      .addButton(button => button
        .setButtonText('Open log file')
        .onClick(async () => {
          const logFile = this.app.vault.getAbstractFileByPath(this.plugin.settings.logging.logFilePath);
          if (logFile instanceof TFile) {
            const leaf = this.app.workspace.getLeaf();
            await leaf.openFile(logFile);
          } else {
            new Notice('Log file not found. Enable file logging first.');
          }
        }));

    // Show current log file size
    if (this.plugin.logger) {
      this.plugin.logger.getLogFileSize().then(size => {
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);
        const statusDiv = logManagementDiv.createDiv();
        statusDiv.createEl('small', { 
          text: `Current log file size: ${sizeInMB} MB`,
          cls: 'setting-item-description'
        });
      });
    }
  }
}