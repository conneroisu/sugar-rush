# Tasks: Add File Mutations

## 1. Core Mutation Types and Interfaces
- [ ] 1.1 Add `ConfirmMutationsPayload` type to `src/types.ts`
- [ ] 1.2 Add `MutationExecutionResult` type to `src/types.ts`
- [ ] 1.3 Add `ValidationResult`, `ValidationError`, `ValidationWarning` types

## 2. Mutation Ordering
- [ ] 2.1 Create `src/mutations/order.ts`
- [ ] 2.2 Implement `orderMutations()` function (creates -> renames -> deletes)
- [ ] 2.3 Add depth-based sorting for creates (shallower first) and deletes (deeper first)

## 3. Mutation Validation
- [ ] 3.1 Create `src/mutations/validator.ts`
- [ ] 3.2 Implement `MutationValidator` class
- [ ] 3.3 Add validation for creates (path doesn't exist, no duplicates)
- [ ] 3.4 Add validation for renames (source exists, target available)
- [ ] 3.5 Add validation for deletes (file exists, warn for non-empty folders)
- [ ] 3.6 Add circular rename detection

## 4. Confirmation Modal
- [ ] 4.1 Create `src/ui/confirm-modal.ts`
- [ ] 4.2 Implement `ConfirmDeleteModal` class extending Obsidian's Modal
- [ ] 4.3 Display list of files to be deleted (max 10 with "and X more")
- [ ] 4.4 Show appropriate warning for trash vs permanent delete
- [ ] 4.5 Add Cancel and Confirm buttons with proper focus handling

## 5. Mutation Executor
- [ ] 5.1 Create `src/mutations/executor.ts`
- [ ] 5.2 Implement `FileMutationExecutor` class
- [ ] 5.3 Implement `register()` to listen for `sugar-rush:confirm-mutations` event
- [ ] 5.4 Implement `handleConfirmMutations()` main handler
- [ ] 5.5 Implement `executeCreate()` using `vault.create()` and `vault.createFolder()`
- [ ] 5.6 Implement `executeRename()` using `fileManager.renameFile()`
- [ ] 5.7 Implement `executeDelete()` using `fileManager.trashFile()` or `vault.delete()`
- [ ] 5.8 Add proper error handling and notices

## 6. Plugin Integration
- [ ] 6.1 Import and instantiate `FileMutationExecutor` in `src/main.ts`
- [ ] 6.2 Call `mutationExecutor.register()` in `onload()`

## 7. Styles
- [ ] 7.1 Add confirmation modal styles to `styles.css`
- [ ] 7.2 Style delete warning, file list, buttons

## 8. Testing
- [ ] 8.1 Verify creates work (files and folders)
- [ ] 8.2 Verify renames work (links update correctly)
- [ ] 8.3 Verify deletes work (trash and permanent)
- [ ] 8.4 Verify confirmation modal appears when setting enabled
- [ ] 8.5 Verify confirmation modal is skipped when setting disabled
- [ ] 8.6 Verify error handling and user notifications
- [ ] 8.7 Verify mutation ordering is correct
