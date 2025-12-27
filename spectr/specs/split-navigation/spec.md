# Split Navigation Specification

## Requirements

### Requirement: Vertical Split Navigation
The plugin SHALL support opening directories in a vertical split (to the right of the current view) using `Ctrl+Enter` when the cursor is on a folder line.

#### Scenario: Open folder in vertical split
- GIVEN the oil view is displaying a directory
- AND the cursor is on a folder line
- WHEN the user presses `Ctrl+Enter`
- THEN a new vertical split SHALL be created to the right
- AND the new split SHALL contain an oil view
- AND the new oil view SHALL display the contents of the selected folder
- AND the original oil view SHALL remain unchanged

#### Scenario: Ctrl+Enter on file does nothing
- GIVEN the cursor is on a file line (not a folder)
- WHEN the user presses `Ctrl+Enter`
- THEN no split SHALL be created
- AND the default Mod+Enter confirm behavior SHALL NOT trigger (Ctrl != Mod on Mac)

#### Scenario: Vertical split inherits settings
- GIVEN a new vertical split is created
- THEN the new oil view SHALL use the same plugin settings
- AND the new oil view SHALL have its own independent navigation history

### Requirement: Horizontal Split Navigation
The plugin SHALL support opening directories in a horizontal split (below the current view) using `Ctrl+Shift+Enter` when the cursor is on a folder line.

#### Scenario: Open folder in horizontal split
- GIVEN the oil view is displaying a directory
- AND the cursor is on a folder line
- WHEN the user presses `Ctrl+Shift+Enter`
- THEN a new horizontal split SHALL be created below
- AND the new split SHALL contain an oil view
- AND the new oil view SHALL display the contents of the selected folder
- AND the original oil view SHALL remain unchanged

#### Scenario: Ctrl+Shift+Enter on file does nothing
- GIVEN the cursor is on a file line (not a folder)
- WHEN the user presses `Ctrl+Shift+Enter`
- THEN no split SHALL be created

#### Scenario: Horizontal split inherits settings
- GIVEN a new horizontal split is created
- THEN the new oil view SHALL use the same plugin settings
- AND the new oil view SHALL have its own independent navigation history

### Requirement: Parent Directory Navigation
The plugin SHALL support navigating to the parent directory using the `-` key, reusing the current leaf instead of creating a new split.

#### Scenario: Navigate to parent directory
- GIVEN the oil view is displaying a subdirectory (not vault root)
- WHEN the user presses the `-` key
- THEN the current view SHALL navigate to the parent directory
- AND the same leaf SHALL be reused (no new split created)
- AND the parent directory contents SHALL be displayed
- AND the navigation SHALL be added to history

#### Scenario: Navigate at vault root
- GIVEN the oil view is displaying the vault root (path is empty string)
- WHEN the user presses the `-` key
- THEN nothing SHALL happen
- AND no error SHALL occur

#### Scenario: Pending mutations warning on parent navigation
- GIVEN the oil view has pending mutations (unsaved changes)
- WHEN the user presses the `-` key
- THEN pending mutations SHALL be discarded
- AND navigation to parent SHALL proceed
- AND the status bar SHALL update to show no pending changes

### Requirement: Navigation History Tracking
The plugin SHALL maintain a navigation history for each oil view instance, enabling back/forward navigation.

#### Scenario: History push on navigation
- GIVEN the oil view displays directory A
- WHEN the user navigates to directory B
- THEN directory B SHALL be pushed to the history stack
- AND the history index SHALL point to the new entry

#### Scenario: Navigate back in history
- GIVEN the user has navigated from A to B to C
- AND the current directory is C
- WHEN the user presses `Alt+Left` (or triggers navigate back command)
- THEN the view SHALL display directory B
- AND the history index SHALL move back one position
- AND scroll position SHALL be restored if previously saved

#### Scenario: Navigate forward in history
- GIVEN the user navigated back from C to B
- AND forward history exists (C)
- WHEN the user presses `Alt+Right` (or triggers navigate forward command)
- THEN the view SHALL display directory C
- AND the history index SHALL move forward one position

#### Scenario: History truncation on new navigation
- GIVEN the user navigated A -> B -> C -> back to B
- AND the current position is B with forward history (C)
- WHEN the user navigates to D
- THEN the forward history (C) SHALL be discarded
- AND history SHALL be A -> B -> D
- AND current position SHALL be D

#### Scenario: Cannot navigate back at beginning
- GIVEN the history stack has only one entry (or is empty)
- WHEN the user tries to navigate back
- THEN nothing SHALL happen
- AND no error SHALL occur

#### Scenario: Cannot navigate forward at end
- GIVEN the current position is at the end of history
- WHEN the user tries to navigate forward
- THEN nothing SHALL happen
- AND no error SHALL occur

