# Design: Core Plugin Infrastructure

## Context

Sugar Rush is an Obsidian community plugin that will provide oil.nvim-like file explorer functionality. This design document establishes the foundational architecture that all features (buffer-based editing, split navigation, preview) will build upon.

**Constraints:**
- Must follow Obsidian plugin guidelines and developer policies
- Desktop-only target (`isDesktopOnly: true`)
- Must bundle to single `main.js` using Bun bundler
- Must use `this.register*` helpers for proper cleanup
- TypeScript strict mode enabled

**Stakeholders:**
- End users configuring the plugin
- Future feature implementations depending on this foundation

## Goals / Non-Goals

**Goals:**
- Establish clean, modular file structure
- Provide type-safe settings with sensible defaults
- Create extensible command registration pattern
- Ensure proper cleanup on plugin unload
- Follow Obsidian best practices for lifecycle management

**Non-Goals:**
- Implement any oil.nvim features (separate proposals)
- Mobile support
- Network functionality
- Complex state management (not needed yet)

## Decisions

### Decision 1: Modular File Structure

**What:** Organize code into focused modules rather than monolithic main.ts

**Why:**
- Easier to maintain and extend
- Clear separation of concerns
- Follows project conventions in CLAUDE.md
- Each future feature can add its own module

**Structure:**
```
src/
├── main.ts           # Plugin lifecycle only (~50 lines)
├── settings.ts       # Settings interface and defaults
├── settings-tab.ts   # Settings UI component
├── commands/
│   └── index.ts      # Command registration
├── types.ts          # Shared TypeScript interfaces
└── constants.ts      # Plugin constants (IDs, defaults)
```

### Decision 2: Settings Architecture

**What:** Typed settings interface with categorized options

**Why:**
- Type safety prevents runtime errors
- Categories prepare for future feature settings
- Defaults ensure plugin works out-of-box

```typescript
// src/settings.ts

export interface SugarRushSettings {
  // General settings
  showHiddenFiles: boolean;
  confirmBeforeDelete: boolean;
  useTrashInsteadOfDelete: boolean;

  // Keybindings (customizable)
  keybindings: {
    openOilView: string;
    navigateUp: string;
    confirmChanges: string;
    discardChanges: string;
    togglePreview: string;
  };

  // Display settings
  display: {
    showFileIcons: boolean;
    showFileSizes: boolean;
    showModifiedDate: boolean;
    sortOrder: 'name' | 'modified' | 'size';
    sortDirection: 'asc' | 'desc';
    directoryFirst: boolean;
  };

  // Preview settings (for future preview feature)
  preview: {
    enabled: boolean;
    position: 'right' | 'bottom';
    width: number; // percentage for right, pixels for bottom
  };
}

export const DEFAULT_SETTINGS: SugarRushSettings = {
  showHiddenFiles: false,
  confirmBeforeDelete: true,
  useTrashInsteadOfDelete: true,

  keybindings: {
    openOilView: 'Mod+Shift+E',
    navigateUp: '-',
    confirmChanges: 'Mod+Enter',
    discardChanges: 'Escape',
    togglePreview: 'p',
  },

  display: {
    showFileIcons: true,
    showFileSizes: false,
    showModifiedDate: false,
    sortOrder: 'name',
    sortDirection: 'asc',
    directoryFirst: true,
  },

  preview: {
    enabled: true,
    position: 'right',
    width: 40,
  },
};
```

### Decision 3: Plugin Lifecycle Pattern

**What:** Minimal main.ts focused purely on lifecycle orchestration

**Why:**
- Keeps entry point clean and auditable
- All feature logic lives in dedicated modules
- Easy to understand plugin initialization flow

```typescript
// src/main.ts

import { Plugin } from 'obsidian';
import { SugarRushSettings, DEFAULT_SETTINGS } from './settings';
import { SugarRushSettingTab } from './settings-tab';
import { registerCommands } from './commands';
import { PLUGIN_ID } from './constants';

export default class SugarRushPlugin extends Plugin {
  settings: SugarRushSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    console.log(`Loading ${PLUGIN_ID} plugin`);

    // Load persisted settings
    await this.loadSettings();

    // Register settings tab
    this.addSettingTab(new SugarRushSettingTab(this.app, this));

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
```

### Decision 4: Command Registration Pattern

**What:** Centralized command registration with stable IDs and future extensibility

**Why:**
- All commands in one place for easy auditing
- Stable IDs prevent breaking user configurations
- Pattern supports feature-specific command modules

