# Core Plugin Specification

## ADDED Requirements

### Requirement: Plugin Lifecycle Management
The plugin SHALL properly initialize on load and clean up on unload, following Obsidian's plugin lifecycle patterns.

#### Scenario: Plugin loads successfully
- GIVEN Obsidian starts with Sugar Rush enabled
- WHEN the plugin's onload() method is called
- THEN the plugin SHALL load persisted settings from disk
- AND the plugin SHALL register the settings tab
- AND the plugin SHALL register all commands
- AND the plugin SHALL log successful initialization

#### Scenario: Plugin unloads cleanly
- GIVEN Sugar Rush is running
- WHEN the plugin's onunload() method is called
- THEN all registered event listeners SHALL be removed
- AND all registered intervals SHALL be cleared
- AND the plugin SHALL log unload completion

#### Scenario: First-time plugin load
- GIVEN Sugar Rush is enabled for the first time (no saved settings)
- WHEN the plugin loads
- THEN the plugin SHALL use DEFAULT_SETTINGS for all configuration values

### Requirement: Settings Persistence
The plugin SHALL persist user settings to disk and restore them on reload.

#### Scenario: Settings are saved
- GIVEN the user changes a setting in the settings tab
- WHEN the setting value changes
- THEN the new value SHALL be saved to disk immediately
- AND the setting SHALL persist across plugin reloads

#### Scenario: Settings are loaded on startup
- GIVEN the user has previously configured settings
- WHEN the plugin loads
- THEN all saved settings SHALL be restored
- AND any new settings not in saved data SHALL use default values

#### Scenario: Settings schema forward compatibility
- GIVEN a new version adds new settings fields
- WHEN loading old settings data missing new fields
- THEN new fields SHALL use their default values
- AND existing fields SHALL retain their saved values

### Requirement: Settings Interface
The plugin SHALL provide a typed settings interface with categorized options.

#### Scenario: General settings available
- GIVEN the settings interface
- THEN showHiddenFiles (boolean, default: false) SHALL be configurable
- AND confirmBeforeDelete (boolean, default: true) SHALL be configurable
- AND useTrashInsteadOfDelete (boolean, default: true) SHALL be configurable

#### Scenario: Display settings available
- GIVEN the settings interface
- THEN showFileIcons (boolean, default: true) SHALL be configurable
- AND showFileSizes (boolean, default: false) SHALL be configurable
- AND showModifiedDate (boolean, default: false) SHALL be configurable
- AND sortOrder ('name' | 'modified' | 'size', default: 'name') SHALL be configurable
- AND sortDirection ('asc' | 'desc', default: 'asc') SHALL be configurable
- AND directoryFirst (boolean, default: true) SHALL be configurable

#### Scenario: Keybinding settings available
- GIVEN the settings interface
- THEN openOilView (string, default: 'Mod+Shift+E') SHALL be configurable
- AND navigateUp (string, default: '-') SHALL be configurable
- AND confirmChanges (string, default: 'Mod+Enter') SHALL be configurable
- AND discardChanges (string, default: 'Escape') SHALL be configurable
- AND togglePreview (string, default: 'p') SHALL be configurable

#### Scenario: Preview settings available
- GIVEN the settings interface
- THEN enabled (boolean, default: true) SHALL be configurable
- AND position ('right' | 'bottom', default: 'right') SHALL be configurable
- AND width (number, default: 40) SHALL be configurable

### Requirement: Settings Tab UI
The plugin SHALL provide a settings tab in Obsidian's settings panel.

#### Scenario: Settings tab is registered
- GIVEN Sugar Rush is loaded
- WHEN the user opens Obsidian settings
- THEN "Sugar Rush" SHALL appear in the plugin settings list
- AND clicking it SHALL display the settings UI

#### Scenario: Settings tab displays all sections
- GIVEN the user opens Sugar Rush settings
- THEN a "General" section SHALL be visible with toggle controls
- AND a "Display" section SHALL be visible with toggles and dropdowns
- AND a "Keybindings" section SHALL be visible with text inputs
- AND a "Preview" section SHALL be visible with toggle and dropdown

#### Scenario: Settings changes are immediate
- GIVEN the user is viewing the settings tab
- WHEN the user changes any setting value
- THEN the change SHALL take effect immediately (no save button required)
- AND the setting SHALL be persisted to disk

### Requirement: Command Registration
The plugin SHALL register commands with stable IDs for user accessibility.

#### Scenario: Commands appear in command palette
- GIVEN Sugar Rush is loaded
- WHEN the user opens the command palette (Cmd/Ctrl+P)
- THEN "Sugar Rush: Open file explorer (current directory)" SHALL be available
- AND "Sugar Rush: Open file explorer (vault root)" SHALL be available
- AND "Sugar Rush: Open file explorer (parent of current file)" SHALL be available

#### Scenario: Command IDs are stable
- GIVEN commands are registered
- THEN command ID 'sugar-rush:open-oil-view' SHALL remain constant across versions
- AND command ID 'sugar-rush:open-oil-view-vault-root' SHALL remain constant
- AND command ID 'sugar-rush:open-oil-view-current-file' SHALL remain constant

#### Scenario: Commands are placeholder until oil-view feature
- GIVEN oil-view feature is not yet implemented
- WHEN user triggers any oil view command
- THEN the command SHALL log a message indicating "not yet implemented"
- AND the command SHALL NOT cause any errors

### Requirement: Modular File Structure
The plugin codebase SHALL be organized into focused modules.

#### Scenario: Source files are properly organized
- GIVEN the plugin source code
- THEN `src/main.ts` SHALL contain only plugin lifecycle code
- AND `src/settings.ts` SHALL contain settings interface and defaults
- AND `src/settings-tab.ts` SHALL contain the settings UI component
- AND `src/commands/index.ts` SHALL contain command registration
- AND `src/types.ts` SHALL contain shared TypeScript interfaces
- AND `src/constants.ts` SHALL contain plugin constants

#### Scenario: Main.ts is minimal
- GIVEN the `src/main.ts` file
- THEN it SHALL be under 60 lines of code
- AND it SHALL only handle onload/onunload lifecycle
- AND it SHALL delegate to other modules for functionality

### Requirement: Build Output
The plugin SHALL produce valid Obsidian plugin artifacts.

#### Scenario: Build produces main.js
- GIVEN the source code is compiled
- WHEN `bun run build` is executed
- THEN `main.js` SHALL be created at the project root
- AND `main.js` SHALL contain all bundled TypeScript code
- AND `main.js` SHALL NOT contain the `obsidian` module (external)

#### Scenario: Plugin loads in Obsidian
- GIVEN `main.js` and `manifest.json` are in the plugin folder
- WHEN Obsidian loads the plugin
- THEN no JavaScript errors SHALL occur
- AND the plugin SHALL appear as "Sugar Rush" in the community plugins list
