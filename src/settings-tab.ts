import { App, PluginSettingTab, Setting } from 'obsidian';
import type SugarRushPlugin from './main';

export class SugarRushSettingTab extends PluginSettingTab {
  plugin: SugarRushPlugin;

  constructor(app: App, plugin: SugarRushPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl('h1', { text: 'Sugar Rush Settings' });
    containerEl.createEl('p', {
      text: 'Configure the oil.nvim-like file explorer.',
      cls: 'setting-item-description'
    });

    // General Section
    containerEl.createEl('h2', { text: 'General' });

    new Setting(containerEl)
      .setName('Show hidden files')
      .setDesc('Display files and folders starting with a dot (.)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showHiddenFiles)
        .onChange(async (value) => {
          this.plugin.settings.showHiddenFiles = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Confirm before delete')
      .setDesc('Show confirmation dialog before deleting files')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.confirmBeforeDelete)
        .onChange(async (value) => {
          this.plugin.settings.confirmBeforeDelete = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Use trash instead of permanent delete')
      .setDesc('Move deleted files to system trash instead of permanently deleting')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.useTrashInsteadOfDelete)
        .onChange(async (value) => {
          this.plugin.settings.useTrashInsteadOfDelete = value;
          await this.plugin.saveSettings();
        }));

    // Display Section
    containerEl.createEl('h2', { text: 'Display' });

    new Setting(containerEl)
      .setName('Show file icons')
      .setDesc('Display icons next to files and folders')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.display.showFileIcons)
        .onChange(async (value) => {
          this.plugin.settings.display.showFileIcons = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show file sizes')
      .setDesc('Display file sizes in the explorer')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.display.showFileSizes)
        .onChange(async (value) => {
          this.plugin.settings.display.showFileSizes = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Sort order')
      .setDesc('How to sort files in the explorer')
      .addDropdown(dropdown => dropdown
        .addOption('name', 'Name')
        .addOption('modified', 'Date modified')
        .addOption('size', 'Size')
        .setValue(this.plugin.settings.display.sortOrder)
        .onChange(async (value: 'name' | 'modified' | 'size') => {
          this.plugin.settings.display.sortOrder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Directories first')
      .setDesc('Show directories before files')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.display.directoryFirst)
        .onChange(async (value) => {
          this.plugin.settings.display.directoryFirst = value;
          await this.plugin.saveSettings();
        }));

    // Keybindings Section
    containerEl.createEl('h2', { text: 'Keybindings' });
    containerEl.createEl('p', {
      text: 'These keybindings work within the Oil view.',
      cls: 'setting-item-description'
    });

    new Setting(containerEl)
      .setName('Navigate up')
      .setDesc('Key to navigate to parent directory')
      .addText(text => text
        .setPlaceholder('-')
        .setValue(this.plugin.settings.keybindings.navigateUp)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.navigateUp = value || '-';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Confirm changes')
      .setDesc('Key combination to apply pending file operations')
      .addText(text => text
        .setPlaceholder('Mod+S')
        .setValue(this.plugin.settings.keybindings.confirmChanges)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.confirmChanges = value || 'Mod+S';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Discard changes')
      .setDesc('Key to discard pending file operations')
      .addText(text => text
        .setPlaceholder('Escape')
        .setValue(this.plugin.settings.keybindings.discardChanges)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.discardChanges = value || 'Escape';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Open in vertical split')
      .setDesc('Key combination to open folder in a vertical split (right)')
      .addText(text => text
        .setPlaceholder('Ctrl+Enter')
        .setValue(this.plugin.settings.keybindings.openInVerticalSplit)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.openInVerticalSplit = value || 'Ctrl+Enter';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Open in horizontal split')
      .setDesc('Key combination to open folder in a horizontal split (below)')
      .addText(text => text
        .setPlaceholder('Ctrl+Shift+Enter')
        .setValue(this.plugin.settings.keybindings.openInHorizontalSplit)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.openInHorizontalSplit = value || 'Ctrl+Shift+Enter';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Navigate back')
      .setDesc('Key combination to go back in navigation history')
      .addText(text => text
        .setPlaceholder('Alt+ArrowLeft')
        .setValue(this.plugin.settings.keybindings.navigateBack)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.navigateBack = value || 'Alt+ArrowLeft';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Navigate forward')
      .setDesc('Key combination to go forward in navigation history')
      .addText(text => text
        .setPlaceholder('Alt+ArrowRight')
        .setValue(this.plugin.settings.keybindings.navigateForward)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.navigateForward = value || 'Alt+ArrowRight';
          await this.plugin.saveSettings();
        }));

    // Preview Section (for future feature)
    containerEl.createEl('h2', { text: 'Preview' });

    new Setting(containerEl)
      .setName('Enable preview')
      .setDesc('Show file preview when selecting files')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.preview.enabled)
        .onChange(async (value) => {
          this.plugin.settings.preview.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Preview position')
      .setDesc('Where to show the preview pane')
      .addDropdown(dropdown => dropdown
        .addOption('right', 'Right')
        .addOption('bottom', 'Bottom')
        .setValue(this.plugin.settings.preview.position)
        .onChange(async (value: 'right' | 'bottom') => {
          this.plugin.settings.preview.position = value;
          await this.plugin.saveSettings();
        }));
  }
}
