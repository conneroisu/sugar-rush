# Design: Split Navigation

## Context

Split navigation is a core feature of oil.nvim that allows users to open directories in new splits/panes. This enables powerful workflows where users can view multiple directories simultaneously, compare contents, and navigate hierarchies while keeping context visible.

**Critical Obsidian Workspace APIs:**
- `workspace.getLeaf('split', 'vertical')` - Creates a new leaf split to the right
- `workspace.getLeaf('split', 'horizontal')` - Creates a new leaf split below
- `workspace.getLeaf('tab')` - Creates a new tab in the current pane
- `workspace.getLeaf(false)` - Returns existing navigable leaf or creates new one
- `leaf.setViewState({ type: OIL_VIEW_TYPE, active: true })` - Sets the view type for a leaf

**Constraints:**
- Must work with Obsidian's WorkspaceLeaf and view system
- Each oil view instance maintains independent state (directory, history, pending mutations)
- Navigation history is per-view, not global
- Must handle edge cases like vault root navigation

**Stakeholders:**
- Users navigating file hierarchies
- Oil view implementation (depends on this for split behavior)
- Command palette (exposes split commands)

## Goals / Non-Goals

**Goals:**
- Enable opening directories in vertical/horizontal splits via keyboard shortcuts
- Maintain navigation history (back/forward) per oil view instance
- Integrate with Obsidian's workspace system seamlessly
- Provide keyboard-driven workflow matching oil.nvim patterns
- Support both keybinding and command palette access

**Non-Goals:**
- Tab-based navigation (can be added later)
- Custom split ratio controls (use Obsidian defaults)
- Syncing state between split views
- File drag-and-drop between splits (separate feature)

## Decisions

### Decision 1: Split Navigation Architecture

**What:** Create a split manager module that encapsulates Obsidian workspace split operations

**Why:**
- Centralizes workspace manipulation logic
- Testable in isolation
- Clear API for oil view to consume
- Handles edge cases consistently

**Code Sample:**

```typescript
// src/views/split-manager.ts

import { WorkspaceLeaf, App } from 'obsidian';
import { OIL_VIEW_TYPE } from '../constants';
import type { OilView } from './oil-view';

export type SplitDirection = 'vertical' | 'horizontal';

export interface SplitResult {
  leaf: WorkspaceLeaf;
  view: OilView | null;
}

/**
 * Manages workspace split operations for oil views
 */
export class SplitManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Open a directory in a new split
   *
   * @param direction - 'vertical' (right) or 'horizontal' (below)
   * @param targetPath - Directory path to open in the new split
   * @returns The new leaf and view
   */
  async openInSplit(direction: SplitDirection, targetPath: string): Promise<SplitResult> {
    const { workspace } = this.app;

    // Create new leaf with specified split direction
    // 'vertical' = split to the right, 'horizontal' = split below
    const newLeaf = workspace.getLeaf('split', direction);

    // Set the view state to oil view
    await newLeaf.setViewState({
      type: OIL_VIEW_TYPE,
      active: true,
      state: { path: targetPath },
    });

    // Get the view instance (it will be created by the setViewState call)
    const view = newLeaf.view as OilView | null;

    // Navigate to the target path if view was created
    if (view && typeof view.navigateTo === 'function') {
      await view.navigateTo(targetPath);
    }

    return { leaf: newLeaf, view };
  }

  /**
   * Open a directory in a new tab (same pane)
   *
   * @param targetPath - Directory path to open in the new tab
   * @returns The new leaf and view
   */
  async openInTab(targetPath: string): Promise<SplitResult> {
    const { workspace } = this.app;

    // Create new tab in current pane
    const newLeaf = workspace.getLeaf('tab');

    await newLeaf.setViewState({
      type: OIL_VIEW_TYPE,
      active: true,
      state: { path: targetPath },
    });

    const view = newLeaf.view as OilView | null;

    if (view && typeof view.navigateTo === 'function') {
      await view.navigateTo(targetPath);
    }

    return { leaf: newLeaf, view };
  }

  /**
   * Navigate in the current leaf (reuse existing)
   * This is used for the `-` key parent navigation
   *
   * @param currentLeaf - The leaf to navigate in
   * @param targetPath - Directory path to navigate to
   */
  async navigateInPlace(currentLeaf: WorkspaceLeaf, targetPath: string): Promise<void> {
    const view = currentLeaf.view as OilView | null;

    if (view && typeof view.navigateTo === 'function') {
      await view.navigateTo(targetPath);
    }
  }

  /**
   * Get or create an oil view leaf
   * Uses workspace.getLeaf(false) to reuse existing navigable leaf
   *
   * @param targetPath - Directory path to open
   * @returns The leaf and view
   */
  async getOrCreateOilView(targetPath: string): Promise<SplitResult> {
    const { workspace } = this.app;

    // Check for existing oil view
    const existingLeaves = workspace.getLeavesOfType(OIL_VIEW_TYPE);

    if (existingLeaves.length > 0) {
      // Reuse existing oil view
      const leaf = existingLeaves[0];
      workspace.revealLeaf(leaf);
      const view = leaf.view as OilView;
      await view.navigateTo(targetPath);
      return { leaf, view };
    }

    // Create new leaf, reusing existing navigable leaf if possible
    const newLeaf = workspace.getLeaf(false);

    await newLeaf.setViewState({
      type: OIL_VIEW_TYPE,
      active: true,
      state: { path: targetPath },
    });

    const view = newLeaf.view as OilView | null;

    if (view && typeof view.navigateTo === 'function') {
      await view.navigateTo(targetPath);
    }

    return { leaf: newLeaf, view };
  }
}
```

