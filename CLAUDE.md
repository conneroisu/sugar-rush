# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sugar Rush is an Obsidian plugin that brings Vim Vinegar/Neovim Oil-style navigation to Obsidian. The plugin transforms directory navigation into editable text buffers, allowing users to manipulate files and folders using vim-style operations within the Obsidian interface.

**Current Status**: Active development stage - core plugin structure implemented with directory navigation, buffer-based editing, and vim integration. Main plugin class, directory view, and file operations system are functional.

## MCPs

- context7 (Use to get background context for obsidian)

## Key Commands

### Development Environment

This project uses Nix Flakes for reproducible development environments:

```bash
# Enter development environment
nix develop

# Quick flake.nix editing
dx

# Format Nix files
alejandra flake.nix

# Nix linting
statix
deadnix
```

### Building and Development

```bash
# Development build with watching (recommended for active development)
npm run dev

# Production build for testing/deployment
npm run build

# TypeScript type checking without emission
tsc -noEmit -skipLibCheck

# Version bump and prepare for release
npm run version
```

### Plugin Testing

```bash
# Copy built files to Obsidian vault plugins folder for testing
# Example: cp main.js manifest.json ~/.obsidian/plugins/sugar-rush/

# After making changes, run build and reload plugin in Obsidian
npm run dev  # Then reload in Obsidian settings
```

## Architecture Overview

### Core Concept

The plugin implements two main navigation paradigms:

1. **Vim Vinegar Style**: Press `-` to navigate to parent directory in a special buffer
2. **Oil.nvim Style**: Edit directories as text buffers where file operations are performed by editing text

### Technical Architecture

**Implemented Components**:

- **SugarRushPlugin**: Main plugin class extending Obsidian's `Plugin` class (main.ts:582)
- **DirectoryEditView**: Custom view extending `TextFileView` for buffer-based directory editing (main.ts:198)
- **NavigationEngine**: Handles minus-key navigation and view state management (main.ts:85)
- **BufferParser**: Parses directory contents and file operations from buffer text (src/buffer-parser.ts)
- **FileOperationsManager**: Executes file system operations with undo support (src/file-operations-manager.ts)
- **Logger**: Comprehensive logging system with file and console output (src/logger.ts)

**Key Systems**:

- **Buffer-based Editing**: Directory contents displayed as editable text with emoji icons (📁 folders, 📄 files)
- **Vim Integration**: Custom CodeMirror vim commands for directory operations (Enter to open, '-' to navigate up)
- **Debounced Auto-save**: File operations executed automatically after buffer changes with configurable delay
- **Settings Management**: Comprehensive settings with logging, performance, and vim integration options

### Current Implementation Status

**✅ Completed**:

- Minus key navigation for parent directory access
- Directory view with buffer-based editing
- File operations (rename, delete, create, move) via text editing
- Vim mode integration with custom keybindings
- Auto-save with debounced file operations
- Comprehensive logging and settings system
- Undo/redo support for file operations

**🔄 In Progress/Needs Work**:

- Cross-directory operations via vim registers
- Performance optimization for large directories
- Error handling and validation improvements
- Integration with Obsidian's file explorer
- Floating window mode for quick navigation

**📋 Testing Required**:

- Compatibility with different Obsidian versions
- Vim mode behavior consistency
- Large directory performance
- Edge cases in file operations

## Development Notes

### Technology Stack

- **Language**: TypeScript with strict configuration (tsconfig.json)
- **Build System**: esbuild for fast bundling (esbuild.config.mjs)
- **Module System**: ESNext modules with CommonJS output for Obsidian
- **Development Environment**: Nix Flakes for reproducible development
- **Package Manager**: npm with Node.js ecosystem

### Project Structure

```
main.ts                 # Main plugin implementation (939 lines) - core logic
manifest.json          # Obsidian plugin manifest
esbuild.config.mjs     # Build configuration with hot reload support
src/                   # Core modules
├── buffer-parser.ts   # Directory buffer parsing and file operation detection
├── file-operations-manager.ts  # File system operations with undo support
└── logger.ts          # Comprehensive logging system
specs/                 # Technical specifications
├── plan-v1.md         # Detailed implementation roadmap
└── grading-prompt.md  # Evaluation criteria
```

### Key Specifications

The `specs/plan-v1.md` contains extremely detailed technical specifications including:

- Exact vim behavior patterns to replicate
- CodeMirror integration strategies
- Obsidian API usage patterns
- Performance optimization approaches
- Error handling strategies

### Development Considerations

**Build System**:

- esbuild provides fast bundling with watch mode for development
- External dependencies properly configured for Obsidian environment
- Source maps enabled in development, disabled in production

**Plugin Registration**:

- `manifest.json` properly configured for Obsidian plugin API
- Main entry point builds to `main.js` in CommonJS format
- All required Obsidian APIs properly imported and typed

**File Operations**:

- Buffer changes are debounced to prevent excessive file system operations
- Undo history maintained for file operations (separate from text undo)
- Validation prevents destructive operations from malformed buffer content

### Key Vim Integration Features

**Custom Keybindings** (main.ts:415-490):

- `Enter`: Open file or navigate into folder
- `-`: Navigate to parent directory
- `a`: Append new file (enter insert mode)
- `i`: Insert new file at cursor
- `:w`: Manual save of pending operations
- `u`: Undo last file operations

**Ex Commands** (when enabled in settings):

- `:mkdir <name>`: Create new directory
- `:touch <name>`: Create new file
- `:rename <name>`: Rename current line's file/folder

## Important Considerations

### Vim Behavior Accuracy

The plugin must accurately replicate vim/neovim behaviors:

- Exact key binding patterns from Vinegar and Oil
- Proper vim register integration
- Consistent buffer manipulation patterns

### Obsidian Integration

- Maintain compatibility with existing Obsidian workflows
- Preserve vault link integrity during file operations
- Integration with Obsidian's file explorer and search
- Proper handling of Obsidian's metadata and settings

### Performance

- Efficient handling of large directories
- Minimal impact on Obsidian's performance
- Proper cleanup of resources and event listeners
