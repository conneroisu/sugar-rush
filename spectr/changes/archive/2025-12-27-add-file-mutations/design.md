# Design: File Mutations (Apply File Operations)

## Context

The oil view tracks pending mutations in memory but needs a separate system to actually apply those changes to the filesystem. This design document covers the mutation executor that listens for confirmation events and performs file operations.

**Constraints:**
- Must use Obsidian's file management APIs (not direct Node.js fs)
- Must preserve link integrity when renaming files (use `fileManager.renameFile`)
- Must respect user settings for trash vs permanent delete
- Must show confirmation dialog when `confirmBeforeDelete` is enabled
- Must handle errors without crashing the plugin
- Operations must be ordered to avoid conflicts (creates before renames before deletes)

**Stakeholders:**
- Oil view (emits confirmation events)
- Users (receive notifications, confirm dialogs)
- Vault files (affected by operations)

## Goals / Non-Goals

**Goals:**
- Apply all pending mutations correctly and safely
- Execute operations in the right order to avoid conflicts
- Provide clear user feedback (success/error notifications)
- Respect user preferences (trash, confirmation dialogs)
- Update vault links automatically when renaming

**Non-Goals:**
- Undo/redo support (defer to later enhancement)
- Batch confirmation for multiple directories
- Progress indicators for large operations
- Conflict resolution for concurrent edits

## Decisions

### Decision 1: Event-Driven Architecture

**What:** The mutation executor listens for a custom workspace event rather than being called directly by the oil view.

**Why:**
- Decouples oil view from mutation logic
- Oil view doesn't need to know about Obsidian file APIs
- Makes testing easier (can trigger events in tests)
- Follows Obsidian's event-driven patterns

**Event Contract:**
```typescript
// Event payload sent by oil-view when user confirms
interface ConfirmMutationsPayload {
  mutations: FileMutation[];
  sourcePath: string;  // Directory where mutations originated
  onComplete: (success: boolean) => Promise<void>;
}

// Oil view emits:
this.app.workspace.trigger('sugar-rush:confirm-mutations', payload);

// Executor listens:
this.registerEvent(
  this.app.workspace.on('sugar-rush:confirm-mutations', this.handleConfirmMutations.bind(this))
);
```

### Decision 2: Mutation Ordering Strategy

**What:** Execute mutations in a specific order to prevent conflicts.

**Why:**
- Creating a file that will be renamed needs create first
- Renaming a file to a path that will be deleted needs delete first... but wait, that's wrong
- Actually: Creates first (so rename targets exist), then Renames (move files around), then Deletes (remove old files)

**Order of Operations:**
1. **Creates** - New files/folders must exist before they can be targeted
2. **Renames/Moves** - Move existing files to new locations
3. **Deletes** - Remove files after everything else is done

**Edge Case Handling:**
- Rename to a path that will be created → Create runs first, so target exists
- Delete a file then create with same name → Delete runs last, so old file exists during create (error case - need validation)

```typescript
// src/mutations/order.ts

import type { FileMutation } from '../types';

/**
 * Sort mutations into execution order:
 * 1. Creates (files before folders, so parent folders are created first)
 * 2. Renames
 * 3. Deletes (children before parents, so folders can be deleted after contents)
 */
export function orderMutations(mutations: FileMutation[]): FileMutation[] {
  const creates = mutations.filter(m => m.type === 'create');
  const renames = mutations.filter(m => m.type === 'rename' || m.type === 'move');
  const deletes = mutations.filter(m => m.type === 'delete');

  // Sort creates: folders first (so parent folders exist for child files)
  // Actually, we need parent folders to exist before creating files in them
  // So sort by path depth (shallower first)
  const sortedCreates = [...creates].sort((a, b) => {
    const aDepth = (a.newPath?.split('/').length ?? 0);
    const bDepth = (b.newPath?.split('/').length ?? 0);
    return aDepth - bDepth;
  });

  // Sort deletes: deeper paths first (so we delete children before parents)
  const sortedDeletes = [...deletes].sort((a, b) => {
    const aDepth = a.originalPath.split('/').length;
    const bDepth = b.originalPath.split('/').length;
    return bDepth - aDepth; // Deeper first
  });

  return [...sortedCreates, ...renames, ...sortedDeletes];
}
```

### Decision 3: Validation Before Execution

**What:** Validate all mutations before executing any of them.

