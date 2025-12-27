# Tasks: Add Preview Support for Oil View

## Dependencies
- **Requires:** `add-core-plugin-infrastructure` (settings, types, constants)
- **Requires:** `add-oil-view` (view container, cursor position, keyboard handling)

## 1. Type Definitions and Constants
- [ ] 1.1 Add `PreviewConfig` interface to `src/types.ts`
- [ ] 1.2 Add `PreviewContentType` type to `src/types.ts`
- [ ] 1.3 Add `PreviewState` interface to `src/types.ts`
- [ ] 1.4 Add preview CSS classes to `src/constants.ts` (PREVIEW_PANE, PREVIEW_RIGHT, etc.)
- [ ] 1.5 Add `IMAGE_EXTENSIONS` constant array to `src/constants.ts`
- [ ] 1.6 Add `PREVIEW_MAX_LENGTH` and `PREVIEW_MAX_LINES` constants

## 2. Preview Pane Component
- [ ] 2.1 Create `src/views/preview-pane.ts` file
- [ ] 2.2 Implement `PreviewPane` class extending Obsidian's `Component`
- [ ] 2.3 Implement constructor with container and content element creation
- [ ] 2.4 Implement `updateLayout()` for positioning (right/bottom)
- [ ] 2.5 Implement `showPreview(entry)` method to dispatch to correct renderer
- [ ] 2.6 Implement `clearPreview()` and `renderPlaceholder()` methods
- [ ] 2.7 Implement `toggle()` and `setVisible()` visibility methods
- [ ] 2.8 Implement `updateOptions()` for runtime configuration changes
- [ ] 2.9 Implement `onunload()` cleanup method
- [ ] 2.10 Add `formatSize()` utility method

## 3. Folder Preview Rendering
- [ ] 3.1 Implement `renderFolderPreview(folder)` method
- [ ] 3.2 Display folder name with icon in header
- [ ] 3.3 Calculate and display file count
- [ ] 3.4 Calculate and display folder count
- [ ] 3.5 Calculate and display total size
- [ ] 3.6 Display first 10 items in contents list
- [ ] 3.7 Show "and N more" for additional items

## 4. Image Preview Rendering
- [ ] 4.1 Implement `isImageFile(extension)` helper method
- [ ] 4.2 Implement `renderImagePreview(file)` method
- [ ] 4.3 Use `vault.getResourcePath(file)` to get image URL
- [ ] 4.4 Display image with proper sizing constraints
- [ ] 4.5 Show image dimensions after load (naturalWidth/naturalHeight)
- [ ] 4.6 Show file size metadata
- [ ] 4.7 Handle image load errors gracefully

## 5. Markdown Preview Rendering
- [ ] 5.1 Implement `renderMarkdownPreview(file)` method
- [ ] 5.2 Use `vault.cachedRead(file)` to read content
- [ ] 5.3 Truncate content if exceeds PREVIEW_MAX_LENGTH
- [ ] 5.4 Use `MarkdownRenderer.render()` for rendering
- [ ] 5.5 Pass correct component reference for lifecycle management
- [ ] 5.6 Display truncation indicator if content was truncated

## 6. Plain Text Preview Rendering
- [ ] 6.1 Implement `renderTextPreview(file)` method
- [ ] 6.2 Display file extension, size, and modified date in info section
- [ ] 6.3 Use `vault.cachedRead(file)` to read content
- [ ] 6.4 Limit display to first PREVIEW_MAX_LINES lines
- [ ] 6.5 Display in preformatted code block with monospace font
- [ ] 6.6 Show line count indicator if truncated
- [ ] 6.7 Handle read errors gracefully

## 7. Oil View Integration
- [ ] 7.1 Add `previewPane` property to OilView class
- [ ] 7.2 Add `currentLineIndex` property for cursor tracking
- [ ] 7.3 Create flex wrapper container in `onOpen()` for editor + preview layout
- [ ] 7.4 Initialize PreviewPane if `settings.preview.enabled` is true
- [ ] 7.5 Register PreviewPane as child component with `addChild()`
- [ ] 7.6 Register click event handler for cursor position detection
- [ ] 7.7 Register keyup event handler for cursor position detection
- [ ] 7.8 Implement `handleCursorChange(event)` to detect line changes
- [ ] 7.9 Implement `getCurrentLineEntry()` helper method
- [ ] 7.10 Update preview after `navigateTo()` completes
- [ ] 7.11 Reset cursor index on navigation

## 8. Keyboard Handling
- [ ] 8.1 Add toggle preview key handling in `handleKeydown()`
- [ ] 8.2 Read `togglePreview` key from settings
- [ ] 8.3 Implement `togglePreview()` method in OilView
- [ ] 8.4 Update preview with current selection when toggling visible
- [ ] 8.5 Ensure toggle key doesn't interfere with text editing

## 9. CSS Styling
- [ ] 9.1 Add `.oil-wrapper` flex container styles
- [ ] 9.2 Add `.sugar-rush-preview-pane` base styles
- [ ] 9.3 Add `.preview-right` positioning styles
- [ ] 9.4 Add `.preview-bottom` positioning styles
- [ ] 9.5 Add `.preview-content` scrollable area styles
- [ ] 9.6 Add `.preview-header` styles with border and spacing
- [ ] 9.7 Add `.preview-stats` flex column styles
- [ ] 9.8 Add `.preview-recent` list styles
- [ ] 9.9 Add `.preview-image-container` and `.preview-image` styles
- [ ] 9.10 Add `.preview-info` metadata box styles
- [ ] 9.11 Add `.preview-markdown` content styles
- [ ] 9.12 Add `.preview-text` preformatted block styles
- [ ] 9.13 Add `.preview-placeholder` centered italic styles
- [ ] 9.14 Add `.preview-error` error message styles
- [ ] 9.15 Add `.preview-more` truncation indicator styles

## 10. Settings Verification
- [ ] 10.1 Verify `preview.enabled` setting toggles preview pane
- [ ] 10.2 Verify `preview.position` setting changes layout
- [ ] 10.3 Verify `preview.width` setting affects pane size
- [ ] 10.4 Verify `keybindings.togglePreview` setting is respected
- [ ] 10.5 Ensure settings changes apply without plugin reload (where possible)

## 11. Validation and Testing
- [ ] 11.1 Test preview appears when cursor moves to file line
- [ ] 11.2 Test markdown files render as formatted HTML
- [ ] 11.3 Test image files display correctly with dimensions
- [ ] 11.4 Test plain text files show first N lines
- [ ] 11.5 Test folders show file count, folder count, and size
- [ ] 11.6 Test 'p' key toggles preview visibility
- [ ] 11.7 Test preview position changes (right vs bottom)
- [ ] 11.8 Test preview width setting affects layout
- [ ] 11.9 Test large file truncation works correctly
- [ ] 11.10 Test preview clears when navigating to new directory
- [ ] 11.11 Test preview survives view split operations
- [ ] 11.12 Run `spectr validate add-preview-support --strict`

## Parallelizable Work
- Tasks 2.x-6.x (preview pane and renderers) can run parallel to 9.x (styling)
- Tasks 1.x (types/constants) must complete before 2.x starts
- Tasks 7.x-8.x (integration) require 2.x-6.x to be complete
- Tasks 10.x-11.x (validation) require all implementation complete
