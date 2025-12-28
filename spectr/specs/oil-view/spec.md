# Oil View Specification

## Requirements

### Requirement: TextFileView-Based Directory Editor
The plugin SHALL implement OilView by extending Obsidian's TextFileView class, providing a native CodeMirror editor experience for directory manipulation.

#### Scenario: View uses native CodeMirror editor
- GIVEN the oil view is opened for a directory
- THEN the view SHALL use Obsidian's built-in CodeMirror editor
- AND vim mode SHALL be supported if enabled in Obsidian settings
- AND undo/redo (Mod+Z, Mod+Shift+Z) SHALL work automatically
- AND search (Mod+F) SHALL work automatically
- AND text selection and cursor movement SHALL work natively

#### Scenario: View extends TextFileView
- GIVEN the OilView class
- THEN it SHALL extend TextFileView (not ItemView)
- AND it SHALL register a custom view type for ".oil" virtual files
- AND it SHALL handle the "oil" file extension

### Requirement: Plain Text Directory Display
The plugin SHALL display directory contents as plain text lines, where each line represents a file or folder using a simple text format.

#### Scenario: View displays directory contents as plain text
- GIVEN a directory with files and folders
- WHEN the user opens the oil view for that directory
- THEN each file and folder SHALL be displayed on its own line as plain text
- AND folders SHALL be displayed as "folder-name/" (with trailing slash)
- AND files SHALL be displayed as "filename.ext" (no trailing slash)
- AND entries SHALL be sorted according to user settings

#### Scenario: No icons in plain text mode
- GIVEN the plain text editor format
- THEN entries SHALL NOT include emoji or graphical icons
- AND the trailing slash alone SHALL distinguish folders from files

#### Scenario: Hidden files respect settings
- GIVEN a directory containing hidden files (starting with .)
- WHEN showHiddenFiles setting is false
- THEN hidden files SHALL NOT be displayed
- WHEN showHiddenFiles setting is true
- THEN hidden files SHALL be displayed

#### Scenario: Directory sorting
- GIVEN display settings for sortOrder, sortDirection, and directoryFirst
- WHEN the oil view renders a directory
- THEN entries SHALL be sorted according to sortOrder (name/modified/size)
- AND sort direction SHALL match sortDirection setting
- AND if directoryFirst is true, folders SHALL appear before files

### Requirement: Pending Mutation Tracking
The plugin SHALL track edits to the buffer as pending mutations WITHOUT immediately applying them to the filesystem. Changes are only applied on explicit save.

#### Scenario: Edits are staged, not applied
- GIVEN the oil view is displaying a directory
- WHEN the user edits a line (changes a filename)
- THEN the edit SHALL be tracked as a pending "rename" mutation
- AND the actual file on disk SHALL NOT be renamed yet
- AND the editor SHALL show the file as modified (dot in tab)

#### Scenario: Line deletion is staged
- GIVEN the oil view with file entries
- WHEN the user removes a line from the buffer
- THEN a pending "delete" mutation SHALL be tracked
- AND the actual file SHALL NOT be deleted yet

#### Scenario: Line addition is staged
- GIVEN the oil view displaying a directory
- WHEN the user adds a new line with a filename
- THEN a pending "create" mutation SHALL be tracked
- AND no new file SHALL be created yet

#### Scenario: Editor tracks modification state
- GIVEN pending mutations exist
- THEN the tab SHALL show a modification indicator (dot)
- AND getViewData() SHALL return the modified buffer content

### Requirement: Save to Apply Changes (Mod+S)
The plugin SHALL apply mutations when the user saves the file using Mod+S, leveraging Obsidian's native save behavior.

#### Scenario: Save applies mutations
- GIVEN pending mutations (renames, deletes, creates)
- WHEN the user presses Mod+S (or triggers save command)
- THEN setViewData() SHALL be called by Obsidian
- AND the plugin SHALL parse the buffer to detect mutations
- AND all pending mutations SHALL be emitted for the file-mutations system to apply
- AND on success, the view SHALL refresh to show the new state
- AND pending mutations SHALL be cleared

#### Scenario: Undo reverts changes in buffer
- GIVEN pending mutations exist in the editor
- WHEN the user presses Mod+Z
- THEN the editor SHALL undo the last edit
- AND the mutation tracking SHALL update accordingly
- AND this is handled automatically by CodeMirror

#### Scenario: No save needed when no changes
- GIVEN no pending mutations
- WHEN the user presses Mod+S
- THEN nothing SHALL happen (no error, no action)

