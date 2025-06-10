import { TFile, TFolder } from 'obsidian';

export interface FileOperation {
  type: 'rename' | 'move' | 'delete' | 'create';
  path: string;
  oldPath?: string;
  newPath?: string;
  newName?: string;
  targetDirectory?: string;
}

export interface DirectoryLine {
  path: string;
  name: string;
  isFolder: boolean;
  depth: number;
  lineNumber: number;
  originalPath?: string;
  existsInOriginal?: boolean;
}

export class BufferParser {
  
  /**
   * Parses directory buffer content and returns file operations to execute
   */
  parseFileOperations(originalContent: string, editedContent: string, basePath: string): FileOperation[] {
    const originalLines = this.parseDirectoryLines(originalContent, basePath);
    const editedLines = this.parseDirectoryLines(editedContent, basePath);
    
    const operations: FileOperation[] = [];
    
    // Create maps for easier lookup
    const originalMap = new Map(originalLines.map(line => [line.lineNumber, line]));
    const editedMap = new Map(editedLines.map(line => [line.lineNumber, line]));
    
    // Detect deletions (lines removed from original)
    for (const [lineNum, originalLine] of originalMap) {
      if (!editedMap.has(lineNum) && originalLine.name !== '..') {
        operations.push({
          type: 'delete',
          path: originalLine.path
        });
      }
    }
    
    // Detect renames and modifications
    for (const [lineNum, editedLine] of editedMap) {
      const originalLine = originalMap.get(lineNum);
      
      if (originalLine) {
        // Line exists in both - check for rename
        if (originalLine.name !== editedLine.name && editedLine.name !== '..') {
          const newPath = this.constructNewPath(basePath, editedLine.name, originalLine.isFolder);
          operations.push({
            type: 'rename',
            path: newPath,
            oldPath: originalLine.path,
            newPath: newPath,
            newName: editedLine.name
          });
        }
      } else {
        // New line - file/folder creation
        if (editedLine.name !== '..' && editedLine.name.trim() !== '') {
          const newPath = this.constructNewPath(basePath, editedLine.name, editedLine.isFolder);
          operations.push({
            type: 'create',
            path: newPath,
            newName: editedLine.name
          });
        }
      }
    }
    
    // Detect moves (changes in directory structure)
    // This is more complex and will be implemented in Phase 3
    
    return operations;
  }
  
  /**
   * Parses directory content into structured line data
   */
  private parseDirectoryLines(content: string, basePath: string): DirectoryLine[] {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const directoryLines: DirectoryLine[] = [];
    
    lines.forEach((line, index) => {
      const parsed = this.parseDirectoryLine(line, index, basePath);
      if (parsed) {
        directoryLines.push(parsed);
      }
    });
    
    return directoryLines;
  }
  
  /**
   * Parses a single line of directory content
   */
  private parseDirectoryLine(line: string, lineNumber: number, basePath: string): DirectoryLine | null {
    // Match patterns like "📁 folder-name" or "📄 file-name.md"
    const match = line.match(/^(\s*)([📁📄])\s+(.+)$/);
    if (!match) return null;
    
    const [, indent, icon, name] = match;
    const depth = Math.floor((indent || '').length / 2); // Assuming 2 spaces per indent level
    const isFolder = icon === '📁';
    
    const path = name === '..' 
      ? this.getParentPath(basePath)
      : this.constructPath(basePath, name || '');
    
    return {
      path,
      name: name || '',
      isFolder,
      depth,
      lineNumber,
      existsInOriginal: true
    };
  }
  
  /**
   * Constructs full path for a file/folder
   */
  private constructPath(basePath: string, name: string): string {
    if (basePath === '/' || basePath === '') {
      return name;
    }
    return `${basePath}/${name}`;
  }
  
  /**
   * Constructs new path after rename/create operations
   */
  private constructNewPath(basePath: string, name: string, isFolder: boolean): string {
    let cleanName = name.trim();
    
    // Auto-add .md extension for files if not present
    if (!isFolder && !cleanName.includes('.')) {
      cleanName += '.md';
    }
    
    return this.constructPath(basePath, cleanName);
  }
  
  /**
   * Gets parent directory path
   */
  private getParentPath(path: string): string {
    if (path === '/' || path === '') return '/';
    const segments = path.split('/').filter(s => s !== '');
    return segments.length > 1 ? '/' + segments.slice(0, -1).join('/') : '/';
  }
  
  /**
   * Validates file operations before execution
   */
  validateOperations(operations: FileOperation[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const op of operations) {
      switch (op.type) {
        case 'rename':
          if (!op.oldPath || !op.newPath) {
            errors.push(`Invalid rename operation: missing paths`);
          }
          if (op.newName && !this.isValidFileName(op.newName)) {
            errors.push(`Invalid filename: ${op.newName}`);
          }
          break;
          
        case 'create':
          if (!op.path || !op.newName) {
            errors.push(`Invalid create operation: missing path or name`);
          }
          if (op.newName && !this.isValidFileName(op.newName)) {
            errors.push(`Invalid filename: ${op.newName}`);
          }
          break;
          
        case 'delete':
          if (!op.path) {
            errors.push(`Invalid delete operation: missing path`);
          }
          break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validates filename according to filesystem rules
   */
  private isValidFileName(name: string): boolean {
    if (!name || name.trim() === '') return false;
    
    // Check for invalid characters (Windows + Unix)
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) return false;
    
    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(name)) return false;
    
    // Check length (most filesystems support up to 255 characters)
    if (name.length > 255) return false;
    
    return true;
  }
  
  /**
   * Formats directory contents as editable buffer text
   */
  formatDirectoryAsBuffer(files: (TFile | TFolder)[], showExtensions: boolean = true): string {
    return files.map(file => {
      const icon = file instanceof TFolder ? '📁' : '📄';
      let name = file.name;
      
      // Handle parent directory
      if (name === '..') {
        return `📁 ..`;
      }
      
      // Optionally hide extensions for files
      if (!showExtensions && file instanceof TFile) {
        const lastDot = name.lastIndexOf('.');
        if (lastDot > 0) {
          name = name.substring(0, lastDot);
        }
      }
      
      return `${icon} ${name}`;
    }).join('\n');
  }
  
  /**
   * Extracts file information from a buffer line
   */
  extractFileFromLine(line: string): { name: string; isFolder: boolean } | null {
    const match = line.match(/^[📁📄]\s+(.+)$/);
    if (!match) return null;
    
    const name = match[1] || '';
    const isFolder = line.startsWith('📁');
    
    return { name, isFolder };
  }
}
