# Tasks: Add Oil View (TextFileView-Based Directory Display)

## Dependencies
- **Requires:** `add-core-plugin-infrastructure` (settings, types, constants, command registration)

## 1. View Infrastructure
- [ ] 1.1 Create `src/views/` directory
- [ ] 1.2 Create `src/views/oil-view.ts` with OilView class extending TextFileView
- [ ] 1.3 Implement getViewType(), getDisplayText(), getIcon() methods
- [ ] 1.4 Register view type in main.ts onload()
- [ ] 1.5 Implement onOpen() with status bar and editor setup
- [ ] 1.6 Implement TextFileView required methods (getViewData, setViewData, clear)

## 2. Buffer Management
- [ ] 2.1 Create `src/views/oil-buffer.ts` with OilBuffer class
- [ ] 2.2 Implement loadDirectory() to read folder contents
- [ ] 2.3 Implement sortAndFilter() with display settings support
- [ ] 2.4 Implement renderToText() to generate plain text content
- [ ] 2.5 Implement getEntries() to return current entries
- [ ] 2.6 Implement getEntryForLine() to get entry from line text
- [ ] 2.7 Implement parseAndDiff() to detect mutations from editor content

## 3. Editor Integration
- [ ] 3.1 Register keydown handler for oil-specific keys
- [ ] 3.2 Listen for editor-change events to track mutations
- [ ] 3.3 Use editor.getValue() / setValue() for content
- [ ] 3.4 Use editor.getCursor() / setCursor() for navigation
- [ ] 3.5 Use editor.getLine() for current line detection

## 4. Mutation Tracking
- [ ] 4.1 Implement onEditorChange() to parse and detect changes
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
- [ ] 5.6 Handle `-` key at line start → navigate to parent

## 6. Apply/Discard Actions
- [ ] 6.1 Implement applyChanges() to emit mutation event
- [ ] 6.2 Implement discardChanges() to reset to original content
- [ ] 6.3 Intercept Mod+S to call applyChanges() (not save to disk)
- [ ] 6.4 Wire Escape to discardChanges()
- [ ] 6.5 Update status bar to show pending change count

## 7. Styling
- [ ] 7.1 Create `styles.css` with oil view styles
- [ ] 7.2 Style status bar (normal and pending states)
- [ ] 7.3 Minimal editor styling (let Obsidian handle most)
- [ ] 7.4 Optional: Add line decorations for mutation highlighting

## 8. Command Integration
- [ ] 8.1 Update commands/index.ts to open actual oil views
- [ ] 8.2 Implement openOilView() helper function
- [ ] 8.3 Handle opening in split vs tab
- [ ] 8.4 Navigate existing view if already open

## 9. Validation
- [ ] 9.1 Test view opens correctly from command palette
- [ ] 9.2 Test directory contents display correctly
- [ ] 9.3 Test vim mode keybindings work (j/k, dd, etc.)
- [ ] 9.4 Test undo/redo works (Cmd+Z, Cmd+Shift+Z)
- [ ] 9.5 Test Escape discards changes
- [ ] 9.6 Test Mod+S applies changes
- [ ] 9.7 Test navigation into subdirectories works
- [ ] 9.8 Test `-` key navigates to parent
- [ ] 9.9 Run `spectr validate add-oil-view`

## Key Differences from ContentEditable Approach
- Uses TextFileView for native Obsidian editor with vim mode
- Plain text format (folder/, file.ext) instead of emoji icons
- Mod+S applies changes (not Mod+Enter)
- All editor features (undo, search, selection) work automatically
