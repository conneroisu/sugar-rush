import { TFolder, App } from 'obsidian';
import type { FileMutation, ValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Validates mutations before execution to catch errors early
 */
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
          this.validateCreate(mutation, createdPaths, errors);
          break;

        case 'rename':
        case 'move':
          this.validateRename(mutation, mutations, deletedPaths, renames, errors);
          break;

        case 'delete':
          this.validateDelete(mutation, deletedPaths, errors, warnings);
          break;
      }
    }

    // Check for circular renames
    this.detectCircularRenames(renames, mutations, errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate create mutations
   */
  private validateCreate(
    mutation: FileMutation,
    createdPaths: Set<string>,
    errors: ValidationError[]
  ): void {
    if (!mutation.newPath) return;

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

  /**
   * Validate rename/move mutations
   */
  private validateRename(
    mutation: FileMutation,
    allMutations: FileMutation[],
    deletedPaths: Set<string>,
    renames: Map<string, string>,
    errors: ValidationError[]
  ): void {
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
        const isRenamed = allMutations.some(
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
  }

  /**
   * Validate delete mutations
   */
  private validateDelete(
    mutation: FileMutation,
    deletedPaths: Set<string>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
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
  }

  /**
   * Detect circular renames (A -> B and B -> A)
   */
  private detectCircularRenames(
    renames: Map<string, string>,
    mutations: FileMutation[],
    errors: ValidationError[]
  ): void {
    for (const [from, to] of renames) {
      if (renames.get(to) === from) {
        const mutation = mutations.find(m => m.originalPath === from);
        if (mutation) {
          errors.push({
            mutation,
            message: `Circular rename detected: "${from}" <-> "${to}"`,
          });
        }
      }
    }
  }
}
