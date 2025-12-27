import { App, Modal } from 'obsidian';
import type { FileMutation } from '../types';

/**
 * Modal dialog for confirming delete operations
 */
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
