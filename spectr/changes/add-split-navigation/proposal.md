# Change: Add Split Navigation

## Why
A core feature of oil.nvim is the ability to open directories in new splits/panes, allowing users to view multiple directories side-by-side while navigating the file system. This enables workflows like comparing directory contents, moving files between locations, and keeping a parent directory visible while exploring subdirectories. Sugar Rush needs this functionality to provide a complete oil.nvim-like experience in Obsidian.

## What Changes
- Add `Ctrl+Enter` keybinding to open folder in vertical split (split to right)
- Add `Ctrl+Shift+Enter` keybinding to open folder in horizontal split (split below)
- Update `-` key to navigate to parent directory (reusing current leaf, not creating split)
- Implement navigation history tracking (back/forward) within each oil view instance
- Add commands for split navigation accessible from command palette
- Update keybindings settings to include new split navigation shortcuts
- Ensure proper state management for each split view instance

## Impact
- Affected specs: `split-navigation` (new capability)
- Affected code:
  - `src/views/oil-view.ts` - Add split navigation handlers and history tracking
  - `src/views/split-manager.ts` - New module for workspace split management
  - `src/types.ts` - Add navigation history types
  - `src/settings.ts` - Add split navigation keybindings settings
  - `src/settings-tab.ts` - Add UI for split navigation keybindings
  - `src/commands/index.ts` - Add split navigation commands
  - `src/constants.ts` - Add new command IDs
- Dependencies: `add-core-plugin-infrastructure`, `add-oil-view`
- Dependents: None (this is an enhancement to oil-view)
