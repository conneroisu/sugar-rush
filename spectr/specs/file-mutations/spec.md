# File Mutations Specification

## Requirements

### Requirement: Event-Driven Mutation Execution
The plugin SHALL listen for mutation confirmation events from the oil view and execute the requested file operations.

#### Scenario: Executor listens for confirm event
- GIVEN the plugin is loaded
- WHEN the oil view emits `sugar-rush:confirm-mutations` event
- THEN the mutation executor SHALL receive the event payload
- AND the payload SHALL contain the list of mutations to apply
- AND the payload SHALL contain an onComplete callback

#### Scenario: Empty mutation list
- GIVEN a confirm-mutations event is received
- WHEN the mutations array is empty
- THEN the executor SHALL call onComplete(true) immediately
- AND no file operations SHALL be performed

### Requirement: Mutation Ordering
The plugin SHALL execute mutations in a specific order to prevent conflicts: creates before renames before deletes.

#### Scenario: Creates execute first
- GIVEN mutations include creates, renames, and deletes
- WHEN the mutations are executed
- THEN all create operations SHALL complete before any rename operations begin

#### Scenario: Renames execute second
- GIVEN mutations include creates, renames, and deletes
- WHEN the mutations are executed
- THEN all rename operations SHALL complete after creates and before deletes

#### Scenario: Deletes execute last
- GIVEN mutations include creates, renames, and deletes
- WHEN the mutations are executed
- THEN all delete operations SHALL execute after all other operations complete

#### Scenario: Creates sorted by depth
- GIVEN multiple create mutations at different path depths
- WHEN creates are executed
- THEN shallower paths SHALL be created before deeper paths
- AND this ensures parent folders exist before child files

#### Scenario: Deletes sorted by depth (reverse)
- GIVEN multiple delete mutations at different path depths
- WHEN deletes are executed
- THEN deeper paths SHALL be deleted before shallower paths
- AND this ensures folder contents are deleted before the folder itself

### Requirement: Create Operations
The plugin SHALL create new files and folders using Obsidian's vault API.

#### Scenario: Create empty file
- GIVEN a create mutation with isDirectory=false
- WHEN the mutation is executed
- THEN `app.vault.create(path, '')` SHALL be called
- AND the file SHALL exist in the vault after completion

#### Scenario: Create folder
- GIVEN a create mutation with isDirectory=true (or path ends with /)
- WHEN the mutation is executed
- THEN `app.vault.createFolder(path)` SHALL be called
- AND the folder SHALL exist in the vault after completion

#### Scenario: Create with missing parent folders
- GIVEN a create mutation for a file in a non-existent folder
- WHEN the mutation is executed
- THEN parent folders SHALL be created first
- AND the file SHALL be created in the new folder structure

### Requirement: Rename Operations
The plugin SHALL rename files and folders using Obsidian's fileManager API to preserve link integrity.

#### Scenario: Rename file with link update
- GIVEN a rename mutation for a markdown file
- WHEN the mutation is executed
- THEN `app.fileManager.renameFile(file, newPath)` SHALL be called
- AND all links to the file across the vault SHALL be updated automatically

#### Scenario: Rename folder
- GIVEN a rename mutation for a folder
- WHEN the mutation is executed
- THEN `app.fileManager.renameFile(folder, newPath)` SHALL be called
- AND all contents of the folder SHALL be moved to the new path
- AND links to files inside SHALL be updated

#### Scenario: Move file to different folder
- GIVEN a rename mutation where newPath is in a different directory
- WHEN the mutation is executed
- THEN the file SHALL be moved to the new location
- AND links SHALL be updated to reflect the new path

### Requirement: Delete Operations
The plugin SHALL delete files and folders respecting the `useTrashInsteadOfDelete` setting.

#### Scenario: Delete to trash (default)
- GIVEN useTrashInsteadOfDelete setting is true
- AND a delete mutation is executed
- WHEN the file is deleted
- THEN `app.fileManager.trashFile(file)` SHALL be called
- AND the file SHALL be moved to the system trash or Obsidian .trash folder

#### Scenario: Permanent delete
- GIVEN useTrashInsteadOfDelete setting is false
- AND a delete mutation is executed
- WHEN the file is deleted
- THEN `app.vault.delete(file, true)` SHALL be called
- AND the file SHALL be permanently removed from the filesystem

#### Scenario: Delete non-empty folder
- GIVEN a delete mutation for a folder containing files
- WHEN the delete is executed
- THEN all contents of the folder SHALL be deleted recursively
- AND the folder itself SHALL be deleted

#### Scenario: Delete already-deleted file
- GIVEN a delete mutation for a file that no longer exists
- WHEN the delete is executed
- THEN the operation SHALL complete without error
- AND a warning SHALL be logged

### Requirement: Deletion Confirmation
The plugin SHALL show a confirmation modal before executing delete operations when the `confirmBeforeDelete` setting is enabled.

