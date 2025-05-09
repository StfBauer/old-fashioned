/**
 * Config Integration Tests
 * 
 * Integration tests for project-level stylelint configuration handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { sortCssProperties } from '../sorting';
import { ConfigSource, getDocumentSortingOptions } from '../config-loader';

// Mock filesystem operations
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Mock VS Code APIs directly to avoid circular dependencies
const vscode = {
    window: {
        activeTextEditor: null as any, // Use any type to avoid type conflicts when assigning editors
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        withProgress: vi.fn((options, task) => task())
    },
    commands: {
        registerCommand: vi.fn(),
        executeCommand: vi.fn()
    },
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: (key: string, defaultValue: any) => defaultValue
        })),
        onDidOpenTextDocument: vi.fn(),
        onDidChangeTextDocument: vi.fn(),
        onDidSaveTextDocument: vi.fn(),
        textDocuments: [],
        applyEdit: vi.fn()
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
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })
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
    TextEdit: { replace: vi.fn((range, newText) => ({ range, newText })) }
};

vi.mock('vscode', () => vscode);

// Mock stylelint
const mockStylelint = {
    default: {
        lint: vi.fn().mockResolvedValue({
            output: 'sorted-css',
            results: [
                {
                    warnings: [
                        {
                            line: 1,
                            column: 1,
                            rule: 'plugin/oldschool-order',
                            severity: 'warning',
                            text: 'Expected order to be: display, width, color'
                        }
                    ]
                }
            ]
        })
    }
};

vi.mock('stylelint', () => mockStylelint);

// Utility functions for tests (simplified to avoid circular dependencies)
function createTestDocument(options: { languageId: string; content: string; uri: string }) {
    return {
        languageId: options.languageId,
        getText: () => options.content,
        uri: typeof options.uri === 'string'
            ? { scheme: 'file', fsPath: options.uri.replace('file://', ''), toString: () => options.uri }
            : options.uri
    };
}

describe('Project-Level Configuration Integration Tests', () => {
    // Setup temporary directory for tests
    const tempDir = path.join(os.tmpdir(), `oldschool-test-${Date.now()}`);

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Reset vscode mock state
        vscode.window.activeTextEditor = null;
        vscode.window.showErrorMessage.mockReset();
        vscode.window.showInformationMessage.mockReset();
        mockStylelint.default.lint.mockClear();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should respect project-level alphabetical sorting strategy over VS Code settings', async () => {
        // Setup mock for fs.existsSync
        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return String(path).includes(`${tempDir}/.stylelintrc.json`);
        });

        // Setup mock for fs.readFileSync
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'oldschool/order': [true, { strategy: 'alphabetical' }]
            }
        }));

        // Create test document
        const document = createTestDocument({
            languageId: 'css',
            content: `.element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }`,
            uri: `file://${tempDir}/style.css`
        });

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: document as any,
            selection: { isEmpty: true },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Setup VS Code settings that should be overridden
        vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
            get: (key: string) => {
                if (key === 'sorting.strategy') return 'concentric'; // This should be overridden by project config
                if (key === 'sorting.emptyLinesBetweenGroups') return true;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                return undefined;
            }
        });

        // First, check the detected config source directly
        const config = getDocumentSortingOptions(document as any);
        expect(config.source).toBe(ConfigSource.PROJECT);
        expect(config.options.strategy).toBe('alphabetical');

        // Call function under test
        await sortCssProperties(vscode.window.activeTextEditor as any);

        // Verify that stylelint was called (indicating sorting took place)
        expect(mockStylelint.default.lint).toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });

    it('should respect VS Code settings when no project config exists', async () => {
        // Setup mock fs with no config file
        vi.mocked(fs.existsSync).mockReturnValue(false);

        // Create test document
        const document = createTestDocument({
            languageId: 'css',
            content: `.element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }`,
            uri: `file://${tempDir}/style.css`
        });

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: document as any,
            selection: { isEmpty: true },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Setup custom VS Code settings
        vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
            get: (key: string) => {
                if (key === 'sorting.strategy') return 'concentric';
                if (key === 'sorting.emptyLinesBetweenGroups') return false;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                return undefined;
            }
        });

        // First, check the detected config source directly
        const config = getDocumentSortingOptions(document as any);
        expect(config.source).toBe(ConfigSource.VSCODE);
        expect(config.options.strategy).toBe('concentric');

        // Call function under test
        await sortCssProperties(vscode.window.activeTextEditor as any);

        // Verify sorting was performed
        expect(mockStylelint.default.lint).toHaveBeenCalled();
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });

    it('should handle errors gracefully when config file exists but is invalid', async () => {
        // Setup mock for invalid config
        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return String(path).includes(`${tempDir}/.stylelintrc.json`);
        });

        // Return an invalid JSON string
        vi.mocked(fs.readFileSync).mockReturnValueOnce(`{
            "plugins": ["stylelint-oldschool-order"],
            "rules": {
                "oldschool/order": [true, { "strategy": "alphabetical" }],
                // Invalid JSON - missing closing brace
            `);

        // Create test document
        const document = createTestDocument({
            languageId: 'css',
            content: `.element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }`,
            uri: `file://${tempDir}/style.css`
        });

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: document as any,
            selection: { isEmpty: true },
            edit: vi.fn().mockResolvedValue(true)
        };

        // Setup fallback VS Code settings
        vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
            get: (key: string) => {
                if (key === 'sorting.strategy') return 'grouped';
                if (key === 'sorting.emptyLinesBetweenGroups') return true;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                return undefined;
            }
        });

        // First, check the detected config
        const config = getDocumentSortingOptions(document as any);

        // Should fall back to VS Code settings when there's a parsing error
        expect(config.source).toBe(ConfigSource.VSCODE);

        // Sort properties should still work using fallback settings
        await sortCssProperties(vscode.window.activeTextEditor as any);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });

    it('should provide information about what configuration source is being used', () => {
        // Setup mock for different config file locations
        vi.mocked(fs.existsSync).mockImplementation((path) => {
            return String(path).includes(`${tempDir}/with-config/.stylelintrc.json`);
        });

        // Return a valid config
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'oldschool/order': [true, { strategy: 'alphabetical' }]
            }
        }));

        // Create documents in different locations
        const docWithConfig = createTestDocument({
            languageId: 'css',
            content: '.test {}',
            uri: `file://${tempDir}/with-config/style.css`
        });

        const docWithoutConfig = createTestDocument({
            languageId: 'css',
            content: '.test {}',
            uri: `file://${tempDir}/no-config/style.css`
        });

        // Check config source for document with project config
        const resultWithConfig = getDocumentSortingOptions(docWithConfig as any);
        expect(resultWithConfig.source).toBe(ConfigSource.PROJECT);
        expect(resultWithConfig.configPath).toContain('with-config/.stylelintrc.json');

        // Check config source for document without project config
        const resultWithoutConfig = getDocumentSortingOptions(docWithoutConfig as any);
        expect(resultWithoutConfig.source).toBe(ConfigSource.VSCODE);
    });
});
