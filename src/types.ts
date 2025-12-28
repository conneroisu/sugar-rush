import type { TFile, TFolder } from 'obsidian';

/**
 * Represents an entry in the oil view buffer
 */
export interface OilEntry {
  /** Original path of the file/folder */
  originalPath: string;
  /** Current display name (may differ if renamed) */
  displayName: string;
  /** Whether this is a directory */
  isDirectory: boolean;
  /** Reference to the actual file (null for new entries) */
  file: TFile | null;
  /** Reference to the actual folder (null for new entries) */
  folder: TFolder | null;
  /** Line number in the buffer (0-indexed) */
  lineNumber: number;
}

/**
 * Types of mutations that can be applied to files
 */
export type MutationType = 'rename' | 'delete' | 'create' | 'move';

/**
 * Represents a pending file mutation
 */
export interface FileMutation {
  type: MutationType;
  originalPath: string;
  newPath?: string; // For rename/move/create
  entry: OilEntry;
}

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
 * State of the oil view
 */
export interface OilViewState {
  /** Current directory being displayed */
  currentPath: string;
  /** Navigation history for back/forward */
  history: NavigationHistory;
  /** Pending mutations not yet applied */
  pendingMutations: FileMutation[];
}

/**
 * Payload for the sugar-rush:confirm-mutations event
 */
export interface ConfirmMutationsPayload {
  /** List of mutations to apply */
  mutations: FileMutation[];
  /** Source directory path */
  sourcePath: string;
  /** Callback when mutations complete */
  onComplete: (success: boolean) => Promise<void>;
}

/**
 * Result of executing mutations
 */
export interface MutationExecutionResult {
  /** Whether all mutations succeeded */
  success: boolean;
  /** Successfully applied mutations */
  applied: FileMutation[];
  /** Failed mutations with error messages */
  failed: Array<{
    mutation: FileMutation;
    error: string;
  }>;
}

/**
 * Error from mutation validation
 */
export interface ValidationError {
  mutation: FileMutation;
  message: string;
}

/**
 * Warning from mutation validation
 */
export interface ValidationWarning {
  mutation: FileMutation;
  message: string;
}

/**
 * Result of validating mutations before execution
 */
export interface ValidationResult {
  /** Whether all mutations are valid */
  valid: boolean;
  /** Validation errors that prevent execution */
  errors: ValidationError[];
  /** Warnings that don't prevent execution */
  warnings: ValidationWarning[];
}

/**
 * Preview pane configuration
 */
export interface PreviewConfig {
  /** Whether preview is enabled */
  enabled: boolean;
  /** Position of preview pane */
  position: 'right' | 'bottom';
  /** Width (for right) or height (for bottom) as percentage */
  width: number;
}

/**
 * Content types for preview rendering
 */
export type PreviewContentType = 'markdown' | 'image' | 'text' | 'folder' | 'unsupported';

/**
 * Preview state
 */
export interface PreviewState {
  /** Currently previewed entry */
  currentEntry: OilEntry | null;
  /** Whether preview is visible */
  isVisible: boolean;
  /** Content type being displayed */
  contentType: PreviewContentType;
}
