# Preview Support Specification

## Requirements

### Requirement: Preview Pane Display
The plugin SHALL display a preview pane within the oil view that shows content of the currently selected file or folder.

#### Scenario: Preview pane is visible when enabled
- GIVEN the oil view is open
- AND the preview.enabled setting is true
- WHEN the user selects a file or folder line
- THEN a preview pane SHALL be displayed
- AND the preview pane SHALL show content appropriate to the selected item type

#### Scenario: Preview pane respects enabled setting
- GIVEN the preview.enabled setting is false
- WHEN the oil view is opened
- THEN no preview pane SHALL be displayed
- AND the file list SHALL take the full available width

#### Scenario: Preview pane positioning
- GIVEN the preview.enabled setting is true
- AND the preview.position setting is 'right'
- THEN the preview pane SHALL appear to the right of the file list
- WHEN the preview.position setting is 'bottom'
- THEN the preview pane SHALL appear below the file list

#### Scenario: Preview pane sizing
- GIVEN the preview pane is visible
- AND the preview.width setting is set to a percentage value (10-60)
- THEN the preview pane SHALL occupy that percentage of the available space
- AND the file list SHALL occupy the remaining space

### Requirement: Preview Toggle
The plugin SHALL allow users to toggle preview visibility using a configurable keyboard shortcut.

#### Scenario: Toggle preview with default key
- GIVEN the oil view is focused
- AND the preview pane is visible
- WHEN the user presses the 'p' key (default togglePreview setting)
- THEN the preview pane SHALL be hidden
- AND the file list SHALL expand to fill the available space

#### Scenario: Toggle preview to show
- GIVEN the oil view is focused
- AND the preview pane is hidden
- WHEN the user presses the togglePreview key
- THEN the preview pane SHALL be shown
- AND the preview SHALL display the currently selected item

#### Scenario: Custom toggle key
- GIVEN the keybindings.togglePreview setting is changed to a custom key
- WHEN the user presses that custom key in the oil view
- THEN the preview visibility SHALL toggle

#### Scenario: Toggle key does not interfere with editing
- GIVEN the user is editing a filename in the oil view
- WHEN the user types the togglePreview character as part of the filename
- THEN the preview SHALL NOT toggle
- AND the character SHALL be inserted into the filename

### Requirement: Markdown File Preview
The plugin SHALL render markdown files as formatted HTML in the preview pane.

#### Scenario: Markdown renders as HTML
- GIVEN the cursor is on a markdown file (.md) line
- WHEN the preview updates
- THEN the file content SHALL be rendered as formatted HTML
- AND headings, lists, links, and other markdown elements SHALL be properly styled

#### Scenario: Markdown uses Obsidian renderer
- GIVEN a markdown file is being previewed
- THEN the preview SHALL use Obsidian's built-in MarkdownRenderer API
- AND the preview SHALL respect the current Obsidian theme

#### Scenario: Large markdown truncation
- GIVEN a markdown file exceeds 5000 characters
- WHEN the preview is rendered
- THEN only the first 5000 characters SHALL be rendered
- AND a truncation indicator SHALL be displayed

#### Scenario: Markdown preview is read-only
- GIVEN a markdown file is displayed in preview
- THEN the user SHALL NOT be able to edit the preview content
- AND clicking the preview SHALL NOT modify the file

### Requirement: Image File Preview
The plugin SHALL display image files inline in the preview pane.

#### Scenario: Image files display inline
- GIVEN the cursor is on an image file line (png, jpg, jpeg, gif, svg, webp, bmp)
- WHEN the preview updates
- THEN the image SHALL be displayed in the preview pane
- AND the image SHALL be scaled to fit within the preview area

#### Scenario: Image metadata displayed
- GIVEN an image is being previewed
- WHEN the image loads successfully
- THEN the image dimensions (width x height) SHALL be displayed
- AND the file size SHALL be displayed

#### Scenario: Image load failure handling
- GIVEN an image file that cannot be loaded (corrupted or unsupported)
- WHEN the preview attempts to display it
- THEN an error message SHALL be displayed
- AND the error message SHALL indicate the image could not be loaded

#### Scenario: Image uses vault resource path
- GIVEN an image file in the vault
- WHEN generating the preview
- THEN the plugin SHALL use `app.vault.getResourcePath(file)` to obtain the correct URL
- AND the image SHALL load properly regardless of vault location