**Why:**
- Catch errors early before partial application
- Better user experience with clear error messages
- Prevents inconsistent state

**Validations:**
- Check that files to be renamed/deleted actually exist
- Check that target paths for creates don't already exist (unless overwriting)
- Check for circular renames (A→B and B→A)
- Check that parent folders exist or will be created

```typescript
// src/mutations/validator.ts

import { TFile, TFolder, App } from 'obsidian';
import type { FileMutation } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  mutation: FileMutation;
  message: string;
}

export interface ValidationWarning {
  mutation: FileMutation;
  message: string;
}

export class MutationValidator {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Validate all mutations before execution
   */
  validate(mutations: FileMutation[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Track paths that will exist after creates
    const createdPaths = new Set<string>();
    // Track paths that will be deleted
    const deletedPaths = new Set<string>();
    // Track rename mappings
    const renames = new Map<string, string>();

    for (const mutation of mutations) {
      switch (mutation.type) {
        case 'create':
          if (mutation.newPath) {
            // Check if path already exists
            const existing = this.app.vault.getAbstractFileByPath(mutation.newPath);
            if (existing) {
              errors.push({
                mutation,
                message: `Cannot create "${mutation.newPath}": path already exists`,
              });
            }

            // Check if we're creating a duplicate
            if (createdPaths.has(mutation.newPath)) {
              errors.push({
                mutation,
                message: `Cannot create "${mutation.newPath}": duplicate create in batch`,
              });
            }

            createdPaths.add(mutation.newPath);
          }
          break;

        case 'rename':
        case 'move':
          // Check source exists
          const source = this.app.vault.getAbstractFileByPath(mutation.originalPath);
          if (!source) {
            errors.push({
              mutation,
              message: `Cannot rename "${mutation.originalPath}": file does not exist`,
            });
          }

          // Check target doesn't exist (unless it will be deleted or renamed away)
          if (mutation.newPath) {
            const target = this.app.vault.getAbstractFileByPath(mutation.newPath);
            if (target && !deletedPaths.has(mutation.newPath)) {
              // Check if target is being renamed away
              const isRenamed = mutations.some(
                m => (m.type === 'rename' || m.type === 'move') &&
                     m.originalPath === mutation.newPath
              );
              if (!isRenamed) {
                errors.push({
                  mutation,
                  message: `Cannot rename to "${mutation.newPath}": path already exists`,
                });
              }
            }

            renames.set(mutation.originalPath, mutation.newPath);
          }
          break;

        case 'delete':
          // Check file exists
          const toDelete = this.app.vault.getAbstractFileByPath(mutation.originalPath);
          if (!toDelete) {
            warnings.push({
              mutation,
              message: `File "${mutation.originalPath}" does not exist, skipping delete`,
            });
          }

          // Check if it's a non-empty folder
          if (toDelete instanceof TFolder && toDelete.children.length > 0) {
            warnings.push({
              mutation,
              message: `Folder "${mutation.originalPath}" is not empty, all contents will be deleted`,
            });
          }

          deletedPaths.add(mutation.originalPath);
          break;
      }
    }

    // Check for circular renames
    for (const [from, to] of renames) {
      if (renames.get(to) === from) {
        errors.push({
          mutation: mutations.find(m => m.originalPath === from)!,
          message: `Circular rename detected: "${from}" <-> "${to}"`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
```

### Decision 4: Mutation Executor Implementation

**What:** Main class that applies validated mutations to the filesystem.

**Why:**
- Centralized mutation logic
- Clear separation from validation
- Handles Obsidian API calls correctly

