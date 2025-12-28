import { App, TFolder, TFile, TAbstractFile } from 'obsidian';
import type { OilEntry, FileMutation } from '../types';
import type { SugarRushSettings } from '../settings';

export class OilBuffer {
  private app: App;
  private settings: SugarRushSettings;
  private originalEntries: OilEntry[] = [];
  private currentPath: string = '';

  constructor(app: App, settings: SugarRushSettings) {
    this.app = app;
    this.settings = settings;
  }

  /**
   * Load directory contents
   */
  async loadDirectory(path: string): Promise<void> {
    this.currentPath = path;
    this.originalEntries = [];

    let children: TAbstractFile[];

    if (path === '') {
      children = this.app.vault.getRoot().children;
    } else {
      const folder = this.app.vault.getAbstractFileByPath(path);
      children = folder instanceof TFolder ? folder.children : [];
    }

    // Sort and filter
    children = this.sortAndFilter(children);

    // Build entries
    let lineNumber = 0;
    for (const child of children) {
      const isDirectory = child instanceof TFolder;
      this.originalEntries.push({
        originalPath: child.path,
        displayName: child.name,
        isDirectory,
        file: isDirectory ? null : (child as TFile),
        folder: isDirectory ? (child as TFolder) : null,
        lineNumber: lineNumber++,
      });
    }
  }

  /**
   * Sort and filter children
   */
  private sortAndFilter(children: TAbstractFile[]): TAbstractFile[] {
    // Filter hidden files if needed
    if (!this.settings.showHiddenFiles) {
      children = children.filter(c => !c.name.startsWith('.'));
    }

    // Sort
    const { sortOrder, directoryFirst } = this.settings.display;

    return [...children].sort((a, b) => {
      if (directoryFirst) {
        const aDir = a instanceof TFolder;
        const bDir = b instanceof TFolder;
        if (aDir && !bDir) return -1;
        if (!aDir && bDir) return 1;
      }

      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        case 'modified':
          const aTime = a instanceof TFile ? a.stat.mtime : 0;
          const bTime = b instanceof TFile ? b.stat.mtime : 0;
          return bTime - aTime;
        case 'size':
          const aSize = a instanceof TFile ? a.stat.size : 0;
          const bSize = b instanceof TFile ? b.stat.size : 0;
          return bSize - aSize;
        default:
          return 0;
      }
    });
  }

  /**
   * Render entries to plain text for editor
   */
  renderToText(): string {
    const lines = this.originalEntries.map(entry => {
      if (entry.isDirectory) {
        return `${entry.displayName}/`;
      }
      return entry.displayName;
    });
    return lines.join('\n');
  }

  /**
   * Get entry for a given line text
   */
  getEntryForLine(lineText: string): OilEntry | null {
    const name = lineText.trim().replace(/\/$/, '');
    return this.originalEntries.find(e => e.displayName === name) ?? null;
  }

  /**
   * Get all original entries
   */
  getEntries(): OilEntry[] {
    return [...this.originalEntries];
  }

  /**
   * Parse current editor content and diff against original
   */
  parseAndDiff(content: string): FileMutation[] {
    const mutations: FileMutation[] = [];
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const seenPaths = new Set<string>();

    // Parse each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';
      const isDir = line.endsWith('/');
      const name = isDir ? line.slice(0, -1) : line;

      if (!name) continue;

      // Find matching original by position
      const original = this.originalEntries[i];

      if (original) {
        seenPaths.add(original.originalPath);

        // Check if renamed
        if (original.displayName !== name) {
          const newPath = this.currentPath
            ? `${this.currentPath}/${name}`
            : name;

          mutations.push({
            type: 'rename',
            originalPath: original.originalPath,
            newPath,
            entry: { ...original, displayName: name },
          });
        }
      } else {
        // New entry
        const newPath = this.currentPath ? `${this.currentPath}/${name}` : name;

        mutations.push({
          type: 'create',
          originalPath: '',
          newPath,
          entry: {
            originalPath: '',
            displayName: name,
            isDirectory: isDir,
            file: null,
            folder: null,
            lineNumber: i,
          },
        });
      }
    }

    // Check for deletions
    for (const entry of this.originalEntries) {
      if (!seenPaths.has(entry.originalPath)) {
        // Check if name appears anywhere
        const name = entry.displayName;
        const stillExists = lines.some(l => {
          const lineName = l?.trim().replace(/\/$/, '');
          return lineName === name;
        });

        if (!stillExists) {
          mutations.push({
            type: 'delete',
            originalPath: entry.originalPath,
            entry,
          });
        }
      }
    }

    return mutations;
  }
}
