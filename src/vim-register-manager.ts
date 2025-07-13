import { TFile, TFolder, TAbstractFile } from 'obsidian';
import { createComponentLogger } from './logger';
import type { Logger } from './logger';

export interface RegisterEntry {
  type: 'file' | 'folder';
  path: string;
  name: string;
  operation: 'yank' | 'cut';
}

export class VimRegisterManager {
  private registers: Map<string, RegisterEntry[]> = new Map();
  private defaultRegister = '"';
  private log?: ReturnType<typeof createComponentLogger>;

  constructor(logger?: Logger) {
    if (logger) {
      this.log = createComponentLogger(logger, 'VimRegisterManager');
    }
  }

  /**
   * Yanks (copies) files to a register
   */
  yank(files: TAbstractFile[], register: string = this.defaultRegister): void {
    const entries: RegisterEntry[] = files.map(file => ({
      type: file instanceof TFolder ? 'folder' : 'file',
      path: file.path,
      name: file.name,
      operation: 'yank'
    }));

    this.registers.set(register, entries);
    this.log?.info('Yanked files to register', { register, count: entries.length });
  }

  /**
   * Cuts files to a register (for move operations)
   */
  cut(files: TAbstractFile[], register: string = this.defaultRegister): void {
    const entries: RegisterEntry[] = files.map(file => ({
      type: file instanceof TFolder ? 'folder' : 'file',
      path: file.path,
      name: file.name,
      operation: 'cut'
    }));

    this.registers.set(register, entries);
    this.log?.info('Cut files to register', { register, count: entries.length });
  }

  /**
   * Gets files from a register
   */
  get(register: string = this.defaultRegister): RegisterEntry[] {
    return this.registers.get(register) || [];
  }

  /**
   * Clears a register
   */
  clear(register: string = this.defaultRegister): void {
    this.registers.delete(register);
    this.log?.debug('Cleared register', { register });
  }

  /**
   * Clears all registers
   */
  clearAll(): void {
    this.registers.clear();
    this.log?.debug('Cleared all registers');
  }

  /**
   * Gets all non-empty registers
   */
  getAllRegisters(): Map<string, RegisterEntry[]> {
    return new Map(this.registers);
  }

  /**
   * Checks if a register has content
   */
  hasContent(register: string = this.defaultRegister): boolean {
    const content = this.registers.get(register);
    return content !== undefined && content.length > 0;
  }
}