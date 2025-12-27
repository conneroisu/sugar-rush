# Change: Add Oil View (Buffer-Based Directory Display)

## Why
The core value proposition of Sugar Rush is providing an oil.nvim-like experience where users can edit directory contents as if they were editing a text buffer. This requires a custom Obsidian view that displays files/folders as editable lines and tracks changes without immediately applying them.

**Critical constraint:** Obsidian auto-saves files, so we MUST NOT auto-apply mutations. All edits are staged as pending changes and only applied when the user explicitly confirms with a command (Mod+S).

## What Changes
- Create `OilView` class extending Obsidian's `TextFileView` with a virtual file
- Virtual file approach gives us full Obsidian editor features:
  - Vim mode support (when user has vim enabled in Obsidian)
  - Undo/redo, search, and all standard editor commands
  - Native text selection and editing behavior
- Simple line format: `folder-name/` for directories, `file.ext` for files
- Track pending mutations by diffing buffer content against original state
- Mod+S applies all pending changes (instead of saving to disk)
- Discard command resets buffer to original state
- Directory navigation (Enter on folder opens it, `-` goes to parent)
- Status bar showing pending change count

## Impact
- Affected specs: `oil-view` (new capability)
- Affected code:
  - `src/views/oil-view.ts` - Main view extending TextFileView
  - `src/views/oil-buffer.ts` - Buffer parsing and diff tracking
  - `src/commands/index.ts` - Updated with functional commands
  - `styles.css` - Visual styling for the oil view
- Dependencies: `add-core-plugin-infrastructure` (settings, commands, types)
- Dependents: `add-file-mutations`, `add-split-navigation`, `add-preview-support`
