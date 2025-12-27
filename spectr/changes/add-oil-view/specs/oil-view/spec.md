# Oil View Specification

## ADDED Requirements

### Requirement: Buffer-Based Directory Display
The plugin SHALL display directory contents as editable text lines in a custom Obsidian view, where each line represents a file or folder.

#### Scenario: View displays directory contents
- GIVEN a directory with files and folders
- WHEN the user opens the oil view for that directory
- THEN each file and folder SHALL be displayed on its own line
- AND folders SHALL be visually distinguished from files (icon and/or trailing /)
- AND entries SHALL be sorted according to user settings

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
The plugin SHALL track edits to the buffer as pending mutations WITHOUT immediately applying them to the filesystem. This prevents accidental changes since Obsidian auto-saves files.

#### Scenario: Edits are staged, not applied
- GIVEN the oil view is displaying a directory
- WHEN the user edits a line (changes a filename)
- THEN the edit SHALL be tracked as a pending "rename" mutation
- AND the actual file on disk SHALL NOT be renamed yet
- AND the line SHALL be visually highlighted as modified

#### Scenario: Line deletion is staged
- GIVEN the oil view with file entries
- WHEN the user removes a line from the buffer
- THEN a pending "delete" mutation SHALL be tracked
- AND the actual file SHALL NOT be deleted yet
- AND the line SHALL be visually highlighted as deleted (strikethrough)

#### Scenario: Line addition is staged
- GIVEN the oil view displaying a directory
- WHEN the user adds a new line with a filename
- THEN a pending "create" mutation SHALL be tracked
- AND no new file SHALL be created yet
- AND the line SHALL be visually highlighted as added

#### Scenario: Status bar shows pending count
- GIVEN pending mutations exist
- THEN the status bar SHALL display the count of pending changes
- AND the status bar SHALL indicate how to confirm (Mod+Enter) or discard (Escape)

### Requirement: Explicit Confirmation Required
The plugin SHALL only apply mutations when the user explicitly confirms, using a command or keyboard shortcut.

#### Scenario: Confirm applies mutations
- GIVEN pending mutations (renames, deletes, creates)
- WHEN the user presses Mod+Enter (or triggers confirm command)
- THEN all pending mutations SHALL be emitted for the file-mutations system to apply
- AND on success, the view SHALL refresh to show the new state
- AND pending mutations SHALL be cleared

#### Scenario: Discard resets buffer
- GIVEN pending mutations exist
- WHEN the user presses Escape (or triggers discard command)
- THEN all pending mutations SHALL be discarded
- AND the buffer SHALL be reset to the original directory state
- AND all highlighting SHALL be removed

#### Scenario: No confirmation needed when no changes
- GIVEN no pending mutations
- WHEN the user presses Mod+Enter
- THEN nothing SHALL happen (no error, no action)

### Requirement: Visual Mutation Indicators
The plugin SHALL provide clear visual feedback for each type of pending mutation using highlighting and styling.

#### Scenario: Modified line highlighting
- GIVEN a line has been edited (rename mutation pending)
- THEN the line SHALL have a warning-colored background
- AND the line SHALL have a colored left border indicator

#### Scenario: Deleted line highlighting
- GIVEN a line has been removed (delete mutation pending)
- THEN the line SHALL have an error-colored background
- AND the line text SHALL have strikethrough styling
- AND the line SHALL have reduced opacity

#### Scenario: Added line highlighting
- GIVEN a new line has been added (create mutation pending)
- THEN the line SHALL have a success-colored background
- AND the line SHALL have a colored left border indicator

### Requirement: Directory Navigation
The plugin SHALL support navigating between directories using keyboard shortcuts and actions.

#### Scenario: Navigate into subdirectory
- GIVEN the cursor is on a folder line
- WHEN the user presses Enter
- THEN the view SHALL navigate to display that folder's contents
- AND the previous directory SHALL be added to navigation history

#### Scenario: Navigate to parent directory
- GIVEN the view is displaying a subdirectory (not vault root)
- WHEN the user presses the `-` key (or configured navigateUp key)
- THEN the view SHALL navigate to the parent directory
- AND any pending mutations SHALL be discarded (with warning if any exist)

#### Scenario: Navigate at vault root
- GIVEN the view is displaying the vault root
- WHEN the user presses the `-` key
- THEN nothing SHALL happen (already at root)

#### Scenario: Open file on Enter
- GIVEN the cursor is on a file line (not a folder)
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
Each line in the oil view SHALL follow a consistent format for parsing and display.

#### Scenario: Folder line format
- GIVEN a folder entry
- THEN the line SHALL display as: "[folder icon] folder-name/"
- AND the trailing slash indicates it's a directory

#### Scenario: File line format
- GIVEN a file entry
- THEN the line SHALL display as: "[file icon] filename.ext"
- AND optionally include file size if showFileSizes is enabled
- AND optionally include modified date if showModifiedDate is enabled

#### Scenario: Icons configurable
- GIVEN showFileIcons setting
- WHEN showFileIcons is false
- THEN lines SHALL NOT include icons
- WHEN showFileIcons is true
- THEN lines SHALL include appropriate icons (📁 for folders, 📄 for files)

### Requirement: Keyboard Handling
The plugin SHALL handle keyboard events within the oil view for navigation and actions.

#### Scenario: Configurable keybindings
- GIVEN the keybindings settings
- THEN the navigateUp key SHALL trigger parent directory navigation
- AND the confirmChanges key combination SHALL apply pending mutations
- AND the discardChanges key SHALL reset the buffer

#### Scenario: Standard editing keys work
- GIVEN the oil view is focused
- THEN standard text editing keys (arrows, backspace, delete, typing) SHALL work normally
- AND edits SHALL be tracked as pending mutations