### Decision 2: Navigation History Tracking

**What:** Each oil view maintains its own navigation history stack with back/forward capability

**Why:**
- Matches oil.nvim behavior
- Users can navigate back to previously visited directories
- Independent per-view allows different exploration paths
- History is ephemeral (not persisted across sessions)

**Code Sample:**

```typescript
// src/types.ts - Add to existing types

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  /** Directory path */
  path: string;
  /** Timestamp when visited */
  timestamp: number;
  /** Scroll position (for restoration) */
  scrollTop?: number;
  /** Selected line index */
  selectedLine?: number;
}

/**
 * Navigation history state
 */
export interface NavigationHistory {
  /** Stack of visited paths */
  entries: NavigationHistoryEntry[];
  /** Current position in the stack (for back/forward) */
  currentIndex: number;
}

/**
 * Extended OilViewState with navigation history
 */
export interface OilViewState {
  /** Current directory being displayed */
  currentPath: string;
  /** Navigation history for back/forward */
  history: NavigationHistory;
  /** Pending mutations not yet applied */
  pendingMutations: FileMutation[];
}
```

```typescript
// src/views/navigation-history.ts

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
```

### Decision 3: Keyboard Event Handling for Splits

**What:** Extend oil view's keyboard handler to support split navigation shortcuts

**Why:**
- Keyboard-driven workflow is essential for oil.nvim-like experience
- Ctrl+Enter / Ctrl+Shift+Enter matches common split conventions
- Must integrate with existing keybinding system

**Code Sample:**

