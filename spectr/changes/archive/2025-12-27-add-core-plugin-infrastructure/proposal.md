# Change: Add Core Plugin Infrastructure

## Why
Sugar Rush currently has no functional plugin implementation - just a placeholder console.log. Before implementing oil.nvim-like features (buffer editing, split navigation, preview), we need a solid foundation with proper plugin lifecycle management, settings persistence, and command registration patterns that all subsequent features will build upon.

## What Changes
- Create main plugin class extending Obsidian's `Plugin` with proper `onload()`/`onunload()` lifecycle
- Implement settings interface with typed defaults for all configurable options
- Add settings tab UI allowing users to configure keybindings, trash behavior, hidden files display
- Establish command registration pattern using stable IDs for future feature commands
- Set up proper cleanup using `this.register*` helpers to prevent memory leaks
- Create modular file structure following Obsidian plugin best practices

## Impact
- Affected specs: `core-plugin` (new capability)
- Affected code:
  - `src/main.ts` - Plugin entry point with lifecycle
  - `src/settings.ts` - Settings interface and defaults
  - `src/settings-tab.ts` - Settings UI component
  - `src/commands/index.ts` - Command registration
  - `src/types.ts` - Shared TypeScript types
- Dependencies: None (this is the foundation)
- Dependents: All future features (oil-view, file-mutations, split-navigation, preview)
