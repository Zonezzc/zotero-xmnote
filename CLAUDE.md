# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Zotero plugin project called "Zotero Xmnote Plugin" built using the Zotero Plugin Template. It's a TypeScript-based plugin that extends Zotero's functionality using the zotero-plugin-toolkit and zotero-plugin-scaffold.

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
- **Factory Pattern**: Example modules use factory classes for different functionality types
- **Hot Reload**: Development mode supports automatic recompilation and plugin reload

### Module Organization
- `src/modules/examples.ts` - Example implementations for various Zotero APIs
- `src/modules/preferenceScript.ts` - Preference pane configuration
- `src/utils/` - Utility functions for locale, preferences, window management, and ztoolkit

### Configuration
- Plugin metadata defined in `package.json` config section (addonName, addonID, addonRef, etc.)
- Build configuration in `zotero-plugin.config.ts` using zotero-plugin-scaffold
- TypeScript configuration targets Firefox 115

### Development Environment
- Requires beta version of Zotero for development
- Uses `.env` file for Zotero binary path and profile configuration
- Environment variables: `NODE_ENV` determines development vs production behavior

## Testing

Tests are located in the `test/` directory and use the zotero-plugin scaffold test framework. The test configuration waits for plugin initialization via `Zotero.${addonInstance}.data.initialized`.