```typescript
// src/views/oil-view.ts - Updated keyboard handler

import { SplitManager } from './split-manager';
import { NavigationHistoryManager } from './navigation-history';

// Add to OilView class:

private splitManager: SplitManager;
private historyManager: NavigationHistoryManager;

// In constructor:
constructor(leaf: WorkspaceLeaf, plugin: SugarRushPlugin) {
  super(leaf);
  this.plugin = plugin;
  this.buffer = new OilBuffer(this);
  this.renderer = new OilRenderer(this, plugin.settings);
  this.splitManager = new SplitManager(this.app);
  this.historyManager = new NavigationHistoryManager();
  this.state = {
    currentPath: '',
    history: { entries: [], currentIndex: -1 },
    pendingMutations: [],
  };
}

/**
 * Handle keyboard events in the editor - EXTENDED with split navigation
 */
private async handleKeydown(event: KeyboardEvent): Promise<void> {
  const { keybindings } = this.plugin.settings;
  const currentLine = this.buffer.getCurrentLine();

  // === SPLIT NAVIGATION ===

  // Ctrl+Enter on folder -> open in vertical split (right)
  if (event.key === 'Enter' && event.ctrlKey && !event.shiftKey && !event.metaKey) {
    if (currentLine?.isDirectory) {
      event.preventDefault();
      const targetPath = this.buildPath(currentLine.displayName);
      await this.splitManager.openInSplit('vertical', targetPath);
      return;
    }
  }

  // Ctrl+Shift+Enter on folder -> open in horizontal split (below)
  if (event.key === 'Enter' && event.ctrlKey && event.shiftKey && !event.metaKey) {
    if (currentLine?.isDirectory) {
      event.preventDefault();
      const targetPath = this.buildPath(currentLine.displayName);
      await this.splitManager.openInSplit('horizontal', targetPath);
      return;
    }
  }

  // === PARENT NAVIGATION ===

  // `-` key -> navigate to parent (reuse current leaf)
  if (event.key === keybindings.navigateUp && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    await this.navigateUp();
    return;
  }

  // === HISTORY NAVIGATION ===

  // Alt+Left -> go back in history
  if (event.key === 'ArrowLeft' && event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    await this.navigateBack();
    return;
  }

  // Alt+Right -> go forward in history
  if (event.key === 'ArrowRight' && event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    await this.navigateForward();
    return;
  }

  // === EXISTING HANDLERS ===

  // Mod+Enter -> confirm changes (existing)
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
    // Only handle if not on a directory (split takes precedence)
    if (!currentLine?.isDirectory) {
      event.preventDefault();
      await this.confirmChanges();
      return;
    }
  }

  // Escape -> discard changes (existing)
  if (event.key === 'Escape') {
    event.preventDefault();
    this.discardChanges();
    return;
  }

  // Enter on folder -> navigate into it (existing, but now also adds to history)
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    if (currentLine?.isDirectory) {
      event.preventDefault();
      const targetPath = this.buildPath(currentLine.displayName);
      await this.navigateTo(targetPath);
      return;
    }
    // Enter on file -> open it (existing)
    if (currentLine?.file) {
      event.preventDefault();
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(currentLine.file);
      return;
    }
  }
}

/**
 * Build full path from relative name
 */
private buildPath(name: string): string {
  return this.state.currentPath
    ? `${this.state.currentPath}/${name}`
    : name;
}

/**
 * Navigate to a directory - UPDATED with history tracking
 */
async navigateTo(path: string): Promise<void> {
  const folder = this.app.vault.getAbstractFileByPath(path);

  if (path !== '' && !(folder instanceof TFolder)) {
    console.error(`Not a folder: ${path}`);
    return;
  }

  // Save scroll position of current view before navigating
  if (this.state.currentPath !== path) {
    this.historyManager.updateCurrentScroll(
      this.editorEl?.scrollTop ?? 0,
      this.buffer.getCurrentLineIndex()
    );
  }

  // Push new path to history (only if different from current)
  if (this.state.currentPath !== path) {
    this.historyManager.push(path);
  }

  this.state.currentPath = path;
  this.state.pendingMutations = [];

  // Load directory contents
  await this.buffer.loadDirectory(path);

  // Render the buffer
  this.renderer.render(this.editorEl, this.buffer.getEntries());

  // Update UI
  this.updateStatusBar();
  this.leaf.updateHeader();
}

/**
 * Navigate to parent directory (oil.nvim's `-` key behavior)
 */
async navigateUp(): Promise<void> {
  if (this.state.currentPath === '') {
    // Already at vault root
    return;
  }

  // Warn if pending mutations exist
  if (this.state.pendingMutations.length > 0) {
    // Could show notice or auto-discard
    console.log('Discarding pending changes on parent navigation');
    this.state.pendingMutations = [];
  }

  const parentPath = this.state.currentPath.split('/').slice(0, -1).join('/');
  await this.navigateTo(parentPath);
}

/**
 * Navigate back in history
 */
async navigateBack(): Promise<void> {
  const entry = this.historyManager.goBack();
  if (entry) {
    // Navigate without pushing to history (already in history)
    this.state.currentPath = entry.path;
    this.state.pendingMutations = [];

    await this.buffer.loadDirectory(entry.path);
    this.renderer.render(this.editorEl, this.buffer.getEntries());

    // Restore scroll position
    if (entry.scrollTop !== undefined && this.editorEl) {
      this.editorEl.scrollTop = entry.scrollTop;
    }

    this.updateStatusBar();
    this.leaf.updateHeader();
  }
}

/**
 * Navigate forward in history
 */
async navigateForward(): Promise<void> {
  const entry = this.historyManager.goForward();
  if (entry) {
    this.state.currentPath = entry.path;
    this.state.pendingMutations = [];

    await this.buffer.loadDirectory(entry.path);
    this.renderer.render(this.editorEl, this.buffer.getEntries());

    if (entry.scrollTop !== undefined && this.editorEl) {
      this.editorEl.scrollTop = entry.scrollTop;
    }

    this.updateStatusBar();
    this.leaf.updateHeader();
  }
}
```

