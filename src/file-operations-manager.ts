import { App, TFile, TFolder, Notice } from 'obsidian';
import type { FileOperation } from './buffer-parser';
import { createComponentLogger } from './logger';
import type { Logger } from './logger';

export interface OperationBatch {
  type: 'rename' | 'move' | 'delete' | 'create';
  operations: FileOperation[];
}

export interface OperationResult {
  success: boolean;
  operation: FileOperation;
  error?: string;
}

export class FileOperationsManager {
  private app: App;
  private undoHistory: FileOperation[][] = [];
  private maxUndoHistory: number = 50;
  private log?: ReturnType<typeof createComponentLogger>;

  constructor(app: App, maxUndoHistory: number = 50, logger?: Logger) {
    this.app = app;
    this.maxUndoHistory = maxUndoHistory;
    if (logger) {
      this.log = createComponentLogger(logger, 'FileOperationsManager');
    }
  }

  /**
   * Executes a batch of file operations
   */
  async executeFileOperations(operations: FileOperation[]): Promise<OperationResult[]> {
    if (operations.length === 0) {
      this.log?.debug('No operations to execute');
      return [];
    }

    this.log?.info('Executing file operations', { operationCount: operations.length });
    const results: OperationResult[] = [];
    
    // Group operations by type for efficient execution
    const batches = this.groupOperationsByType(operations);
    
    // Store operations for undo functionality
    this.addToUndoHistory(operations);
    
    try {
      for (const batch of batches) {
        const batchResults = await this.executeBatch(batch);
        results.push(...batchResults);
      }
      
      // Trigger metadata cache update
      await this.updateMetadataCache();
      
      // Show success notification
      if (results.every(r => r.success)) {
        new Notice(`Successfully executed ${operations.length} file operation(s)`);
      } else {
        const failed = results.filter(r => !r.success).length;
        new Notice(`Completed with ${failed} error(s). Check console for details.`);
      }
      
    } catch (error) {
      console.error('Sugar Rush: Failed to execute file operations:', error);
      new Notice('Failed to execute file operations');
    }
    
    return results;
  }

  /**
   * Groups operations by type for batch processing
   */
  private groupOperationsByType(operations: FileOperation[]): OperationBatch[] {
    const batches: Map<string, FileOperation[]> = new Map();
    
    // Process in specific order: creates, renames, moves, then deletes
    const order = ['create', 'rename', 'move', 'delete'];
    
    for (const type of order) {
      batches.set(type, operations.filter(op => op.type === type));
    }
    
    return Array.from(batches.entries())
      .filter(([_, ops]) => ops.length > 0)
      .map(([type, ops]) => ({ type: type as any, operations: ops }));
  }

