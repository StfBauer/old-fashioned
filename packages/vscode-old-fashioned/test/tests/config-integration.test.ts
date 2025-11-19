/**
 * Configuration Integration Tests - Consolidated Version
 * 
 * This file tests the integration between project-level configuration
 * and VS Code extension settings.
 */

// Import vi first for mocking
import { vi } from 'vitest';
import * as path from 'path';
import * as os from 'os';
import { ConfigSource } from '../../src/config-loader';

// Define mocks with hoisting to prevent initialization errors
const mockFS = vi.hoisted(() => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn()
}));

const mockStylelint = vi.hoisted(() => ({
    default: {
        lint: vi.fn().mockImplementation(() => {
            return Promise.resolve({
                results: [{ warnings: [] }],
                output: 'sorted-css'
            });
        })
    }
}));

// Mock VS Code APIs directly to avoid circular dependencies
const mockVSCode = vi.hoisted(() => ({
    window: {
        activeTextEditor: undefined,
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        showWarningMessage: vi.fn(),
        withProgress: vi.fn().mockImplementation((options, task) => task())
    },
    commands: {
        registerCommand: vi.fn(),
        executeCommand: vi.fn()
    },
    workspace: {
        getConfiguration: vi.fn().mockReturnValue({
            get: vi.fn().mockImplementation((key: string, defaultValue: any) => {
                if (key === 'sorting.strategy') return 'grouped';
                if (key === 'sorting.emptyLinesBetweenGroups') return true;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                if (key === 'showActivationMessage') return true;
                return defaultValue;
            })
        }),
        onDidOpenTextDocument: vi.fn(),
        onDidChangeTextDocument: vi.fn(),
        onDidSaveTextDocument: vi.fn(),
        onDidCloseTextDocument: vi.fn(),
        textDocuments: [],
        applyEdit: vi.fn().mockResolvedValue(true)
    },
    languages: {
        registerCodeActionsProvider: vi.fn(),
        registerDocumentFormattingEditProvider: vi.fn(),
        createDiagnosticCollection: vi.fn(() => ({
            set: vi.fn(),
            delete: vi.fn(),
            clear: vi.fn(),
            dispose: vi.fn()
        }))
    },
    Range: class {
        constructor(
            public start: { line: number; character: number },
            public end: { line: number; character: number }
        ) { }
    },
    Position: class {
        constructor(public line: number, public character: number) { }
    },
    DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    TextEdit: { replace: vi.fn((range, newText) => ({ range, newText })) },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })
    },
    Diagnostic: class {
        constructor(
            public range: any,
            public message: string,
            public severity: number
        ) { }
        source: string = '';
        code: string = '';
    }
}));

// Apply mocks
vi.mock('fs', () => mockFS);
vi.mock('stylelint', () => mockStylelint);
vi.mock('vscode', () => mockVSCode);

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode';
import { sortCssProperties } from '../../src/sorting';
import { getSortingOptions } from '../../src/utils';
import { getDocumentSortingOptions } from '../../src/config-loader';

