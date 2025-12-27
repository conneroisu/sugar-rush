# Tasks: Add Split Navigation

## 1. Core Infrastructure

- [ ] 1.1 Create `src/views/split-manager.ts` with `SplitManager` class
- [ ] 1.2 Implement `openInSplit(direction, path)` method using `workspace.getLeaf('split', direction)`
- [ ] 1.3 Implement `openInTab(path)` method using `workspace.getLeaf('tab')`
- [ ] 1.4 Implement `navigateInPlace(leaf, path)` method using existing leaf
- [ ] 1.5 Implement `getOrCreateOilView(path)` method using `workspace.getLeaf(false)`

## 2. Navigation History

- [ ] 2.1 Create `src/views/navigation-history.ts` with `NavigationHistoryManager` class
- [ ] 2.2 Implement `push(path, scrollTop, selectedLine)` method with history truncation
- [ ] 2.3 Implement `goBack()` and `goForward()` methods
- [ ] 2.4 Implement `canGoBack()` and `canGoForward()` helper methods
- [ ] 2.5 Implement `updateCurrentScroll()` for scroll position tracking
- [ ] 2.6 Add MAX_HISTORY_SIZE constant (50 entries)

## 3. Types and Constants

- [ ] 3.1 Add `NavigationHistoryEntry` interface to `src/types.ts`
- [ ] 3.2 Add `NavigationHistory` interface to `src/types.ts`
- [ ] 3.3 Update `OilViewState` interface with new history structure
- [ ] 3.4 Add new command IDs to `src/constants.ts`
  - `OPEN_IN_VERTICAL_SPLIT`
  - `OPEN_IN_HORIZONTAL_SPLIT`
  - `NAVIGATE_UP`
  - `NAVIGATE_BACK`
  - `NAVIGATE_FORWARD`

## 4. Settings Updates

- [ ] 4.1 Add split navigation keybindings to `SugarRushSettings.keybindings` interface
  - `openInVerticalSplit: string`
  - `openInHorizontalSplit: string`
  - `navigateBack: string`
  - `navigateForward: string`
- [ ] 4.2 Add default values in `DEFAULT_SETTINGS.keybindings`
  - `openInVerticalSplit: 'Ctrl+Enter'`
  - `openInHorizontalSplit: 'Ctrl+Shift+Enter'`
  - `navigateBack: 'Alt+ArrowLeft'`
  - `navigateForward: 'Alt+ArrowRight'`
- [ ] 4.3 Update settings tab UI with new keybinding inputs in Keybindings section

## 5. Oil View Integration

- [ ] 5.1 Add `SplitManager` instance to `OilView` class
- [ ] 5.2 Add `NavigationHistoryManager` instance to `OilView` class
- [ ] 5.3 Implement `buildPath(name)` helper method for path construction
- [ ] 5.4 Update `handleKeydown()` to handle split navigation keys:
  - `Ctrl+Enter` on folder -> vertical split
  - `Ctrl+Shift+Enter` on folder -> horizontal split
  - `-` -> navigate to parent
  - `Alt+Left` -> navigate back
  - `Alt+Right` -> navigate forward
- [ ] 5.5 Update `navigateTo()` to push to history and track scroll position
- [ ] 5.6 Implement `navigateBack()` method using history manager
- [ ] 5.7 Implement `navigateForward()` method using history manager
- [ ] 5.8 Update `navigateUp()` to warn/discard pending mutations

## 6. Command Registration

- [ ] 6.1 Create `getActiveOilView(plugin)` helper function
- [ ] 6.2 Register "Navigate to parent directory" command with `checkCallback`
- [ ] 6.3 Register "Open folder in vertical split" command with `checkCallback`
- [ ] 6.4 Register "Open folder in horizontal split" command with `checkCallback`
- [ ] 6.5 Register "Navigate back in history" command with `checkCallback`
- [ ] 6.6 Register "Navigate forward in history" command with `checkCallback`

## 7. Testing

- [ ] 7.1 Test vertical split: Ctrl+Enter on folder creates split to right
- [ ] 7.2 Test horizontal split: Ctrl+Shift+Enter on folder creates split below
- [ ] 7.3 Test parent navigation: `-` key navigates to parent, reuses current leaf
- [ ] 7.4 Test vault root: `-` key does nothing when at vault root
- [ ] 7.5 Test history back: Alt+Left returns to previous directory
- [ ] 7.6 Test history forward: Alt+Right returns to next directory (after going back)
- [ ] 7.7 Test history truncation: Navigating from middle of history clears forward stack
- [ ] 7.8 Test independent state: Each split view maintains separate history
- [ ] 7.9 Test pending mutations: Navigating up discards pending changes
- [ ] 7.10 Test commands in palette: All split navigation commands appear correctly
- [ ] 7.11 Test settings: Keybinding changes are applied immediately
