import type SugarRushPlugin from '../main';
import { COMMAND_IDS, OIL_VIEW_TYPE } from '../constants';
import type { OilView } from '../views/oil-view';

/**
 * Get the active oil view if the current view is an oil view
 */
function getActiveOilView(plugin: SugarRushPlugin): OilView | null {
  const leaf = plugin.app.workspace.activeLeaf;
  if (leaf?.view?.getViewType() === OIL_VIEW_TYPE) {
    return leaf.view as OilView;
  }
  return null;
}

/**
 * Open an oil view for the given path.
 * If an oil view is already open, navigate it to the path.
 * Otherwise, create a new oil view.
 */
async function openOilView(plugin: SugarRushPlugin, path: string): Promise<void> {
  const { workspace } = plugin.app;

  // Check if an oil view is already active
  const existingLeaf = workspace.getLeavesOfType(OIL_VIEW_TYPE)[0];

  if (existingLeaf) {
    // Navigate existing view to the path
    const view = existingLeaf.view as OilView;
    await view.navigateTo(path);
    workspace.setActiveLeaf(existingLeaf, { focus: true });
    return;
  }

  // Create new leaf and open oil view
  const leaf = workspace.getLeaf('tab');
  await leaf.setViewState({
    type: OIL_VIEW_TYPE,
    active: true,
  });

  // Navigate to the path after view is created
  const view = leaf.view as OilView;
  if (view && view.navigateTo) {
    await view.navigateTo(path);
  }

  workspace.setActiveLeaf(leaf, { focus: true });
}

export function registerCommands(plugin: SugarRushPlugin): void {
  // Open Oil view for current file's directory
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW,
    name: 'Open file explorer (current directory)',
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      const path = activeFile?.parent?.path ?? '';
      await openOilView(plugin, path);
    },
  });

  // Open Oil view at vault root
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_ROOT,
    name: 'Open file explorer (vault root)',
    callback: async () => {
      await openOilView(plugin, '');
    },
  });

  // Open Oil view for current file's parent
  plugin.addCommand({
    id: COMMAND_IDS.OPEN_OIL_VIEW_CURRENT,
    name: 'Open file explorer (parent of current file)',
    callback: async () => {
      const activeFile = plugin.app.workspace.getActiveFile();
      const path = activeFile?.parent?.path ?? '';
      await openOilView(plugin, path);
    },
  });

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
        const currentEntry = view.getCurrentEntry();
        if (currentEntry?.isDirectory) {
          if (!checking) {
            const targetPath = view.state.currentPath
              ? `${view.state.currentPath}/${currentEntry.displayName}`
              : currentEntry.displayName;
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
        const currentEntry = view.getCurrentEntry();
        if (currentEntry?.isDirectory) {
          if (!checking) {
            const targetPath = view.state.currentPath
              ? `${view.state.currentPath}/${currentEntry.displayName}`
              : currentEntry.displayName;
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
