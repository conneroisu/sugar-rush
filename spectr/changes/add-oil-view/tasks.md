# Tasks: Add Oil View (Buffer-Based Directory Display)

## Dependencies
- **Requires:** `add-core-plugin-infrastructure` (settings, types, constants, command registration)

## 1. View Infrastructure
- [ ] 1.1 Create `src/views/` directory
- [ ] 1.2 Create `src/views/oil-view.ts` with OilView class extending ItemView
- [ ] 1.3 Implement getViewType(), getDisplayText(), getIcon() methods
- [ ] 1.4 Register view type in main.ts onload()
- [ ] 1.5 Implement onOpen() with container setup

## 2. Buffer Management
- [ ] 2.1 Create `src/views/oil-buffer.ts` with OilBuffer class
- [ ] 2.2 Implement loadDirectory() to read folder contents
- [ ] 2.3 Implement sortChildren() with display settings support
- [ ] 2.4 Implement hidden file filtering
- [ ] 2.5 Implement getEntries() to return current entries
- [ ] 2.6 Implement parseLineName() to extract name from formatted line
- [ ] 2.7 Implement parseAndDiff() to detect mutations from buffer text

## 3. Rendering
- [ ] 3.1 Create `src/views/oil-renderer.ts` with OilRenderer class
- [ ] 3.2 Implement render() to display entries as editable lines
- [ ] 3.3 Add icon rendering (folder/file icons)
- [ ] 3.4 Add optional file size display
- [ ] 3.5 Add optional modified date display
- [ ] 3.6 Implement updateHighlighting() for mutation state visualization

## 4. Mutation Tracking
- [ ] 4.1 Implement handleInput() to parse buffer and detect changes
- [ ] 4.2 Track pending mutations in view state
- [ ] 4.3 Implement rename detection (line content changed)
- [ ] 4.4 Implement deletion detection (line removed)
- [ ] 4.5 Implement creation detection (new line added)

## 5. Navigation
- [ ] 5.1 Implement navigateTo() to change current directory
- [ ] 5.2 Implement navigateUp() for parent directory navigation
- [ ] 5.3 Implement history tracking for back/forward
- [ ] 5.4 Handle Enter key on folder line → navigate into
- [ ] 5.5 Handle Enter key on file line → open file
- [ ] 5.6 Handle `-` key → navigate to parent

## 6. Confirm/Discard Actions
- [ ] 6.1 Implement confirmChanges() to emit mutation event
- [ ] 6.2 Implement discardChanges() to reset buffer
- [ ] 6.3 Wire Mod+Enter to confirmChanges()
- [ ] 6.4 Wire Escape to discardChanges()
- [ ] 6.5 Update status bar to show pending change count

## 7. Styling
- [ ] 7.1 Create `styles.css` with oil view styles
- [ ] 7.2 Style status bar (normal and pending states)
- [ ] 7.3 Style editor area with monospace font
- [ ] 7.4 Style line highlighting (modified/deleted/added)
- [ ] 7.5 Add hover states for lines
- [ ] 7.6 Add directory vs file visual distinction

## 8. Command Integration
- [ ] 8.1 Update commands/index.ts to open actual oil views
- [ ] 8.2 Implement openOilView() helper function
- [ ] 8.3 Handle opening in split vs tab
- [ ] 8.4 Navigate existing view if already open

## 9. Validation
- [ ] 9.1 Test view opens correctly from command palette
- [ ] 9.2 Test directory contents display correctly
- [ ] 9.3 Test editing a line shows modified highlighting
- [ ] 9.4 Test removing a line shows deleted highlighting
- [ ] 9.5 Test adding a line shows added highlighting
- [ ] 9.6 Test Escape discards changes
- [ ] 9.7 Test navigation into subdirectories works
- [ ] 9.8 Test `-` key navigates to parent
- [ ] 9.9 Run `spectr validate add-oil-view`

## Parallelizable Work
- Tasks 2.x (buffer) and 3.x (renderer) can be developed in parallel
- Tasks 7.x (styling) can run parallel to 4.x-6.x (logic)
