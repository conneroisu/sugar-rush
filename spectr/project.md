# sugar-rush Context

## Purpose
An Obsidian community plugin that provides an oil.nvim-like file explorer experience. Edit your vault's directory structure as if it were a buffer - rename files by editing lines, delete by removing lines, and navigate directories with vim-like keybindings.

### Core Features
- **Buffer-based editing**: View and edit directory contents as text - rename files by changing line text, delete by removing lines, create by adding lines
- **Split navigation**: Open parent/child directories in splits, navigate up with `-` key
- **Preview support**: Preview file contents before opening them fully

## Tech Stack
- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Bun
- **Bundler**: Bun bundler (outputs `main.js` for Obsidian)
- **Target Platform**: Desktop Obsidian only (`isDesktopOnly: true`)
- **Obsidian API**: `obsidian` package for plugin development
- **Linting**: ESLint with `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`

## Project Conventions

### Code Style
- **Naming**: Standard TypeScript conventions
  - `camelCase` for functions, variables, and methods
  - `PascalCase` for classes, interfaces, types, and enums
  - `SCREAMING_SNAKE_CASE` for constants
- **File organization**: Split functionality across modules; keep `main.ts` minimal (lifecycle only)
- **Imports**: Use ES module syntax with explicit file extensions where required
- **Strict mode**: All TypeScript strict checks enabled

### Architecture Patterns
- **Plugin lifecycle**: Minimal `main.ts` focused on `onload`/`onunload` and command registration
- **Modular structure**: Separate directories for commands, views, utilities
- **View-based UI**: Leverage Obsidian's `ItemView` for the oil-style buffer interface
- **Event-driven**: Use Obsidian's event system with proper cleanup via `this.register*` helpers

### Testing Strategy
- **Unit tests**: Test core logic (file operations, parsing, state management) with Bun's test runner
- **Manual UI testing**: Test the UI and Obsidian integration manually in a test vault
- **Test before merge**: All PRs should include passing unit tests for new logic

### Git Workflow
- **Branching**: Feature branches off `main`
- **Pull requests**: All changes via PR with review
- **Commit style**: Conventional commits preferred (`feat:`, `fix:`, `refactor:`, etc.)
- **No build artifacts**: Never commit `main.js`, `node_modules/`, or other generated files

## Domain Context
### oil.nvim Concepts
- **Oil buffer**: A special buffer that displays directory contents as editable text
- **Mutations**: Changes to the buffer (edits, deletions, additions) are staged as file operations
- **Confirm**: Applying staged mutations performs actual filesystem operations
- **Parent navigation**: `-` key opens the parent directory, maintaining navigation history

### Obsidian Concepts
- **Vault**: The root directory of user's notes
- **TFile/TFolder**: Obsidian's file and folder abstractions
- **ItemView**: Custom view type for creating plugin UI panels
- **Commands**: User-invokable actions registered with the plugin

## Important Constraints
- **Desktop only**: Can use Node/Electron APIs; mobile compatibility not required
- **Local operations only**: No network calls; all operations are local filesystem
- **Non-destructive defaults**: File deletions should move to trash, not permanently delete
- **Obsidian API compliance**: Follow Obsidian's developer policies and plugin guidelines
- **Bundle everything**: All dependencies must be bundled into `main.js`

## External Dependencies
- **Obsidian API**: Primary dependency for vault access, UI, and plugin lifecycle
- **No external services**: Plugin operates entirely offline within the vault
