import { Plugin } from 'obsidian';
import { SugarRushSettings, DEFAULT_SETTINGS } from './settings';
import { SugarRushSettingTab } from './settings-tab';
import { registerCommands } from './commands';
import { PLUGIN_ID, OIL_VIEW_TYPE } from './constants';
import { OilView } from './views/oil-view';
import { FileMutationExecutor } from './mutations/executor';

export default class SugarRushPlugin extends Plugin {
  settings: SugarRushSettings = DEFAULT_SETTINGS;
  private mutationExecutor!: FileMutationExecutor;

  async onload(): Promise<void> {
    console.log(`Loading ${PLUGIN_ID} plugin`);

    // Load persisted settings
    await this.loadSettings();

    // Register the oil view type
    this.registerView(OIL_VIEW_TYPE, (leaf) => new OilView(leaf, this));

    // Register settings tab
    this.addSettingTab(new SugarRushSettingTab(this.app, this));

    // Register mutation executor (listens for confirm events)
    this.mutationExecutor = new FileMutationExecutor(this);
    this.mutationExecutor.register();

    // Register all commands
    registerCommands(this);

    console.log(`${PLUGIN_ID} plugin loaded successfully`);
  }

  onunload(): void {
    console.log(`Unloading ${PLUGIN_ID} plugin`);
    // Cleanup handled automatically by this.register* helpers
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