  /**
   * Executes a single batch of operations
   */
  private async executeBatch(batch: OperationBatch): Promise<OperationResult[]> {
    const results: OperationResult[] = [];
    
    for (const operation of batch.operations) {
      try {
        const result = await this.executeOperation(operation);
        results.push(result);
        
        if (!result.success) {
          console.error(`Sugar Rush: Operation failed:`, result.error);
        }
      } catch (error) {
        results.push({
          success: false,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * Executes a single file operation
   */
  private async executeOperation(operation: FileOperation): Promise<OperationResult> {
    switch (operation.type) {
      case 'create':
        return await this.executeCreate(operation);
      case 'rename':
        return await this.executeRename(operation);
      case 'move':
        return await this.executeMove(operation);
      case 'delete':
        return await this.executeDelete(operation);
      default:
        return {
          success: false,
          operation,
          error: `Unknown operation type: ${(operation as any).type}`
        };
    }
  }

  /**
   * Creates a new file or folder
   */
  private async executeCreate(operation: FileOperation): Promise<OperationResult> {
    if (!operation.path || !operation.newName) {
      return {
        success: false,
        operation,
        error: 'Missing path or name for create operation'
      };
    }

    try {
      // Check if file already exists
      const existing = this.app.vault.getAbstractFileByPath(operation.path);
      if (existing) {
        return {
          success: false,
          operation,
          error: `File already exists: ${operation.path}`
        };
      }

      // Determine if it's a folder based on the name
      const isFolder = !operation.newName.includes('.') || operation.newName.endsWith('/');
      
      if (isFolder) {
        // Create folder
        await this.app.vault.createFolder(operation.path);
      } else {
        // Create file with default content
        const content = operation.newName.endsWith('.md') ? '' : '';
        await this.app.vault.create(operation.path, content);
      }

      return {
        success: true,
        operation
      };
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : 'Failed to create file'
      };
    }
  }

  /**
   * Renames a file or folder
   */
  private async executeRename(operation: FileOperation): Promise<OperationResult> {
    if (!operation.oldPath || !operation.newPath) {
      return {
        success: false,
        operation,
        error: 'Missing paths for rename operation'
      };
    }

    try {
      const file = this.app.vault.getAbstractFileByPath(operation.oldPath);
      if (!file) {
        return {
          success: false,
          operation,
          error: `File not found: ${operation.oldPath}`
        };
      }

      // Check if target already exists
      const existing = this.app.vault.getAbstractFileByPath(operation.newPath);
      if (existing) {
        return {
          success: false,
          operation,
          error: `Target already exists: ${operation.newPath}`
        };
      }

      // Use Obsidian's file manager for proper link updating
      await this.app.fileManager.renameFile(file, operation.newPath);

      return {
        success: true,
        operation
      };
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : 'Failed to rename file'
      };
    }
  }

  /**
   * Moves a file or folder to a different directory
   */
  private async executeMove(operation: FileOperation): Promise<OperationResult> {
    if (!operation.oldPath || !operation.targetDirectory) {
      return {
        success: false,
        operation,
        error: 'Missing paths for move operation'
      };
    }

    try {
      const file = this.app.vault.getAbstractFileByPath(operation.oldPath);
      if (!file) {
        return {
          success: false,
          operation,
          error: `File not found: ${operation.oldPath}`
        };
      }

      const targetDir = this.app.vault.getAbstractFileByPath(operation.targetDirectory);
      if (!targetDir || !(targetDir instanceof TFolder)) {
        return {
          success: false,
          operation,
          error: `Target directory not found: ${operation.targetDirectory}`
        };
      }

      const newPath = `${operation.targetDirectory}/${file.name}`;
      
      // Check if target already exists
      const existing = this.app.vault.getAbstractFileByPath(newPath);
      if (existing) {
        return {
          success: false,
          operation,
          error: `Target already exists: ${newPath}`
        };
      }

      // Use file manager for proper link updating
      await this.app.fileManager.renameFile(file, newPath);

      return {
        success: true,
        operation
      };
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : 'Failed to move file'
      };
    }
  }

  /**
   * Deletes a file or folder
   */
  private async executeDelete(operation: FileOperation): Promise<OperationResult> {
    if (!operation.path) {
      return {
        success: false,
        operation,
        error: 'Missing path for delete operation'
      };
    }

    try {
      const file = this.app.vault.getAbstractFileByPath(operation.path);
      if (!file) {
        return {
          success: false,
          operation,
          error: `File not found: ${operation.path}`
        };
      }

      // Move to trash instead of permanent deletion for safety
      await this.app.vault.trash(file, false);

      return {
        success: true,
        operation
      };
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  }

  /**
   * Updates Obsidian's metadata cache after operations
   */
  private async updateMetadataCache(): Promise<void> {
    try {
      // Trigger metadata cache update
      this.app.metadataCache.trigger('resolved');
      
      // Wait a bit for the cache to update
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('Sugar Rush: Failed to update metadata cache:', error);
    }
  }

  /**
   * Adds operations to undo history
   */
  private addToUndoHistory(operations: FileOperation[]): void {
    this.undoHistory.push([...operations]);
    
    // Maintain history size
    if (this.undoHistory.length > this.maxUndoHistory) {
      this.undoHistory.shift();
    }
  }

  /**
   * Gets the last set of operations for undo
   */
  getLastOperations(): FileOperation[] | null {
    return this.undoHistory.length > 0 ? this.undoHistory[this.undoHistory.length - 1] || null : null;
  }

  /**
   * Attempts to undo the last set of operations
   */
  async undoLastOperations(): Promise<boolean> {
    const lastOps = this.undoHistory.pop();
    if (!lastOps) return false;

    try {
      // Create reverse operations
      const reverseOps = this.createReverseOperations(lastOps);
      
      // Execute reverse operations without adding to undo history
      const results = await this.executeOperationsWithoutUndo(reverseOps);
      
      const success = results.every(r => r.success);
      if (success) {
        new Notice('Successfully undid file operations');
      } else {
        new Notice('Failed to undo some operations');
        // Add back to history if undo failed
        this.undoHistory.push(lastOps);
      }
      
      return success;
    } catch (error) {
      console.error('Sugar Rush: Failed to undo operations:', error);
      // Add back to history if undo failed
      this.undoHistory.push(lastOps);
      return false;
    }
  }

  /**
   * Creates reverse operations for undo functionality
   */
  private createReverseOperations(operations: FileOperation[]): FileOperation[] {
    const reverseOps: FileOperation[] = [];
    
    // Process in reverse order
    for (let i = operations.length - 1; i >= 0; i--) {
      const op = operations[i];
      if (!op) continue;
      
      switch (op.type) {
        case 'create':
          // Reverse of create is delete
          reverseOps.push({
            type: 'delete',
            path: op.path
          });
          break;
          
        case 'rename':
          // Reverse of rename is rename back
          if (op.newPath && op.oldPath) {
            reverseOps.push({
              type: 'rename',
              path: op.oldPath,
              oldPath: op.newPath,
              newPath: op.oldPath
            });
          }
          break;
          
        case 'delete':
          // Can't easily reverse delete, skip for now
          // In the future, could implement trash recovery
          break;
          
        case 'move':
          // Reverse of move is move back
          if (op.oldPath && op.targetDirectory) {
            const fileName = op.oldPath.split('/').pop();
            if (fileName) {
              const originalDir = op.oldPath.replace('/' + fileName, '');
              reverseOps.push({
                type: 'move',
                path: op.oldPath,
                oldPath: `${op.targetDirectory}/${fileName}`,
                targetDirectory: originalDir
              });
            }
          }
          break;
      }
    }
    
    return reverseOps;
  }

  /**
   * Executes operations without adding to undo history
   */
  private async executeOperationsWithoutUndo(operations: FileOperation[]): Promise<OperationResult[]> {
    const results: OperationResult[] = [];
    
    for (const operation of operations) {
      try {
        const result = await this.executeOperation(operation);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * Clears undo history
   */
  clearUndoHistory(): void {
    this.undoHistory = [];
  }
}