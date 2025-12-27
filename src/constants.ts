export const PLUGIN_ID = 'sugar-rush';
export const PLUGIN_NAME = 'Sugar Rush';

// View type for the oil-like view (used by future oil-view feature)
export const OIL_VIEW_TYPE = 'sugar-rush-oil-view';

// CSS classes
export const CSS_CLASSES = {
  OIL_VIEW: 'sugar-rush-oil-view',
  OIL_LINE: 'sugar-rush-oil-line',
  OIL_LINE_MODIFIED: 'sugar-rush-oil-line-modified',
  OIL_LINE_DELETED: 'sugar-rush-oil-line-deleted',
  OIL_LINE_ADDED: 'sugar-rush-oil-line-added',
  DIRECTORY: 'sugar-rush-directory',
  FILE: 'sugar-rush-file',
  // Preview pane classes
  PREVIEW_PANE: 'sugar-rush-preview-pane',
  PREVIEW_RIGHT: 'preview-right',
  PREVIEW_BOTTOM: 'preview-bottom',
  PREVIEW_CONTENT: 'preview-content',
  PREVIEW_HEADER: 'preview-header',
  PREVIEW_IMAGE: 'preview-image',
  PREVIEW_MARKDOWN: 'preview-markdown',
  PREVIEW_TEXT: 'preview-text',
  PREVIEW_PLACEHOLDER: 'preview-placeholder',
} as const;

// Image extensions supported for preview
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'] as const;

// Maximum content length before truncation
export const PREVIEW_MAX_LENGTH = 5000;
export const PREVIEW_MAX_LINES = 50;

// Command IDs - NEVER change these after release
export const COMMAND_IDS = {
  OPEN_OIL_VIEW: 'open-oil-view',
  OPEN_OIL_VIEW_CURRENT: 'open-oil-view-current-file',
  OPEN_OIL_VIEW_ROOT: 'open-oil-view-vault-root',
  NAVIGATE_UP: 'navigate-up',
  OPEN_IN_VERTICAL_SPLIT: 'open-in-vertical-split',
  OPEN_IN_HORIZONTAL_SPLIT: 'open-in-horizontal-split',
  NAVIGATE_BACK: 'navigate-back',
  NAVIGATE_FORWARD: 'navigate-forward',
} as const;