### Decision 4: Updated Settings for Split Navigation

**What:** Add keybinding settings for split navigation shortcuts

**Why:**
- Users may want to customize shortcuts
- Consistency with existing keybinding settings pattern
- Allows conflict resolution with other plugins

**Code Sample:**

```typescript
// src/settings.ts - Updated keybindings interface

export interface SugarRushSettings {
  // ... existing settings ...

  keybindings: {
    openOilView: string;
    navigateUp: string;
    confirmChanges: string;
    discardChanges: string;
    togglePreview: string;
    // NEW: Split navigation keybindings
    openInVerticalSplit: string;
    openInHorizontalSplit: string;
    navigateBack: string;
    navigateForward: string;
  };

  // ... rest of settings ...
}

export const DEFAULT_SETTINGS: SugarRushSettings = {
  // ... existing defaults ...

  keybindings: {
    openOilView: 'Mod+Shift+E',
    navigateUp: '-',
    confirmChanges: 'Mod+Enter',
    discardChanges: 'Escape',
    togglePreview: 'p',
    // NEW: Split navigation defaults
    openInVerticalSplit: 'Ctrl+Enter',
    openInHorizontalSplit: 'Ctrl+Shift+Enter',
    navigateBack: 'Alt+ArrowLeft',
    navigateForward: 'Alt+ArrowRight',
  },

  // ... rest of defaults ...
};
```