#### Scenario: History size limit
- GIVEN the history stack has reached MAX_HISTORY_SIZE (50 entries)
- WHEN a new navigation occurs
- THEN the oldest entry SHALL be removed
- AND the new entry SHALL be added
- AND total entries SHALL not exceed MAX_HISTORY_SIZE

### Requirement: Independent Split State
Each oil view instance created via splits SHALL maintain independent state, including current directory, navigation history, and pending mutations.

#### Scenario: Splits have independent directories
- GIVEN oil view A is open displaying /folder1
- WHEN the user opens /folder2 in a vertical split (creating view B)
- THEN view A SHALL continue displaying /folder1
- AND view B SHALL display /folder2
- AND navigating in view B SHALL NOT affect view A

#### Scenario: Splits have independent history
- GIVEN two oil views exist (A and B)
- WHEN the user navigates in view A (A1 -> A2 -> A3)
- THEN view A's history SHALL contain A1, A2, A3
- AND view B's history SHALL be unaffected

#### Scenario: Splits have independent pending mutations
- GIVEN two oil views exist (A and B)
- WHEN the user makes edits in view A
- THEN view A SHALL have pending mutations
- AND view B SHALL NOT have pending mutations
- AND confirming in view A SHALL NOT affect view B

### Requirement: Configurable Split Keybindings
The plugin SHALL allow users to configure split navigation keybindings through the settings tab.

#### Scenario: Default keybindings
- GIVEN default settings
- THEN openInVerticalSplit SHALL be 'Ctrl+Enter'
- AND openInHorizontalSplit SHALL be 'Ctrl+Shift+Enter'
- AND navigateUp SHALL be '-'
- AND navigateBack SHALL be 'Alt+ArrowLeft'
- AND navigateForward SHALL be 'Alt+ArrowRight'

#### Scenario: Custom keybindings
- GIVEN the user changes openInVerticalSplit to 'Ctrl+v'
- WHEN the user presses 'Ctrl+v' on a folder
- THEN a vertical split SHALL be created
- AND 'Ctrl+Enter' SHALL no longer trigger vertical split

#### Scenario: Settings persistence
- GIVEN the user changes split keybindings
- WHEN Obsidian is restarted
- THEN the custom keybindings SHALL be preserved

### Requirement: Split Navigation Commands
The plugin SHALL register commands for split navigation that are accessible via the command palette.

#### Scenario: Commands appear in palette
- GIVEN Sugar Rush is loaded
- WHEN the user opens the command palette
- THEN "Sugar Rush: Navigate to parent directory" SHALL be available
- AND "Sugar Rush: Open folder in vertical split (right)" SHALL be available
- AND "Sugar Rush: Open folder in horizontal split (below)" SHALL be available
- AND "Sugar Rush: Navigate back in history" SHALL be available
- AND "Sugar Rush: Navigate forward in history" SHALL be available

#### Scenario: Commands are context-sensitive
- GIVEN no oil view is active
- THEN split navigation commands SHALL NOT appear in the palette
- GIVEN an oil view is active but cursor is not on a folder
- THEN "Open folder in vertical split" SHALL NOT appear in the palette
- GIVEN an oil view is active with cursor on a folder
- THEN "Open folder in vertical split" SHALL appear and be executable

#### Scenario: Command IDs are stable
- GIVEN commands are registered
- THEN command ID 'sugar-rush:navigate-up' SHALL remain constant
- AND command ID 'sugar-rush:open-in-vertical-split' SHALL remain constant
- AND command ID 'sugar-rush:open-in-horizontal-split' SHALL remain constant
- AND command ID 'sugar-rush:navigate-back' SHALL remain constant
- AND command ID 'sugar-rush:navigate-forward' SHALL remain constant

### Requirement: Workspace API Usage
The plugin SHALL use correct Obsidian Workspace APIs for split management.

#### Scenario: Vertical split API usage
- GIVEN a vertical split is requested
- THEN `workspace.getLeaf('split', 'vertical')` SHALL be called
- AND `leaf.setViewState({ type: OIL_VIEW_TYPE, active: true })` SHALL be called

#### Scenario: Horizontal split API usage
- GIVEN a horizontal split is requested
- THEN `workspace.getLeaf('split', 'horizontal')` SHALL be called
- AND `leaf.setViewState({ type: OIL_VIEW_TYPE, active: true })` SHALL be called

#### Scenario: Tab API usage (future)
- GIVEN a new tab is requested
- THEN `workspace.getLeaf('tab')` SHALL be called
- AND `leaf.setViewState({ type: OIL_VIEW_TYPE, active: true })` SHALL be called

#### Scenario: Reuse existing leaf
- GIVEN navigation in current view is requested
- THEN `workspace.getLeaf(false)` MAY be used to get existing leaf
- OR navigation occurs directly on the current leaf's view