### Requirement: Plain Text File Preview
The plugin SHALL display non-markdown, non-image files as plain text in the preview pane.

#### Scenario: Plain text preview displays content
- GIVEN the cursor is on a text file (not markdown or image)
- WHEN the preview updates
- THEN the file content SHALL be displayed as plain text
- AND the text SHALL use a monospace font

#### Scenario: Plain text file metadata
- GIVEN a text file is being previewed
- THEN the file extension/type SHALL be displayed
- AND the file size SHALL be displayed
- AND the last modified date SHALL be displayed

#### Scenario: Plain text line limit
- GIVEN a text file exceeds 50 lines
- WHEN the preview is rendered
- THEN only the first 50 lines SHALL be displayed
- AND an indicator showing remaining line count SHALL be displayed

#### Scenario: Plain text read error handling
- GIVEN a file that cannot be read
- WHEN the preview attempts to display it
- THEN an error message SHALL be displayed
- AND the plugin SHALL NOT crash or become unresponsive

### Requirement: Folder Preview
The plugin SHALL display folder information in the preview pane when a folder is selected.

#### Scenario: Folder summary information
- GIVEN the cursor is on a folder line
- WHEN the preview updates
- THEN the folder name with folder icon SHALL be displayed
- AND the total file count (direct children only) SHALL be displayed
- AND the total subfolder count (direct children only) SHALL be displayed
- AND the total size of all files SHALL be displayed

#### Scenario: Folder contents list
- GIVEN a folder is being previewed
- THEN a list of contents SHALL be displayed
- AND up to 10 items SHALL be shown
- AND items SHALL display appropriate icons (file or folder)

#### Scenario: Large folder contents
- GIVEN a folder contains more than 10 items
- WHEN the preview is rendered
- THEN only the first 10 items SHALL be listed
- AND a "... and N more" indicator SHALL be shown

### Requirement: Preview Updates on Cursor Movement
The plugin SHALL update the preview content when the cursor moves to a different line.

#### Scenario: Preview updates on line change
- GIVEN the preview pane is visible
- AND the cursor is on file A's line
- WHEN the user moves the cursor to file B's line (click or keyboard)
- THEN the preview SHALL update to show file B's content

#### Scenario: Preview avoids redundant updates
- GIVEN the cursor is on a file line
- AND that file's preview is currently displayed
- WHEN the user clicks within the same line
- THEN the preview SHALL NOT re-render unnecessarily

#### Scenario: Preview updates on navigation
- GIVEN the preview pane is visible
- WHEN the user navigates to a different directory
- THEN the preview SHALL clear and show the first item in the new directory
- AND the cursor SHALL reset to the first line

#### Scenario: Preview clears when no selection
- GIVEN the preview pane is visible
- AND no line is selected (empty directory or cursor outside lines)
- THEN the preview SHALL display a placeholder message
- AND the placeholder SHALL indicate to select a file

### Requirement: Efficient File Reading
The plugin SHALL use Obsidian's efficient file reading APIs for preview content.

#### Scenario: Cached read for performance
- GIVEN a file needs to be previewed
- WHEN the plugin reads the file content
- THEN `app.vault.cachedRead(file)` SHALL be used
- AND the preview SHALL load quickly without blocking the UI

#### Scenario: Large file handling
- GIVEN a file larger than the truncation limit
- WHEN reading for preview
- THEN the plugin SHALL read the full content but display truncated
- AND the truncation SHALL happen after reading, not during

### Requirement: Preview Styling
The plugin SHALL style the preview pane consistently with Obsidian's theme.

#### Scenario: Theme consistency
- GIVEN the preview pane is visible
- THEN all colors SHALL use Obsidian CSS variables
- AND the preview SHALL adapt to light and dark themes automatically

#### Scenario: Preview header styling
- GIVEN content is being previewed
- THEN a header with the file/folder name SHALL be displayed
- AND the header SHALL have appropriate styling and icon

#### Scenario: Responsive layout
- GIVEN the preview pane is visible
- WHEN the window is resized
- THEN the preview pane SHALL maintain its configured percentage
- AND content SHALL remain readable with appropriate scrolling

