export interface SugarRushSettings {
  // General settings
  showHiddenFiles: boolean;
  confirmBeforeDelete: boolean;
  useTrashInsteadOfDelete: boolean;

  // Keybindings (customizable)
  keybindings: {
    openOilView: string;
    navigateUp: string;
    confirmChanges: string;
    discardChanges: string;
    togglePreview: string;
    // Split navigation keybindings
    openInVerticalSplit: string;
    openInHorizontalSplit: string;
    navigateBack: string;
    navigateForward: string;
  };

  // Display settings
  display: {
    showFileIcons: boolean;
    showFileSizes: boolean;
    showModifiedDate: boolean;
    sortOrder: 'name' | 'modified' | 'size';
    sortDirection: 'asc' | 'desc';
    directoryFirst: boolean;
  };

  // Preview settings (for future preview feature)
  preview: {
    enabled: boolean;
    position: 'right' | 'bottom';
    width: number; // percentage for right, pixels for bottom
  };
}

export const DEFAULT_SETTINGS: SugarRushSettings = {
  showHiddenFiles: false,
  confirmBeforeDelete: true,
  useTrashInsteadOfDelete: true,

  keybindings: {
    openOilView: 'Mod+Shift+E',
    navigateUp: '-',
    confirmChanges: 'Mod+S',
    discardChanges: 'Escape',
    togglePreview: 'p',
    // Split navigation defaults
    openInVerticalSplit: 'Ctrl+Enter',
    openInHorizontalSplit: 'Ctrl+Shift+Enter',
    navigateBack: 'Alt+ArrowLeft',
    navigateForward: 'Alt+ArrowRight',
  },

  display: {
    showFileIcons: true,
    showFileSizes: false,
    showModifiedDate: false,
    sortOrder: 'name',
    sortDirection: 'asc',
    directoryFirst: true,
  },

  preview: {
    enabled: true,
    position: 'right',
    width: 40,
  },
};