describe('Project-Level Configuration Integration Tests', () => {
    const tempDir = path.join(os.tmpdir(), `oldschool-test-${Date.now()}`);
    let testFilePath: string;

    beforeEach(() => {
        // Reset all mocks
        vi.resetAllMocks();

        testFilePath = path.join(tempDir, 'style.css');

        // Setup base mock for file existence
        mockFS.existsSync.mockReturnValue(true);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should respect project-level alphabetical sorting strategy over VS Code settings', async () => {
        // Mock file system for project config
        const configPath = path.join(tempDir, '.stylelintrc.json');
        mockFS.existsSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return true;
            return false;
        });

        // Define a project config with alphabetical strategy
        const projectConfig = JSON.stringify({
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'plugin/oldschool-order': [true, { strategy: 'alphabetical' }]
            }
        });

        // Return the project config when readFileSync is called
        mockFS.readFileSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return projectConfig;
            return '';
        });

        // Create a mock document
        const mockDocument = {
            languageId: 'css',
            getText: () => '.foo { z-index: 1; background: red; color: blue; display: block; }',
            uri: { fsPath: testFilePath, scheme: 'file' },
            lineCount: 1,
            lineAt: (line: number) => ({ text: '.foo { z-index: 1; background: red; color: blue; display: block; }' }),
            fileName: testFilePath
        };

        // Create a mock editor
        const mockEditor = {
            document: mockDocument,
            selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Set as active editor
        vscode.window.activeTextEditor = mockEditor as any;

        // Check config loading logic
        const config = getDocumentSortingOptions(mockDocument as any);
        expect(config.source).toBe(ConfigSource.PROJECT);
        expect(config.options.strategy).toBe('alphabetical');

        // Call sort function
        await sortCssProperties(mockEditor as any);

        // Verify that workspace.applyEdit was called (indicating sorting took place)
        expect(vscode.workspace.applyEdit).toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });

    it('should respect VS Code settings when no project config exists', async () => {
        // Setup VS Code settings for concentric strategy
        vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
            get: vi.fn().mockImplementation((key: string, defaultValue: any) => {
                if (key === 'sorting.strategy') return 'concentric';
                if (key === 'sorting.emptyLinesBetweenGroups') return true;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                return defaultValue;
            })
        });

        // No stylelint config files exist in project
        mockFS.existsSync.mockReturnValue(false);

        // Create mock document in a folder with no project config
        const noConfigFilePath = path.join(tempDir, 'no-config', 'style.css');
        const mockDocument = {
            languageId: 'css',
            getText: () => '.foo { color: red; display: block; }',
            uri: { fsPath: noConfigFilePath, scheme: 'file' },
            lineCount: 1,
            lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
            fileName: noConfigFilePath
        };

        // Verify config loading logic
        const config = getDocumentSortingOptions(mockDocument as any);
        expect(config.source).toBe(ConfigSource.VSCODE);
        expect(config.options.strategy).toBe('concentric');

        // Create a mock editor
        const mockEditor = {
            document: mockDocument,
            selection: { isEmpty: true },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Set as active editor
        vscode.window.activeTextEditor = mockEditor as any;

        // Call sort function
        await sortCssProperties(mockEditor as any);

        // Verify workspace.applyEdit was called with VS Code settings
        expect(vscode.workspace.applyEdit).toHaveBeenCalled();
    });

    it('should handle errors gracefully when config file exists but is invalid', async () => {
        // Mock an invalid project config file
        const configPath = path.join(tempDir, '.stylelintrc.json');
        mockFS.existsSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return true;
            return false;
        });

        // Return invalid JSON when readFileSync is called
        mockFS.readFileSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return `{ 
        "plugins": ["stylelint-oldschool-order"],
        "rules": {
          plugin/oldschool-order": [true, { "strategy": "alphabetical" }]
        }
      }`;  // Note the missing quote before plugin
            return '';
        });

        // Create mock document
        const mockDocument = {
            languageId: 'css',
            getText: () => '.foo { color: red; display: block; }',
            uri: { fsPath: testFilePath, scheme: 'file' },
            lineCount: 1,
            lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
            fileName: testFilePath
        };

        // Should fall back to VS Code settings when project config is invalid
        const config = getDocumentSortingOptions(mockDocument as any);
        expect(config.source).toBe(ConfigSource.VSCODE);

        // Create a mock editor
        const mockEditor = {
            document: mockDocument,
            selection: { isEmpty: true },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Set as active editor
        vscode.window.activeTextEditor = mockEditor as any;

        // Should not throw an error when sorting
        await expect(sortCssProperties(mockEditor as any)).resolves.not.toThrow();
    });

    it('should provide information about what configuration source is being used', async () => {
        // Mock file system for project config
        const configDir = path.join(tempDir, 'with-config');
        const configPath = path.join(configDir, '.stylelintrc.json');

        mockFS.existsSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return true;
            return false;
        });

        // Create valid config file
        const projectConfig = JSON.stringify({
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'plugin/oldschool-order': [true, { strategy: 'alphabetical' }]
            }
        });

        // Return valid config
        mockFS.readFileSync.mockImplementation((filePath: string) => {
            if (filePath === configPath) return projectConfig;
            return '';
        });

        // Create mock document in the config folder
        const testFilePath = path.join(configDir, 'style.css');
        const mockDocument = {
            languageId: 'css',
            getText: () => '.foo { color: red; display: block; }',
            uri: { fsPath: testFilePath, scheme: 'file' },
            lineCount: 1,
            lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
            fileName: testFilePath
        };

        // Verify that config source info is provided
        const configResult = getDocumentSortingOptions(mockDocument as any);
        expect(configResult.source).toBe(ConfigSource.PROJECT);
        expect(configResult.configPath).toBe(configPath);
    });
});
