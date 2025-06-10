# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sugar Rush is an Obsidian plugin that brings Vim Vinegar/Neovim Oil-style navigation to Obsidian. The plugin transforms directory navigation into editable text buffers, allowing users to manipulate files and folders using vim-style operations within the Obsidian interface.

**Current Status**: Early development stage - comprehensive specifications exist but implementation is minimal (placeholder code only).

## MCPs

* context7 (Use to get background context for obsidian)

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

### Running the Project
```bash
# Run current entry point (placeholder)
bun run index.ts

# TypeScript compilation (when needed)
tsc
```

### Future Development Commands
Once implemented, the plugin will need:
- Obsidian plugin build process
- Hot reload during development
- Plugin manifest validation

## Architecture Overview

### Core Concept
The plugin implements two main navigation paradigms:

1. **Vim Vinegar Style**: Press `-` to navigate to parent directory in a special buffer
2. **Oil.nvim Style**: Edit directories as text buffers where file operations are performed by editing text

### Technical Architecture

**Plugin Structure**:
- **Main Plugin Class**: Extends Obsidian's `Plugin` class
- **Directory View**: Custom view type for directory editing
- **Vim Mode Integration**: Extensions to CodeMirror 5 vim mode
- **File Operations Parser**: Interprets buffer changes as file system operations
- **Navigation State Manager**: Tracks directory history and context

**Key Components**:
- **Buffer-based Directory Editing**: Transform folder contents into editable text
- **Vim Register Integration**: Enable cross-directory file operations
- **File Operation Engine**: Execute file system changes from buffer modifications
- **Obsidian Link Integration**: Maintain vault link integrity during operations

### Implementation Strategy

**Phase 1**: Basic vim-aware navigation
- Implement `-` key binding for parent directory navigation
- Create basic directory view with file listing
- Integrate with Obsidian's workspace system

**Phase 2**: Buffer integration
- Transform directory contents into editable buffers
- Implement file operation parsing from buffer changes
- Add basic file operations (rename, delete, create)

**Phase 3**: Advanced operations
- Cross-directory operations via vim registers
- Bulk file operations
- Integration with Obsidian's file explorer

**Phase 4**: Polish and optimization
- Performance optimization for large directories
- Error handling and user feedback
- Comprehensive testing

## Development Notes

### Technology Stack
- **Runtime**: Bun (modern JavaScript runtime)
- **Language**: TypeScript with strict configuration
- **Module System**: ESNext modules
- **Development Environment**: Nix Flakes for reproducibility

### Project Structure
```
src/                    # Plugin source code (to be implemented)
specs/                  # Comprehensive technical specifications
├── plan-v1.md         # 778-line detailed implementation plan
└── grading-prompt.md  # Evaluation criteria
```

### Key Specifications
The `specs/plan-v1.md` contains extremely detailed technical specifications including:
- Exact vim behavior patterns to replicate
- CodeMirror integration strategies
- Obsidian API usage patterns
- Performance optimization approaches
- Error handling strategies

### Missing Components (To Be Implemented)
- `manifest.json` for Obsidian plugin registration
- Obsidian API dependencies in package.json
- Plugin build system and bundling
- Main plugin class implementation
- Directory view and buffer management
- Vim mode extensions

### Obsidian Plugin Requirements
When implementing, ensure:
- Plugin manifest follows Obsidian's specification
- Proper integration with Obsidian's plugin API
- Compatibility with Obsidian's vim mode
- Respect for Obsidian's file system abstractions
- Testing with actual Obsidian installation

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