```typescript
// src/commands/index.ts

import type SugarRushPlugin from '../main';

// Command IDs - NEVER change these after release
export const COMMAND_IDS = {
  OPEN_OIL_VIEW: 'sugar-rush:open-oil-view',
  OPEN_OIL_VIEW_CURRENT: 'sugar-rush:open-oil-view-current-file',
  OPEN_OIL_VIEW_ROOT: 'sugar-rush:open-oil-view-vault-root',
} as const;

export function registerCommands(plugin: SugarRushPlugin): void {
  // Open Oil view for current file's directory
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW,
    name: 'Open file explorer (current directory)',
    callback: () => {
      // Implementation will be added by oil-view feature
      console.log('Oil view command triggered - not yet implemented');
    },
  });

  // Open Oil view at vault root
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_ROOT,
    name: 'Open file explorer (vault root)',
    callback: () => {
      console.log('Oil view root command triggered - not yet implemented');
    },
  });

  // Open Oil view for current file's parent
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_CURRENT,
    name: 'Open file explorer (parent of current file)',
    callback: () => {
      console.log('Oil view parent command triggered - not yet implemented');
    },
  });
}
```

### Decision 5: Settings Tab UI

**What:** Organized settings tab with sections matching settings categories

**Why:**
- Users can easily find and modify settings
- Sections scale as features add more options
- Standard Obsidian UI patterns

```typescript
// src/settings-tab.ts

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
        .setPlaceholder('Mod+Enter')
        .setValue(this.plugin.settings.keybindings.confirmChanges)
        .onChange(async (value) => {
          this.plugin.settings.keybindings.confirmChanges = value || 'Mod+Enter';
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
```

### Decision 6: Constants and Types

**What:** Centralized constants and shared types

**Why:**
- Single source of truth for IDs and magic values
- Type safety across modules
- Easy refactoring

```typescript
// src/constants.ts

export const PLUGIN_ID = 'sugar-rush';
export const PLUGIN_NAME = 'Sugar Rush';

// View type for the oil-like view (used by future oil-view feature)
export const OIL_VIEW_TYPE = 'sugar-rush-oil-view';

// CSS classes
export const CSS_CLASSES = {
  OIL_VIEW: 'sugar-rush-oil-view',
  OIL_LINE: 'sugar-rush-oil-line',
  OIL_LINE_MODIFIED: 'sugar-rush-oil-line-modified',
  OIL_LINE_DELETED: 'sugar-rush-oil-line-deleted',
  OIL_LINE_ADDED: 'sugar-rush-oil-line-added',
  DIRECTORY: 'sugar-rush-directory',
  FILE: 'sugar-rush-file',
} as const;
```

```typescript
// src/types.ts

import type { TFile, TFolder } from 'obsidian';

/**
 * Represents an entry in the oil view buffer
 */
export interface OilEntry {
  /** Original path of the file/folder */
  originalPath: string;
  /** Current display name (may differ if renamed) */
  displayName: string;
  /** Whether this is a directory */
  isDirectory: boolean;
  /** Reference to the actual file (null for new entries) */
  file: TFile | null;
  /** Reference to the actual folder (null for new entries) */
  folder: TFolder | null;
  /** Line number in the buffer (1-indexed) */
  lineNumber: number;
}

/**
 * Types of mutations that can be applied to files
 */
export type MutationType = 'rename' | 'delete' | 'create' | 'move';

/**
 * Represents a pending file mutation
 */
export interface FileMutation {
  type: MutationType;
  originalPath: string;
  newPath?: string; // For rename/move/create
  entry: OilEntry;
}

/**
 * State of the oil view
 */
export interface OilViewState {
  /** Current directory being displayed */
  currentPath: string;
  /** Navigation history for back/forward */
  history: string[];
  /** Current position in history */
  historyIndex: number;
  /** Pending mutations not yet applied */
  pendingMutations: FileMutation[];
}
```

## Risks / Trade-offs

### Risk 1: Settings Schema Changes
**Risk:** Future features may require settings schema changes
**Mitigation:**
- Use `Object.assign({}, DEFAULT_SETTINGS, data)` pattern for forward compatibility
- New settings automatically get defaults
- Document migration strategy for breaking changes

### Risk 2: Command ID Stability
**Risk:** Changing command IDs breaks user hotkeys
**Mitigation:**
- Document that command IDs are stable API
- Use constants file to prevent accidental changes
- Never rename after initial release

### Risk 3: Over-engineering Settings
**Risk:** Settings for features not yet implemented
**Mitigation:**
- Settings are cheap (just interface fields)
- Having the structure ready speeds up feature development
- UI can hide unimplemented feature settings

## Migration Plan

Not applicable - this is a greenfield implementation with no existing functionality to migrate.

## Open Questions

1. **Hotkey format:** Should we use Obsidian's native hotkey picker or simple text input?
   - Decision: Text input initially (simpler), can upgrade to picker later

2. **Settings sync:** Should settings be vault-specific or global?
   - Decision: Vault-specific (Obsidian default behavior)

3. **Debug mode:** Should we add a debug/verbose logging setting?
   - Decision: Defer to later - use console.log for development