```typescript
// src/mutations/executor.ts

import { App, TFile, TFolder, Notice } from 'obsidian';
import type { FileMutation } from '../types';
import type SugarRushPlugin from '../main';
import { MutationValidator, ValidationResult } from './validator';
import { orderMutations } from './order';
import { ConfirmDeleteModal } from '../ui/confirm-modal';

export interface MutationResult {
  success: boolean;
  applied: FileMutation[];
  failed: Array<{ mutation: FileMutation; error: string }>;
}

export class FileMutationExecutor {
  private app: App;
  private plugin: SugarRushPlugin;
  private validator: MutationValidator;

  constructor(plugin: SugarRushPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.validator = new MutationValidator(this.app);
  }

  /**
   * Register event listener for confirm-mutations events
   */
  register(): void {
    this.plugin.registerEvent(
      this.app.workspace.on(
        'sugar-rush:confirm-mutations' as any,
        this.handleConfirmMutations.bind(this)
      )
    );
  }

  /**
   * Handle the confirm-mutations event from oil view
   */
  private async handleConfirmMutations(payload: {
    mutations: FileMutation[];
    sourcePath: string;
    onComplete: (success: boolean) => Promise<void>;
  }): Promise<void> {
    const { mutations, onComplete } = payload;

    if (mutations.length === 0) {
      await onComplete(true);
      return;
    }

    // Check if we have deletes and need confirmation
    const deletes = mutations.filter(m => m.type === 'delete');
    if (deletes.length > 0 && this.plugin.settings.confirmBeforeDelete) {
      const confirmed = await this.showDeleteConfirmation(deletes);
      if (!confirmed) {
        new Notice('File operations cancelled');
        await onComplete(false);
        return;
      }
    }

    // Validate all mutations
    const validation = this.validator.validate(mutations);

    if (!validation.valid) {
      for (const error of validation.errors) {
        new Notice(`Error: ${error.message}`, 5000);
      }
      await onComplete(false);
      return;
    }

    // Show warnings if any
    for (const warning of validation.warnings) {
      console.warn(`Sugar Rush: ${warning.message}`);
    }

    // Execute mutations in order
    const result = await this.executeMutations(mutations);

    if (result.success) {
      new Notice(`Applied ${result.applied.length} file operations`);
    } else {
      new Notice(
        `Applied ${result.applied.length} operations, ${result.failed.length} failed`,
        5000
      );
      for (const failure of result.failed) {
        console.error(`Sugar Rush: Failed to apply ${failure.mutation.type}: ${failure.error}`);
      }
    }

    await onComplete(result.success);
  }

  /**
   * Show confirmation modal for delete operations
   */
  private async showDeleteConfirmation(deletes: FileMutation[]): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new ConfirmDeleteModal(
        this.app,
        deletes,
        this.plugin.settings.useTrashInsteadOfDelete,
        (confirmed) => resolve(confirmed)
      );
      modal.open();
    });
  }

  /**
   * Execute all mutations in the correct order
   */
  async executeMutations(mutations: FileMutation[]): Promise<MutationResult> {
    const ordered = orderMutations(mutations);
    const applied: FileMutation[] = [];
    const failed: Array<{ mutation: FileMutation; error: string }> = [];

    for (const mutation of ordered) {
      try {
        await this.executeSingleMutation(mutation);
        applied.push(mutation);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push({ mutation, error: message });
        console.error(`Sugar Rush: Failed to execute ${mutation.type} on ${mutation.originalPath}:`, error);
        // Continue with other mutations rather than aborting entirely
      }
    }

    return {
      success: failed.length === 0,
      applied,
      failed,
    };
  }

  /**
   * Execute a single mutation
   */
  private async executeSingleMutation(mutation: FileMutation): Promise<void> {
    switch (mutation.type) {
      case 'create':
        await this.executeCreate(mutation);
        break;
      case 'rename':
      case 'move':
        await this.executeRename(mutation);
        break;
      case 'delete':
        await this.executeDelete(mutation);
        break;
      default:
        throw new Error(`Unknown mutation type: ${(mutation as any).type}`);
    }
  }

  /**
   * Create a new file or folder
   */
  private async executeCreate(mutation: FileMutation): Promise<void> {
    if (!mutation.newPath) {
      throw new Error('Create mutation missing newPath');
    }

    // Check if this is a folder (trailing slash convention) or file
    const isFolder = mutation.entry.isDirectory || mutation.newPath.endsWith('/');
    const path = mutation.newPath.replace(/\/$/, ''); // Remove trailing slash for API

    if (isFolder) {
      // Create folder
      // Note: createFolder creates parent directories automatically
      await this.app.vault.createFolder(path);
    } else {
      // Create file with empty content
      // Ensure parent folder exists
      const parentPath = path.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parentExists = this.app.vault.getAbstractFileByPath(parentPath);
        if (!parentExists) {
          await this.app.vault.createFolder(parentPath);
        }
      }
      await this.app.vault.create(path, '');
    }
  }

  /**
   * Rename or move a file/folder
   * Uses fileManager.renameFile to automatically update links
   */
  private async executeRename(mutation: FileMutation): Promise<void> {
    if (!mutation.newPath) {
      throw new Error('Rename mutation missing newPath');
    }

    const file = this.app.vault.getAbstractFileByPath(mutation.originalPath);
    if (!file) {
      throw new Error(`File not found: ${mutation.originalPath}`);
    }

    // Use fileManager.renameFile which updates all links automatically
    // This is the recommended API for renames in Obsidian
    await this.app.fileManager.renameFile(file, mutation.newPath);
  }

  /**
   * Delete a file or folder
   * Uses trash or permanent delete based on settings
   */
  private async executeDelete(mutation: FileMutation): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(mutation.originalPath);
    if (!file) {
      // File doesn't exist, nothing to delete
      console.warn(`Sugar Rush: File "${mutation.originalPath}" already deleted`);
      return;
    }

    if (this.plugin.settings.useTrashInsteadOfDelete) {
      // Use fileManager.trashFile for safe deletion
      // This respects the user's Obsidian trash settings
      await this.app.fileManager.trashFile(file);
    } else {
      // Permanent deletion
      // The second parameter `true` means force delete (even for folders)
      await this.app.vault.delete(file, true);
    }
  }
}
```

