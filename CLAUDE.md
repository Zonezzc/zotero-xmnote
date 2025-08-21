# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zotero plugin project called "Zotero Xmnote Plugin" built using the Zotero Plugin Template. It's a
TypeScript-based plugin that integrates Zotero with XMnote server for data export and synchronization, using the
zotero-plugin-toolkit and zotero-plugin-scaffold.

## Development Commands

### Development Workflow

- `npm start` - Start development server with hot reload (prebuild, start Zotero, watch for changes)
- `npm run build` - Build plugin in production mode (includes TypeScript compilation check)
- `npm test` - Run tests using zotero-plugin scaffold
- `npm run release` - Version bump, build, and release to GitHub

### Code Quality

- `npm run lint:check` - Check code formatting (Prettier) and linting (ESLint)
- `npm run lint:fix` - Auto-fix formatting and linting issues

### Package Management

- `npm run update-deps` - Update all dependencies

## Core Architecture

### Plugin Structure

The plugin follows a modular event-driven architecture:

1. **Entry Point** (`src/index.ts`): Sets up global variables and initializes the main Addon class
2. **Main Addon Class** (`src/addon.ts`): Central plugin state management with lifecycle hooks
3. **Lifecycle Hooks** (`src/hooks.ts`): Event handlers for startup, shutdown, notifications, preferences, and UI events

### Key Components

- **Global Setup**: Registers `ztoolkit` and plugin instance under `Zotero[config.addonInstance]`
- **Hook System**: Dispatches events to appropriate handlers (onStartup, onShutdown, onNotify, etc.)
- **XMnote Integration**: Core functionality for exporting Zotero data to XMnote server
- **Hot Reload**: Development mode supports automatic recompilation and plugin reload

### Module Organization

- `src/modules/config/` - Configuration management (preferences, settings, types)
- `src/modules/ui/` - User interface components (menus, dialogs, context menus, item selection)
- `src/modules/xmnote/` - XMnote API client and types
- `src/modules/zotero/` - Zotero data extraction and transformation
- `src/modules/reading/` - Reading duration estimation with configurable parameters
- `src/modules/exporter.ts` - Data export orchestration
- `src/utils/` - Core utilities (locale, logger, network, ztoolkit)

### Data Flow Architecture

1. **User Interaction**: Menu items or context menus trigger export actions
2. **Item Selection**: UI components gather Zotero items (all, selected, or collection-based)
3. **Data Extraction**: Zotero extractor pulls bibliographic data, notes, and attachments
4. **Data Transformation**: Transformer converts Zotero data to XMnote format
5. **API Communication**: XMnote API client sends batch requests to server
6. **Progress Feedback**: UI shows real-time progress and completion status

### Configuration

- **Plugin Metadata**: Defined in `package.json` config section (addonName, addonID, addonRef, etc.)
- **Build System**: ESBuild configuration in `zotero-plugin.config.ts` targeting Firefox 115
  - Entry point: `src/index.ts`
  - Output: `.scaffold/build/addon/content/scripts/`
  - Assets copied from `addon/**/*.*`
- **TypeScript**: `tsconfig.json` extends `zotero-types/entries/sandbox/`
- **Code Quality**: ESLint uses `@zotero-plugin/eslint-config`, Prettier embedded in package.json
- **Localization**: Multi-language support via locale files in `addon/locale/`
- **Settings**: Server settings stored in Zotero preferences with real-time validation through `configManager`

### Key Integration Patterns

- **Singleton Pattern**: MenuHandler and ErrorHandler use singleton instances
- **Factory Pattern**: API clients and data transformers created via factory functions (`getDataExporter`,
  `getXMnoteApiClient`)
- **Event-Driven**: All UI interactions flow through the hook system
- **Centralized API Access**: All major APIs exposed through `addon.api` object
- **Global Variables**: Plugin registers global variables: `_globalThis`, `ztoolkit`, `addon`, `rootURI`, `__env__`
- **Async Operations**: Export operations use async/await with progress callbacks
- **Error Handling**: Centralized logging with user-visible notifications

### Development Environment

- **Node.js Version**: Requires Node.js 20 (as specified in CI workflows)
- **Package Manager**: Supports both npm and pnpm (pnpm-lock.yaml present)
- **Zotero Requirements**: Requires beta version of Zotero for development
- **Environment Configuration**: Create `.env` file with required variables:
  - `ZOTERO_PLUGIN_ZOTERO_BIN_PATH` - Path to Zotero binary
  - `ZOTERO_PLUGIN_PROFILE_PATH` - Development profile path
  - `ZOTERO_PLUGIN_DATA_DIR` - Data directory
  - `GITHUB_TOKEN` - Optional, for local releases
- **Environment variables**: `NODE_ENV` determines development vs production behavior

## Testing

Tests are located in the `test/` directory and use the zotero-plugin scaffold test framework. The test configuration waits for plugin initialization via `Zotero.${addonInstance}.data.initialized`. Tests automatically build and reload the plugin in a temporary Zotero instance.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly
requested by the User.

## CI/CD and Automation

### GitHub Actions Workflows

- **CI Pipeline**: Separate jobs for lint, build, and test on Node.js 20
- **Release Automation**: Tag-triggered releases with artifact uploads and GitHub release creation
- **Dependency Management**: Dependabot weekly updates with grouped non-major updates, plus Renovate integration

### CI/CD Issues Resolution

When GitHub Actions CI fails due to lint or code style issues:

1. **Code Style Failures**: Run `npm run lint:fix` to automatically fix Prettier formatting and ESLint issues
2. **Commit and Push**: After fixing, commit changes and push to trigger CI re-run
3. **Common Cause**: Prettier formatting inconsistencies in TypeScript files and documentation