#### Scenario: Confirmation modal shown
- GIVEN confirmBeforeDelete setting is true
- AND mutations include at least one delete
- WHEN confirm-mutations event is received
- THEN a modal SHALL be displayed listing files to be deleted
- AND the operation SHALL wait for user confirmation

#### Scenario: User confirms deletion
- GIVEN the confirmation modal is shown
- WHEN the user clicks the confirm button
- THEN the delete operations SHALL proceed
- AND the modal SHALL close

#### Scenario: User cancels deletion
- GIVEN the confirmation modal is shown
- WHEN the user clicks cancel or presses Escape
- THEN NO delete operations SHALL be performed
- AND onComplete(false) SHALL be called
- AND a notice SHALL inform the user operations were cancelled

#### Scenario: Confirmation skipped when disabled
- GIVEN confirmBeforeDelete setting is false
- AND mutations include deletes
- WHEN confirm-mutations event is received
- THEN NO confirmation modal SHALL be shown
- AND deletes SHALL proceed immediately

#### Scenario: Modal indicates trash vs permanent
- GIVEN the confirmation modal is shown
- WHEN useTrashInsteadOfDelete is true
- THEN the modal title SHALL say "Move to trash?"
- WHEN useTrashInsteadOfDelete is false
- THEN the modal title SHALL say "Permanently delete?"
- AND a warning about unrecoverable deletion SHALL be shown

#### Scenario: Modal limits file list display
- GIVEN more than 10 files are being deleted
- WHEN the confirmation modal is shown
- THEN only the first 10 files SHALL be listed
- AND text SHALL indicate how many more files are affected

### Requirement: Mutation Validation
The plugin SHALL validate all mutations before executing any of them.

#### Scenario: Validate creates don't conflict
- GIVEN a create mutation
- WHEN validation runs
- THEN an error SHALL be raised if the path already exists
- AND an error SHALL be raised if another mutation creates the same path

#### Scenario: Validate renames have valid source
- GIVEN a rename mutation
- WHEN validation runs
- THEN an error SHALL be raised if the source file does not exist
- AND an error SHALL be raised if the target path already exists (and won't be renamed/deleted)

#### Scenario: Validate deletes exist
- GIVEN a delete mutation
- WHEN validation runs
- THEN a warning SHALL be issued if the file does not exist
- AND execution SHALL continue (skip the delete)

#### Scenario: Detect circular renames
- GIVEN rename mutations A->B and B->A
- WHEN validation runs
- THEN an error SHALL be raised indicating circular rename

#### Scenario: Validation errors prevent execution
- GIVEN validation produces errors
- WHEN validation completes
- THEN NO mutations SHALL be executed
- AND error notices SHALL be shown to the user
- AND onComplete(false) SHALL be called

### Requirement: User Notifications
The plugin SHALL provide clear feedback to users about mutation results.

#### Scenario: Success notification
- GIVEN all mutations execute successfully
- WHEN execution completes
- THEN a notice SHALL show "Applied X file operations"

#### Scenario: Partial failure notification
- GIVEN some mutations fail
- WHEN execution completes
- THEN a notice SHALL show "Applied X operations, Y failed"
- AND failed operations SHALL be logged to console

#### Scenario: Validation error notification
- GIVEN validation errors are detected
- WHEN validation completes
- THEN each error message SHALL be shown as a notice
- AND notices SHALL remain visible for 5 seconds

#### Scenario: Cancellation notification
- GIVEN the user cancels from confirmation modal
- WHEN modal closes
- THEN a notice SHALL show "File operations cancelled"

### Requirement: Error Handling
The plugin SHALL handle errors gracefully without crashing.

#### Scenario: Single mutation failure continues
- GIVEN a batch of mutations to execute
- WHEN one mutation fails (e.g., permission error)
- THEN remaining mutations SHALL continue to execute
- AND the failed mutation SHALL be recorded

#### Scenario: Filesystem errors are caught
- GIVEN a mutation that causes a filesystem error
- WHEN the error occurs
- THEN the error SHALL be caught and logged
- AND the plugin SHALL NOT crash
- AND an error message SHALL be shown to the user

#### Scenario: Unknown mutation type
- GIVEN a mutation with an unrecognized type
- WHEN execution is attempted
- THEN an error SHALL be logged
- AND the mutation SHALL be skipped
- AND other mutations SHALL continue

### Requirement: View Refresh on Completion
The plugin SHALL notify the oil view when mutations complete so it can refresh.

#### Scenario: Successful completion callback
- GIVEN all mutations executed successfully
- WHEN execution completes
- THEN onComplete(true) SHALL be called
- AND the oil view SHALL refresh to show updated directory state

#### Scenario: Failed completion callback
- GIVEN some mutations failed
- WHEN execution completes
- THEN onComplete(false) SHALL be called
- AND the oil view MAY still refresh to show partial changes

