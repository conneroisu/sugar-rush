# Sugar Rush Implementation Timeline

## Overview

This document outlines the implementation order and dependencies for the Sugar Rush Obsidian plugin - an oil.nvim-like file explorer for Obsidian.

## Dependency Graph

```
add-core-plugin-infrastructure
           │
           ▼
      add-oil-view
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
add-file  add-   add-
mutations split  preview
          nav    support
```

## Implementation Phases

### Phase 1: Foundation

| Change ID | Description | Dependencies | Effort |
|-----------|-------------|--------------|--------|
| `add-core-plugin-infrastructure` | Settings, types, constants, command registration, plugin lifecycle | None | Small |

**Deliverables:**
- `src/main.ts` - Minimal plugin entry point
- `src/settings.ts` - Settings interface and defaults
- `src/settings-tab.ts` - Settings UI component
- `src/commands/index.ts` - Command registration (placeholder callbacks)
- `src/types.ts` - Shared TypeScript interfaces
- `src/constants.ts` - Plugin constants
- Build configuration validated

**Exit Criteria:**
- Plugin loads in Obsidian without errors
- Settings tab appears and persists values
- Commands appear in command palette (with placeholder messages)
- `spectr validate add-core-plugin-infrastructure` passes

---

### Phase 2: Core View

| Change ID | Description | Dependencies | Effort |
|-----------|-------------|--------------|--------|
| `add-oil-view` | Buffer-based directory display with pending mutations | Phase 1 | Large |

**Deliverables:**
- `src/views/oil-view.ts` - Main OilView class extending ItemView
- `src/views/oil-buffer.ts` - Buffer parsing and diff tracking
- `src/views/oil-renderer.ts` - Line rendering with icons and highlighting
- `styles.css` - Visual styling for the oil view
- Updated `src/commands/index.ts` - Functional commands that open views

**Critical Design Constraint:**
> Obsidian auto-saves files. The oil view uses a contenteditable div (NOT a real file) to prevent auto-save from triggering mutations. All edits are staged as pending mutations and only applied when user explicitly confirms with Mod+Enter.

**Exit Criteria:**
- Oil view opens from command palette
- Directory contents display as editable lines
- Editing a line shows modified highlighting (yellow)
- Removing a line shows deleted highlighting (red strikethrough)
- Adding a line shows added highlighting (green)
- Mod+Enter triggers confirm (emits event, view does NOT apply mutations itself)
- Escape discards all pending changes
- Enter on folder navigates into it
- `-` key navigates to parent directory
- Enter on file opens the file
- `spectr validate add-oil-view` passes

---

### Phase 3: Features (Parallelizable)

These three changes can be implemented in parallel after Phase 2 completes.

| Change ID | Description | Dependencies | Effort |
|-----------|-------------|--------------|--------|
| `add-file-mutations` | Rename, delete, create operations | Phases 1, 2 | Medium |
| `add-split-navigation` | Open in split, navigate between splits | Phases 1, 2 | Medium |
| `add-preview-support` | Preview pane for selected files | Phases 1, 2 | Medium |

#### 3a. File Mutations

**Deliverables:**
- `src/mutations/mutation-executor.ts` - Executes file operations
- `src/mutations/mutation-validator.ts` - Validates operations before execution
- `src/mutations/types.ts` - Mutation type definitions
- Integration with oil-view confirm flow

**Exit Criteria:**
- Renaming a file via oil buffer works
- Deleting a file via oil buffer works (uses trash by default)
- Creating a new file via oil buffer works
- Creating a new folder via oil buffer works
- Confirmation dialog appears when `confirmBeforeDelete` is enabled
- Error handling for conflicts and permissions
- `spectr validate add-file-mutations` passes

#### 3b. Split Navigation

**Deliverables:**
- `src/navigation/split-manager.ts` - Manages workspace splits
- `src/navigation/leaf-utils.ts` - Utility functions for leaf operations
- Updated keybindings in settings
- Commands for split operations

**Exit Criteria:**
- `Ctrl+v` opens oil view in vertical split
- `Ctrl+x` opens oil view in horizontal split
- `Ctrl+h/j/k/l` navigates between panes
- Split state preserved on navigation
- `spectr validate add-split-navigation` passes

#### 3c. Preview Support

**Deliverables:**
- `src/preview/preview-manager.ts` - Manages preview pane lifecycle
- `src/preview/preview-renderer.ts` - Renders file previews
- Updated oil-view to track cursor position
- Preview settings (position, width, enabled)

**Exit Criteria:**
- Preview pane appears when enabled in settings
- Preview updates as cursor moves between files
- `p` key toggles preview visibility
- Preview position (right/bottom) configurable
- Markdown files render as preview
- Other files show raw content or placeholder
- `spectr validate add-preview-support` passes

---

## Validation Checklist

Before considering each phase complete:

- [ ] Run `spectr validate <change-id>` for each change
- [ ] Build succeeds: `bun run build`
- [ ] No TypeScript errors: `bun run typecheck` (if configured)
- [ ] Plugin loads in Obsidian test vault
- [ ] All spec scenarios manually verified
- [ ] No console errors during normal operation

## Risk Mitigation

### High Risk: Obsidian Auto-Save
- **Mitigation:** Use contenteditable div, not real files
- **Verification:** Confirm no file writes occur until Mod+Enter pressed

### Medium Risk: API Compatibility
- **Mitigation:** Use documented public APIs only
- **Verification:** Test against `minAppVersion: 1.0.0`

### Medium Risk: Performance with Large Directories
- **Mitigation:** Virtual scrolling or pagination for 1000+ items
- **Verification:** Test with 500+ file directories

## Implementation Notes

### Recommended Order Within Each Change

1. Create directory structure and empty files
2. Implement types/interfaces first
3. Implement core logic without UI
4. Add UI/rendering
5. Wire up event handlers
6. Add styling
7. Test and validate

### Code Quality Gates

- Each file should be under 300 lines
- Each function should be under 50 lines
- Use TypeScript strict mode
- No `any` types without justification
- All public APIs documented with JSDoc

## Estimated Task Counts

| Phase | Change | Tasks |
|-------|--------|-------|
| 1 | add-core-plugin-infrastructure | ~15 |
| 2 | add-oil-view | ~35 |
| 3a | add-file-mutations | ~20 |
| 3b | add-split-navigation | ~15 |
| 3c | add-preview-support | ~20 |
| **Total** | | **~105** |

## Quick Reference: Key APIs

```typescript
// Opening views
workspace.getLeaf('split', 'vertical');
workspace.getLeaf('split', 'horizontal');
leaf.setViewState({ type: VIEW_TYPE_OIL, state: { path } });

// File operations
app.fileManager.renameFile(file, newPath);
app.fileManager.trashFile(file);
app.vault.delete(file);
app.vault.create(path, content);
app.vault.createFolder(path);

// Reading directory
app.vault.getAbstractFileByPath(path);
folder.children; // TAbstractFile[]

// Events
workspace.trigger('sugar-rush:confirm-mutations', data);
workspace.on('sugar-rush:confirm-mutations', handler);
```
