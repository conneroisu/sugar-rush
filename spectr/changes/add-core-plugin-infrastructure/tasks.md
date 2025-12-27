# Tasks: Add Core Plugin Infrastructure

## 1. Project Structure Setup
- [ ] 1.1 Create `src/` directory structure (`src/`, `src/commands/`)
- [ ] 1.2 Move `main.ts` from root to `src/main.ts`
- [ ] 1.3 Update `tsconfig.json` to reflect new structure
- [ ] 1.4 Create `esbuild.config.mjs` for Bun bundler (outputs to `main.js` at root)
- [ ] 1.5 Update `package.json` with build scripts (`build`, `dev`)

## 2. Core Types and Constants
- [ ] 2.1 Create `src/constants.ts` with plugin ID, view types, CSS classes
- [ ] 2.2 Create `src/types.ts` with OilEntry, FileMutation, OilViewState interfaces

## 3. Settings Implementation
- [ ] 3.1 Create `src/settings.ts` with SugarRushSettings interface
- [ ] 3.2 Define DEFAULT_SETTINGS with all options
- [ ] 3.3 Create `src/settings-tab.ts` with SugarRushSettingTab class
- [ ] 3.4 Implement General settings section (hidden files, delete behavior)
- [ ] 3.5 Implement Display settings section (icons, sizes, sorting)
- [ ] 3.6 Implement Keybindings settings section
- [ ] 3.7 Implement Preview settings section (placeholder for future feature)

## 4. Command Registration
- [ ] 4.1 Create `src/commands/index.ts` with COMMAND_IDS constants
- [ ] 4.2 Implement registerCommands() function
- [ ] 4.3 Add placeholder commands (open oil view, open at root, open parent)

## 5. Main Plugin Class
- [ ] 5.1 Implement SugarRushPlugin class in `src/main.ts`
- [ ] 5.2 Implement onload() with settings loading, tab registration, command registration
- [ ] 5.3 Implement onunload() with cleanup logging
- [ ] 5.4 Implement loadSettings() and saveSettings() methods

## 6. Build Configuration
- [ ] 6.1 Configure Bun bundler to output `main.js` at project root
- [ ] 6.2 Ensure external dependencies (obsidian) are excluded from bundle
- [ ] 6.3 Test build produces valid `main.js`

## 7. Validation
- [ ] 7.1 Verify plugin loads in Obsidian without errors
- [ ] 7.2 Verify settings tab displays correctly
- [ ] 7.3 Verify settings persist across plugin reload
- [ ] 7.4 Verify commands appear in command palette
- [ ] 7.5 Run `spectr validate add-core-plugin-infrastructure --strict`

## Dependencies
- None (this is the foundation)

## Parallelizable Work
- Tasks 2.x (types/constants) can run parallel to 3.x (settings)
- Task 6.x (build config) can start after 1.x is complete
