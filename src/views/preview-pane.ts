import { Component, MarkdownRenderer, TFile, TFolder } from 'obsidian';
import type SugarRushPlugin from '../main';
import type { OilEntry } from '../types';
import { CSS_CLASSES, IMAGE_EXTENSIONS, PREVIEW_MAX_LENGTH, PREVIEW_MAX_LINES } from '../constants';

export interface PreviewPaneOptions {
  position: 'right' | 'bottom';
  width: number; // percentage (0-100)
}

/**
 * Preview pane component that displays file/folder previews in the oil view
 */
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
    headerEl.createEl('h3', { text: folder.name });

    const statsEl = this.contentEl.createDiv({ cls: 'preview-stats' });

    // Count children
    let fileCount = 0;
    let folderCount = 0;
    let totalSize = 0;

    for (const child of folder.children) {
      if (child instanceof TFolder) {
        folderCount++;
      } else if (child instanceof TFile) {
        fileCount++;
        totalSize += child.stat.size;
      }
    }

    // Display stats
    statsEl.createDiv({ text: `${fileCount} files` });
    statsEl.createDiv({ text: `${folderCount} folders` });
    statsEl.createDiv({ text: `${this.formatSize(totalSize)} total` });

    // Show folder contents
    const recentEl = this.contentEl.createDiv({ cls: 'preview-recent' });
    recentEl.createEl('h4', { text: 'Contents' });

    const fileList = recentEl.createEl('ul');
    const children = folder.children.slice(0, 10); // First 10 items

    for (const child of children) {
      const li = fileList.createEl('li');
      const isFolder = child instanceof TFolder;
      li.setText(`${isFolder ? child.name + '/' : child.name}`);
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
    return (IMAGE_EXTENSIONS as readonly string[]).includes(extension);
  }

  /**
   * Render image preview
   */
  private async renderImagePreview(file: TFile): Promise<void> {
    const headerEl = this.contentEl.createDiv({ cls: 'preview-header' });
    headerEl.createEl('h3', { text: file.name });

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
    headerEl.createEl('h3', { text: file.name });

    // Read file content using cached read for performance
    const content = await this.plugin.app.vault.cachedRead(file);

    // Truncate if very long
    const displayContent = content.length > PREVIEW_MAX_LENGTH
      ? content.slice(0, PREVIEW_MAX_LENGTH) + '\n\n... (truncated)'
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
    headerEl.createEl('h3', { text: file.name });

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
      const previewLines = lines.slice(0, PREVIEW_MAX_LINES);

      const codeEl = this.contentEl.createEl('pre', { cls: 'preview-text' });
      const codeContent = codeEl.createEl('code');
      codeContent.setText(previewLines.join('\n'));

      if (lines.length > PREVIEW_MAX_LINES) {
        this.contentEl.createDiv({
          text: `... ${lines.length - PREVIEW_MAX_LINES} more lines`,
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