```typescript
// src/settings-tab.ts - Add to Keybindings section

// After existing keybinding settings in display():

new Setting(containerEl)
  .setName('Open in vertical split')
  .setDesc('Key combination to open folder in a vertical split (right)')
  .addText(text => text
    .setPlaceholder('Ctrl+Enter')
    .setValue(this.plugin.settings.keybindings.openInVerticalSplit)
    .onChange(async (value) => {
      this.plugin.settings.keybindings.openInVerticalSplit = value || 'Ctrl+Enter';
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Open in horizontal split')
  .setDesc('Key combination to open folder in a horizontal split (below)')
  .addText(text => text
    .setPlaceholder('Ctrl+Shift+Enter')
    .setValue(this.plugin.settings.keybindings.openInHorizontalSplit)
    .onChange(async (value) => {
      this.plugin.settings.keybindings.openInHorizontalSplit = value || 'Ctrl+Shift+Enter';
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Navigate back')
  .setDesc('Key combination to go back in navigation history')
  .addText(text => text
    .setPlaceholder('Alt+ArrowLeft')
    .setValue(this.plugin.settings.keybindings.navigateBack)
    .onChange(async (value) => {
      this.plugin.settings.keybindings.navigateBack = value || 'Alt+ArrowLeft';
      await this.plugin.saveSettings();
    }));

new Setting(containerEl)
  .setName('Navigate forward')
  .setDesc('Key combination to go forward in navigation history')
  .addText(text => text
    .setPlaceholder('Alt+ArrowRight')
    .setValue(this.plugin.settings.keybindings.navigateForward)
    .onChange(async (value) => {
      this.plugin.settings.keybindings.navigateForward = value || 'Alt+ArrowRight';
      await this.plugin.saveSettings();
    }));
```

### Decision 5: Command Registration for Split Navigation

**What:** Add commands for split navigation accessible via command palette

**Why:**
- Not all users know keyboard shortcuts
- Command palette provides discoverability
- Allows hotkey assignment through Obsidian settings
- Accessibility for users who prefer commands

**Code Sample:**

```typescript
// src/constants.ts - Add new command IDs

export const COMMAND_IDS = {
  OPEN_OIL_VIEW: 'sugar-rush:open-oil-view',
  OPEN_OIL_VIEW_CURRENT: 'sugar-rush:open-oil-view-current-file',
  OPEN_OIL_VIEW_ROOT: 'sugar-rush:open-oil-view-vault-root',
  // NEW: Split navigation commands
  OPEN_IN_VERTICAL_SPLIT: 'sugar-rush:open-in-vertical-split',
  OPEN_IN_HORIZONTAL_SPLIT: 'sugar-rush:open-in-horizontal-split',
  NAVIGATE_UP: 'sugar-rush:navigate-up',
  NAVIGATE_BACK: 'sugar-rush:navigate-back',
  NAVIGATE_FORWARD: 'sugar-rush:navigate-forward',
} as const;
```

```typescript
// src/commands/index.ts - Add split navigation commands

import type SugarRushPlugin from '../main';
import { COMMAND_IDS } from '../constants';
import { OIL_VIEW_TYPE } from '../constants';
import type { OilView } from '../views/oil-view';

export function registerCommands(plugin: SugarRushPlugin): void {
  // ... existing commands ...

  // === SPLIT NAVIGATION COMMANDS ===

  // Navigate to parent directory
  plugin.addCommand({
    id: COMMAND_IDS.NAVIGATE_UP,
    name: 'Navigate to parent directory',
    checkCallback: (checking: boolean) => {
      const view = getActiveOilView(plugin);
      if (view) {
        if (!checking) {
          view.navigateUp();
        }
        return true;
      }
      return false;
    },
  });

  // Open folder in vertical split
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_IN_VERTICAL_SPLIT,
    name: 'Open folder in vertical split (right)',
    checkCallback: (checking: boolean) => {
      const view = getActiveOilView(plugin);
      if (view) {
        const currentLine = view.buffer.getCurrentLine();
        if (currentLine?.isDirectory) {
          if (!checking) {
            const targetPath = view.state.currentPath
              ? `${view.state.currentPath}/${currentLine.displayName}`
              : currentLine.displayName;
            view.splitManager.openInSplit('vertical', targetPath);
          }
          return true;
        }
      }
      return false;
    },
  });

  // Open folder in horizontal split
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_IN_HORIZONTAL_SPLIT,
    name: 'Open folder in horizontal split (below)',
    checkCallback: (checking: boolean) => {
      const view = getActiveOilView(plugin);
      if (view) {
        const currentLine = view.buffer.getCurrentLine();
        if (currentLine?.isDirectory) {
          if (!checking) {
            const targetPath = view.state.currentPath
              ? `${view.state.currentPath}/${currentLine.displayName}`
              : currentLine.displayName;
            view.splitManager.openInSplit('horizontal', targetPath);
          }
          return true;
        }
      }
      return false;
    },
  });

  // Navigate back in history
  plugin.addCommand({
    id: COMMAND_IDS.NAVIGATE_BACK,
    name: 'Navigate back in history',
    checkCallback: (checking: boolean) => {
      const view = getActiveOilView(plugin);
      if (view && view.historyManager.canGoBack()) {
        if (!checking) {
          view.navigateBack();
        }
        return true;
      }
      return false;
    },
  });

  // Navigate forward in history
  plugin.addCommand({
    id: COMMAND_IDS.NAVIGATE_FORWARD,
    name: 'Navigate forward in history',
    checkCallback: (checking: boolean) => {
      const view = getActiveOilView(plugin);
      if (view && view.historyManager.canGoForward()) {
        if (!checking) {
          view.navigateForward();
        }
        return true;
      }
      return false;
    },
  });
}

/**
 * Helper to get the active oil view, if any
 */
function getActiveOilView(plugin: SugarRushPlugin): OilView | null {
  const leaf = plugin.app.workspace.activeLeaf;
  if (leaf?.view?.getViewType() === OIL_VIEW_TYPE) {
    return leaf.view as OilView;
  }
  return null;
}
```

