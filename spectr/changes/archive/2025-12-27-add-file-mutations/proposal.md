# Change: Add File Mutations (Apply File Operations)

## Why
The oil view tracks pending mutations (renames, deletions, creates) but cannot actually apply them to the filesystem. Without a mutation executor, users can edit the buffer but changes are never persisted. This feature completes the oil.nvim experience by handling the "confirm" action that applies all staged changes.

**Critical constraint:** File operations must be performed in a specific order to avoid conflicts - creates before renames before deletes. Additionally, we must respect user settings for confirmation dialogs and trash vs permanent deletion.

## What Changes
- Create `FileMutationExecutor` class to handle applying mutations to the filesystem
- Listen for `sugar-rush:confirm-mutations` event emitted by oil-view
- Execute mutations in correct dependency order (creates -> renames -> deletes)
- Use correct Obsidian APIs for each operation type:
  - `app.fileManager.renameFile(file, newPath)` for renames (automatically updates links)
  - `app.fileManager.trashFile(file)` for safe deletion (respects trash settings)
  - `app.vault.delete(file, true)` for permanent deletion
  - `app.vault.create(path, '')` for creating files
  - `app.vault.createFolder(path)` for creating folders
- Show confirmation modal if `confirmBeforeDelete` setting is enabled
- Display success/error notifications to user
- Handle errors gracefully without crashing the plugin

## Impact
- Affected specs: `file-mutations` (new capability)
- Affected code:
  - `src/mutations/executor.ts` - Main mutation execution logic
  - `src/mutations/validator.ts` - Validate mutations before execution
  - `src/mutations/order.ts` - Dependency ordering for mutations
  - `src/ui/confirm-modal.ts` - Confirmation dialog for deletions
  - `src/main.ts` - Register mutation event listener
- Dependencies:
  - `add-core-plugin-infrastructure` (settings, types, constants)
  - `add-oil-view` (emits confirm-mutations event, provides mutation types)
- Dependents: None (this completes the mutation flow)
