vi.mock('stylelint', () => {
    const lint = vi.fn().mockResolvedValue({
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
    });
    return {
        default: { lint },
        lint
    };
});
import { vi } from 'vitest';
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: null,
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
            get: (key, defaultValue) => defaultValue
        })),
        onDidOpenTextDocument: vi.fn(),
        onDidChangeTextDocument: vi.fn(),
        onDidSaveTextDocument: vi.fn(),
        textDocuments: [],
        applyEdit: vi.fn(), // <-- ensure this is always a spy
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
        file: (path) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })
    },
    Range: class {
        start: any;
        end: any;
        constructor(startLine: number, startChar: number, endLine: number, endChar: number) {
            this.start = { line: startLine, character: startChar };
            this.end = { line: endLine, character: endChar };
        }
    }
}));
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { sortCssProperties } from '../../src/sorting';
import { ConfigSource, getDocumentSortingOptions } from '../../src/config-loader';
import * as stylelint from 'stylelint';

// Mock filesystem operations
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Utility functions for tests (simplified to avoid circular dependencies)
function createTestDocument(options: { languageId: string; content: string; uri: string }) {
    const lines = options.content.split('\n');
    return {
        languageId: options.languageId,
        getText: (range?: any) => {
            if (range) {
                console.log('DEBUG: getText called with range', range);
                return options.content;
            }
            console.log('DEBUG: getText called without range');
            return options.content;
        },
        uri: typeof options.uri === 'string'
            ? { scheme: 'file', fsPath: options.uri.replace('file://', ''), toString: () => options.uri }
            : options.uri,
        lineAt: (line: number) => {
            return { text: lines[line] || '' };
        },
        lineCount: lines.length,
        version: 1,
        eol: 1, // EndOfLine.LF
        save: () => Promise.resolve(),
        isUntitled: false,
        isClosed: false,
        validateRange: (range) => range,
        fileName: typeof options.uri === 'string' ? options.uri.replace('file://', '') : '',
    };
}

describe('Project-Level Configuration Integration Tests', () => {
    // Setup temporary directory for tests
    const tempDir = path.join(os.tmpdir(), `oldschool-test-${Date.now()}`);

    beforeEach(() => {
        vi.clearAllMocks();
        vscode.window.activeTextEditor = undefined;
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
      color: red;
      width: 100px;
      background: blue;
      animation: fade 1s;
    }`,
            uri: `file://${tempDir}/style.css`
        }) as any;

        document.lineAt = (line: number) => {
            const lines = document.getText().split('\n');
            return { text: lines[line] || '' };
        };

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: { ...document, isDirty: true, fileName: document.uri.fsPath },
            selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            edit: vi.fn((callback) => {
                if (typeof callback === 'function') callback();
                return Promise.resolve(true);
            })
        } as any;

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

        // Add this at the top for debug
        console.log('DEBUG: test started');

        // Call function under test
        console.log('DEBUG: before sortCssProperties');
        await sortCssProperties(vscode.window.activeTextEditor as any);
        console.log('DEBUG: after sortCssProperties');

        // Debug: print applyEdit and info message calls
        console.log('DEBUG: applyEdit calls', (vscode.workspace.applyEdit as any).mock.calls.length);
        const infoCalls = (vscode.window.showInformationMessage as any).mock.calls;
        const messages = infoCalls.map((call: any[]) => call[0]);
        console.log('DEBUG: info messages', messages);
        expect(messages).toContainEqual(
            expect.stringMatching(/CSS properties (sorted successfully|are already properly sorted)/)
        );
    });

    it('should respect VS Code settings when no project config exists', async () => {
        // Setup mock fs with no config file
        vi.mocked(fs.existsSync).mockReturnValue(false);

        // Create test document
        const document = createTestDocument({
            languageId: 'css',
            content: `.element {
          color: red;
          width: 100px;
          background: blue;
          animation: fade 1s;
        }`,
            uri: `file://${tempDir}/style.css`
        }) as any;

        document.lineAt = (line: number) => {
            const lines = document.getText().split('\n');
            return { text: lines[line] || '' };
        };

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: { ...document, isDirty: true, fileName: document.uri.fsPath },
            selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            edit: vi.fn((callback) => {
                if (typeof callback === 'function') callback();
                return Promise.resolve(true);
            })
        } as any;

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

        // Add this at the top for debug
        console.log('DEBUG: test started');

        // Call function under test
        console.log('DEBUG: before sortCssProperties');
        await sortCssProperties(vscode.window.activeTextEditor as any);
        console.log('DEBUG: after sortCssProperties');

        // Debug: print applyEdit and info message calls
        console.log('DEBUG: applyEdit calls', (vscode.workspace.applyEdit as any).mock.calls.length);
        const infoCalls = (vscode.window.showInformationMessage as any).mock.calls;
        const messages = infoCalls.map((call: any[]) => call[0]);
        console.log('DEBUG: info messages', messages);
        expect(messages).toContainEqual(
            expect.stringMatching(/CSS properties (sorted successfully|are already properly sorted)/)
        );
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
          color: red;
          width: 100px;
          background: blue;
          animation: fade 1s;
        }`,
            uri: `file://${tempDir}/style.css`
        }) as any;

        document.lineAt = (line: number) => {
            const lines = document.getText().split('\n');
            return { text: lines[line] || '' };
        };

        // Set up the active editor
        vscode.window.activeTextEditor = {
            document: { ...document, isDirty: true, fileName: document.uri.fsPath },
            selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            edit: vi.fn((callback) => {
                if (typeof callback === 'function') callback();
                return Promise.resolve(true);
            })
        } as any;

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