### Decision 5: Confirmation Modal for Deletions

**What:** Modal dialog that lists files to be deleted and requires explicit confirmation.

**Why:**
- Prevents accidental data loss
- Shows exactly what will be deleted
- Indicates whether trash or permanent delete will be used
- Can be disabled via settings

```typescript
// src/ui/confirm-modal.ts

import { App, Modal, Setting } from 'obsidian';
import type { FileMutation } from '../types';

export class ConfirmDeleteModal extends Modal {
  private deletes: FileMutation[];
  private useTrash: boolean;
  private onConfirm: (confirmed: boolean) => void;
  private confirmed: boolean = false;

  constructor(
    app: App,
    deletes: FileMutation[],
    useTrash: boolean,
    onConfirm: (confirmed: boolean) => void
  ) {
    super(app);
    this.deletes = deletes;
    this.useTrash = useTrash;
    this.onConfirm = onConfirm;
  }

  onOpen(): void {
    const { contentEl } = this;

    // Title
    contentEl.createEl('h2', {
      text: this.useTrash ? 'Move to trash?' : 'Permanently delete?',
    });

    // Warning for permanent delete
    if (!this.useTrash) {
      const warningEl = contentEl.createEl('div', {
        cls: 'sugar-rush-delete-warning',
      });
      warningEl.createEl('strong', { text: 'Warning: ' });
      warningEl.createSpan({
        text: 'These files will be permanently deleted and cannot be recovered.',
      });
    }

    // List files to delete
    contentEl.createEl('p', {
      text: `The following ${this.deletes.length} item(s) will be ${this.useTrash ? 'moved to trash' : 'deleted'}:`,
    });

    const listEl = contentEl.createEl('ul', {
      cls: 'sugar-rush-delete-list',
    });

    // Limit display to first 10 items
    const displayCount = Math.min(this.deletes.length, 10);
    for (let i = 0; i < displayCount; i++) {
      const mutation = this.deletes[i];
      const itemEl = listEl.createEl('li');
      itemEl.createEl('code', { text: mutation.originalPath });
      if (mutation.entry.isDirectory) {
        itemEl.createSpan({ text: ' (folder)', cls: 'sugar-rush-folder-indicator' });
      }
    }

    if (this.deletes.length > 10) {
      listEl.createEl('li', {
        text: `... and ${this.deletes.length - 10} more`,
        cls: 'sugar-rush-more-indicator',
      });
    }

    // Buttons
    const buttonContainer = contentEl.createDiv({
      cls: 'sugar-rush-modal-buttons',
    });

    // Cancel button
    const cancelBtn = buttonContainer.createEl('button', {
      text: 'Cancel',
    });
    cancelBtn.addEventListener('click', () => {
      this.close();
    });

    // Confirm button
    const confirmBtn = buttonContainer.createEl('button', {
      text: this.useTrash ? 'Move to trash' : 'Delete permanently',
      cls: this.useTrash ? 'mod-warning' : 'mod-destructive',
    });
    confirmBtn.addEventListener('click', () => {
      this.confirmed = true;
      this.close();
    });

    // Focus cancel button by default (safer)
    cancelBtn.focus();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
    this.onConfirm(this.confirmed);
  }
}
```

### Decision 6: CSS for Confirmation Modal

**What:** Styles for the delete confirmation modal.

