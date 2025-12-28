import { App, Notice } from 'obsidian';
import type { FileMutation, MutationExecutionResult, ConfirmMutationsPayload } from '../types';
import type SugarRushPlugin from '../main';
import { MutationValidator } from './validator';
import { orderMutations } from './order';
import { ConfirmDeleteModal } from '../ui/confirm-modal';

/**
 * Executes file mutations in response to confirmation events from the oil view
 */
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
  private async handleConfirmMutations(payload: ConfirmMutationsPayload): Promise<void> {
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
  async executeMutations(mutations: FileMutation[]): Promise<MutationExecutionResult> {
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