### Requirement: Directory Navigation
The plugin SHALL support navigating between directories using keyboard shortcuts and actions.

#### Scenario: Navigate into subdirectory
- GIVEN the cursor is on a folder line (ends with /)
- WHEN the user presses Enter
- THEN the view SHALL navigate to display that folder's contents
- AND any unsaved changes SHALL be handled (prompt or auto-apply based on settings)

#### Scenario: Navigate to parent directory
- GIVEN the view is displaying a subdirectory (not vault root)
- WHEN the user presses the `-` key (or configured navigateUp key)
- THEN the view SHALL navigate to the parent directory
- AND any unsaved changes SHALL be handled (prompt or discard based on settings)

#### Scenario: Navigate at vault root
- GIVEN the view is displaying the vault root
- WHEN the user presses the `-` key
- THEN nothing SHALL happen (already at root)

#### Scenario: Open file on Enter
- GIVEN the cursor is on a file line (not ending with /)
- WHEN the user presses Enter
- THEN the file SHALL be opened in a new leaf
- AND the oil view SHALL remain open

### Requirement: View Integration
The plugin SHALL integrate with Obsidian's view and workspace system, supporting tabs and splits.

#### Scenario: View appears in tab
- GIVEN the oil view is opened
- THEN it SHALL appear as a tab in the workspace
- AND the tab title SHALL show the current directory path
- AND the tab icon SHALL be a folder icon

#### Scenario: View can be split
- GIVEN the oil view is open
- WHEN the user splits the view
- THEN the new split SHALL also be an oil view
- AND each view SHALL maintain independent state

#### Scenario: View state persistence
- GIVEN an oil view is open showing a specific directory
- WHEN Obsidian is restarted
- THEN the view SHOULD restore to show the same directory (best effort)

#### Scenario: Command opens or focuses existing view
- GIVEN an oil view already exists in the workspace
- WHEN the user triggers "Open file explorer" command
- THEN the existing view SHALL be focused and revealed
- AND the view SHALL navigate to the requested directory

### Requirement: Line Format
Each line in the oil view SHALL follow a simple plain text format for parsing and display.

#### Scenario: Folder line format
- GIVEN a folder entry
- THEN the line SHALL display as: "folder-name/"
- AND the trailing slash indicates it's a directory
- AND no icons or prefixes SHALL be included

#### Scenario: File line format
- GIVEN a file entry
- THEN the line SHALL display as: "filename.ext"
- AND no trailing slash SHALL be present
- AND no icons or prefixes SHALL be included

#### Scenario: Whitespace handling
- GIVEN lines in the buffer
- THEN empty lines SHALL be ignored when parsing
- AND leading/trailing whitespace on lines SHALL be trimmed
- AND lines with only whitespace SHALL be treated as empty

### Requirement: Keyboard Handling
The plugin SHALL handle keyboard events within the oil view, with most editing handled by CodeMirror.

#### Scenario: Standard editing via CodeMirror
- GIVEN the oil view is focused
- THEN standard text editing keys SHALL be handled by CodeMirror
- AND vim keybindings SHALL work if vim mode is enabled in Obsidian
- AND undo/redo SHALL work via CodeMirror history

#### Scenario: Custom navigation keys
- GIVEN the oil view is focused
- THEN the navigateUp key (`-`) SHALL trigger parent directory navigation
- AND Enter on a folder SHALL navigate into it
- AND Enter on a file SHALL open that file

#### Scenario: Save triggers apply
- GIVEN the oil view is focused with pending changes
- WHEN the user presses Mod+S
- THEN changes SHALL be applied to the filesystem
- AND this uses Obsidian's native save mechanism via TextFileView

### Requirement: CodeMirror Integration Benefits
The plugin SHALL leverage built-in CodeMirror features provided by TextFileView.

#### Scenario: Native undo/redo support
- GIVEN the editor is active
- THEN Mod+Z SHALL undo the last edit
- AND Mod+Shift+Z (or Mod+Y) SHALL redo
- AND full edit history SHALL be maintained

#### Scenario: Native search support
- GIVEN the editor is active
- THEN Mod+F SHALL open the search dialog
- AND search/replace functionality SHALL work

#### Scenario: Native selection support
- GIVEN the editor is active
- THEN Shift+arrows SHALL select text
- AND Mod+A SHALL select all
- AND mouse selection SHALL work

#### Scenario: Vim mode support
- GIVEN vim mode is enabled in Obsidian settings
- THEN vim keybindings SHALL work in the oil view
- AND normal/insert/visual modes SHALL function correctly
- AND :w SHALL trigger save (apply changes)