```css
/* styles.css additions */

/* Delete confirmation modal */
.sugar-rush-delete-warning {
  background: var(--background-modifier-error);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.sugar-rush-delete-list {
  max-height: 300px;
  overflow-y: auto;
  background: var(--background-secondary);
  padding: 8px 8px 8px 24px;
  border-radius: 4px;
  margin: 8px 0;
}

.sugar-rush-delete-list li {
  padding: 4px 0;
}

.sugar-rush-delete-list code {
  font-size: var(--font-ui-small);
}

.sugar-rush-folder-indicator {
  color: var(--text-muted);
  font-size: var(--font-ui-smaller);
  margin-left: 8px;
}

.sugar-rush-more-indicator {
  color: var(--text-muted);
  font-style: italic;
}

.sugar-rush-modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.sugar-rush-modal-buttons button.mod-destructive {
  background: var(--background-modifier-error);
  color: var(--text-on-accent);
}

.sugar-rush-modal-buttons button.mod-destructive:hover {
  background: var(--background-modifier-error-hover);
}
```

### Decision 7: Integration with Main Plugin

**What:** Register the mutation executor in the main plugin lifecycle.

```typescript
// src/main.ts additions

import { FileMutationExecutor } from './mutations/executor';

export default class SugarRushPlugin extends Plugin {
  settings: SugarRushSettings = DEFAULT_SETTINGS;
  private mutationExecutor: FileMutationExecutor;

  async onload(): Promise<void> {
    console.log(`Loading ${PLUGIN_ID} plugin`);

    // Load persisted settings
    await this.loadSettings();

    // Register settings tab
    this.addSettingTab(new SugarRushSettingTab(this.app, this));

    // Register mutation executor (listens for confirm events)
    this.mutationExecutor = new FileMutationExecutor(this);
    this.mutationExecutor.register();

    // Register all commands
    registerCommands(this);

    console.log(`${PLUGIN_ID} plugin loaded successfully`);
  }

  // ... rest of plugin
}
```

### Decision 8: Type Extensions

**What:** Extend types.ts with mutation-specific types.

```typescript
// src/types.ts additions

/**
 * Payload for the confirm-mutations event
 */
export interface ConfirmMutationsPayload {
  /** List of mutations to apply */
  mutations: FileMutation[];
  /** Source directory path */
  sourcePath: string;
  /** Callback when mutations complete */
  onComplete: (success: boolean) => Promise<void>;
}

/**
 * Result of executing mutations
 */
export interface MutationExecutionResult {
  /** Whether all mutations succeeded */
  success: boolean;
  /** Successfully applied mutations */
  applied: FileMutation[];
  /** Failed mutations with error messages */
  failed: Array<{
    mutation: FileMutation;
    error: string;
  }>;
}
```

## Risks / Trade-offs

### Risk 1: Partial Failure State
**Risk:** Some mutations succeed, others fail, leaving vault in inconsistent state.
**Mitigation:**
- Continue executing remaining mutations after a failure
- Report all failures to user
- User can manually fix and retry
- Future: Could add rollback capability

### Risk 2: Race Conditions with External Changes
**Risk:** User modifies files externally while mutations are queued.
**Mitigation:**
- Validation checks file existence before execution
- Operations use Obsidian APIs which handle concurrency
- Future: Could add file locking or change detection

### Risk 3: Large Batch Performance
**Risk:** Applying hundreds of mutations could be slow or cause UI freeze.
**Mitigation:**
- Operations are async and don't block main thread
- Future: Could add progress indicator
- Future: Could batch similar operations

### Risk 4: Link Update Failures
**Risk:** `renameFile` might fail to update all links in some cases.
**Mitigation:**
- This is an Obsidian API limitation, not our bug
- User can use Obsidian's built-in link repair tools
- We use the recommended API for link updates

## Migration Plan

Not applicable - new feature implementation.

## Open Questions

1. **Should we support undo?**
   - Decision: Defer to later enhancement
   - Complexity of tracking operations and reversing them

2. **Should confirmation modal be per-file or batch?**
   - Decision: Batch (one modal for all deletes)
   - Less intrusive, user sees full picture

3. **What if a folder delete contains unsaved changes?**
   - Decision: Obsidian handles this automatically
   - We use standard Obsidian APIs which handle edge cases

4. **Should we show a progress bar for large batches?**
   - Decision: Defer to later enhancement
   - Most operations complete quickly