### Decision 6: View State Persistence (Optional Enhancement)

**What:** Optionally persist view state (path, history) for session restoration

**Why:**
- Obsidian restores workspace on restart
- Users expect to return to where they left off
- Can be enabled/disabled via setting

**Code Sample:**

```typescript
// src/views/oil-view.ts - View state serialization

/**
 * Get state for serialization (called by Obsidian on workspace save)
 */
getState(): Record<string, unknown> {
  return {
    path: this.state.currentPath,
    // Don't persist full history - just current path
  };
}

/**
 * Set state from serialization (called by Obsidian on workspace restore)
 */
async setState(state: Record<string, unknown>, result: ViewStateResult): Promise<void> {
  if (state && typeof state.path === 'string') {
    await this.navigateTo(state.path);
  }
}
```

## Risks / Trade-offs

### Risk 1: Split View State Independence
**Risk:** Users may expect splits to sync or share state
**Mitigation:**
- Document that each split is independent
- This matches oil.nvim behavior
- Future enhancement could add optional sync

### Risk 2: History Memory Usage
**Risk:** Large history stacks could consume memory
**Mitigation:**
- Enforce MAX_HISTORY_SIZE (50 entries)
- Only store minimal data (path, scroll position)
- Clear history on view close

### Risk 3: Keyboard Shortcut Conflicts
**Risk:** Ctrl+Enter may conflict with other plugins or Obsidian features
**Mitigation:**
- Make shortcuts configurable
- Use checkCallback to only enable when oil view is active
- Document default shortcuts clearly

### Risk 4: Edge Cases in Navigation
**Risk:** Navigation at vault root, empty directories, or with pending changes
**Mitigation:**
- Clear handling of edge cases in code
- Warn/auto-discard pending changes on navigation
- Silent no-op at vault root for `-` key

## Migration Plan

Not applicable - this is a new feature building on top of oil-view.

## Open Questions

1. **Tab navigation:** Should we also support `Ctrl+T` to open in new tab?
   - Decision: Defer to future enhancement (Tab support separate from splits)

2. **History size:** Is 50 entries reasonable, or should it be configurable?
   - Decision: 50 is reasonable default, can add setting later if requested

3. **Pending mutations on split:** Should opening a split warn about pending changes?
   - Decision: No - splits are new views, original view keeps its pending changes

4. **Mouse support:** Should right-click context menu offer split options?
   - Decision: Defer to future enhancement (keyboard-first approach)
