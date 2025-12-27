# Change: Add Oil View (Buffer-Based Directory Display)

## Why
The core value proposition of Sugar Rush is providing an oil.nvim-like experience where users can edit directory contents as if they were editing a text buffer. This requires a custom Obsidian view that displays files/folders as editable lines and tracks changes without immediately applying them.

**Critical constraint:** Obsidian auto-saves files, so we MUST NOT auto-apply mutations. All edits are staged as pending changes and only applied when the user explicitly confirms with a command (Mod+Enter).

## What Changes
- Create `OilView` class extending Obsidian's `ItemView`
- Implement editable text buffer displaying directory contents (one file/folder per line)
- Track pending mutations (renames, deletions, additions) in view state
- Visual highlighting for modified/deleted/added entries
- Confirm command to apply all pending mutations
- Discard command to reset buffer to original state
- Directory navigation (Enter on folder opens it, `-` goes to parent)
- Status bar showing pending change count
- Integration with Obsidian's view/tab system

## Impact
- Affected specs: `oil-view` (new capability)
- Affected code:
  - `src/views/oil-view.ts` - Main view implementation
  - `src/views/oil-buffer.ts` - Buffer parsing and diff tracking
  - `src/views/oil-renderer.ts` - Line rendering with icons and highlighting
  - `src/commands/index.ts` - Updated with functional commands
  - `styles.css` - Visual styling for the oil view
- Dependencies: `add-core-plugin-infrastructure` (settings, commands, types)
- Dependents: `add-file-mutations`, `add-split-navigation`, `add-preview-support`
