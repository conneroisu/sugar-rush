# Change: Add Preview Support for Oil View

## Why
Users browsing directories often need to quickly see file contents before deciding whether to open them fully. Currently, the oil view only shows filenames - users must open files to see what's inside. A preview pane similar to file managers and IDEs would significantly improve the browsing experience, allowing users to scan file contents, view images, and understand folder structures without context-switching away from the directory view.

## What Changes
- Add preview pane component that displays alongside the oil view
- Preview content based on file type:
  - Markdown files: Render as formatted HTML using Obsidian's MarkdownRenderer
  - Images (png, jpg, gif, etc.): Display the image inline
  - Other files: Show first N lines as plain text
  - Folders: Show folder summary (file count, total size, subdirectory count)
- Toggle preview visibility with 'p' key (configurable in settings)
- Preview pane positioning: right side or bottom (configurable)
- Preview pane width/height: configurable as percentage
- Update preview automatically when cursor moves to different file line
- Use Obsidian APIs for efficient file reading (cachedRead)

## Impact
- Affected specs: `preview-support` (new capability)
- Affected code:
  - `src/views/preview-pane.ts` - New preview pane component
  - `src/views/preview-renderer.ts` - Content type detection and rendering
  - `src/views/oil-view.ts` - Integration with cursor position tracking
  - `styles.css` - Preview pane styling
  - `src/types.ts` - Preview-related interfaces
- Dependencies:
  - `add-core-plugin-infrastructure` (settings, types, constants)
  - `add-oil-view` (cursor position, view container)
- Dependents: None (terminal feature)
