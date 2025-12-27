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
