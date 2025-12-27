import type { NavigationHistory, NavigationHistoryEntry } from '../types';

const MAX_HISTORY_SIZE = 50;

/**
 * Manages navigation history for a single oil view instance
 */
export class NavigationHistoryManager {
  private history: NavigationHistory;

  constructor() {
    this.history = {
      entries: [],
      currentIndex: -1,
    };
  }

  /**
   * Push a new path onto the history stack
   * Truncates forward history if navigating from middle of stack
   */
  push(path: string, scrollTop?: number, selectedLine?: number): void {
    // If we're not at the end, truncate forward history
    if (this.history.currentIndex < this.history.entries.length - 1) {
      this.history.entries = this.history.entries.slice(0, this.history.currentIndex + 1);
    }

    // Add new entry
    const entry: NavigationHistoryEntry = {
      path,
      timestamp: Date.now(),
      scrollTop,
      selectedLine,
    };

    this.history.entries.push(entry);
    this.history.currentIndex = this.history.entries.length - 1;

    // Enforce max size
    if (this.history.entries.length > MAX_HISTORY_SIZE) {
      this.history.entries.shift();
      this.history.currentIndex--;
    }
  }

  /**
   * Navigate back in history
   * @returns The previous entry, or null if at beginning
   */
  goBack(): NavigationHistoryEntry | null {
    if (!this.canGoBack()) {
      return null;
    }

    this.history.currentIndex--;
    return this.history.entries[this.history.currentIndex];
  }

  /**
   * Navigate forward in history
   * @returns The next entry, or null if at end
   */
  goForward(): NavigationHistoryEntry | null {
    if (!this.canGoForward()) {
      return null;
    }

    this.history.currentIndex++;
    return this.history.entries[this.history.currentIndex];
  }

  /**
   * Check if back navigation is possible
   */
  canGoBack(): boolean {
    return this.history.currentIndex > 0;
  }

  /**
   * Check if forward navigation is possible
   */
  canGoForward(): boolean {
    return this.history.currentIndex < this.history.entries.length - 1;
  }

  /**
   * Get current entry
   */
  getCurrent(): NavigationHistoryEntry | null {
    if (this.history.currentIndex < 0) {
      return null;
    }
    return this.history.entries[this.history.currentIndex];
  }

  /**
   * Update scroll position for current entry
   */
  updateCurrentScroll(scrollTop: number, selectedLine?: number): void {
    const current = this.getCurrent();
    if (current) {
      current.scrollTop = scrollTop;
      current.selectedLine = selectedLine;
    }
  }

  /**
   * Get full history for debugging
   */
  getHistory(): NavigationHistory {
    return { ...this.history };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = {
      entries: [],
      currentIndex: -1,
    };
  }
}
