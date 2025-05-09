/**
 * Config Integration Tests - Fixed Version
 * 
 * Integration tests for project-level stylelint configuration handling
 * This version fixes circular dependency issues with proper mock ordering
 */

// Import vi first for mocking
import { vi } from 'vitest';

// Define mocks BEFORE importing modules
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Mock VS Code APIs directly to avoid circular dependencies
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: null as any,
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        withProgress: vi.fn((options: any, task: any) => task())
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
        onDidCloseTextDocument: vi.fn(),
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
}));

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

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { sortCssProperties } from '../sorting';
import { ConfigSource, getDocumentSortingOptions } from '../config-loader';
import { VSCodeMockBuilder, FileSystemMockBuilder, resetAllMocks, createTestDocument, createTestEditor } from './test-utils';

describe('Project-Level Configuration Integration Tests', () => {
    // Setup temporary directory for tests
    const tempDir = path.join(os.tmpdir(), `oldschool-test-${Date.now()}`);
    let fsMock: FileSystemMockBuilder;

    beforeEach(() => {
        // Reset mocks
        resetAllMocks();
        fsMock = new FileSystemMockBuilder();
    });

    afterEach(() => {
        resetAllMocks();
    });

    it('should respect project-level alphabetical sorting strategy over VS Code settings', async () => {
        // Set up mock filesystem with project-level config
        fsMock.addStylelintConfig(`${tempDir}/.stylelintrc.json`, {
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'oldschool/order': [true, { strategy: 'alphabetical' }]
            }
        })
            .addMockFile(`${tempDir}/style.css`, `
        .element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }
        `)
            .build();

        // Create test document and editor
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

        // Set up the VSCode mock with an active editor
        const vscodeMock = new VSCodeMockBuilder()
            .withActiveEditor({
                languageId: 'css',
                content: document.getText(),
                uri: document.uri.toString(),
                fileName: document.uri.fsPath
            })
            .withSettings({
                oldFashioned: {
                    sorting: {
                        strategy: 'concentric', // This should be overridden by project config
                        emptyLinesBetweenGroups: true,
                        sortPropertiesWithinGroups: true
                    }
                }
            })
            .build();

        // Apply the mock
        Object.assign(vscode, vscodeMock);

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
        // Set up mock filesystem without project-level config
        fsMock.addMockFile(`${tempDir}/style.css`, `
        .element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }
        `)
            .build();

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

        // Set up the VSCode mock with custom settings
        const vscodeMock = new VSCodeMockBuilder()
            .withActiveEditor({
                languageId: 'css',
                content: document.getText(),
                uri: document.uri.toString(),
                fileName: document.uri.fsPath
            })
            .withSettings({
                oldFashioned: {
                    sorting: {
                        strategy: 'concentric',
                        emptyLinesBetweenGroups: false,
                        sortPropertiesWithinGroups: true
                    }
                }
            })
            .build();

        // Apply the mock
        Object.assign(vscode, vscodeMock);

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
        // Set up mock filesystem with invalid config
        fsMock.addMockFile(`${tempDir}/.stylelintrc.json`, `{
            "plugins": ["stylelint-oldschool-order"],
            "rules": {
                "oldschool/order": [true, { "strategy": "alphabetical" }],
                // Invalid JSON - missing closing brace
            `)
            .addMockFile(`${tempDir}/style.css`, `.element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }`)
            .build();

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

        // Set up the VSCode mock with fallback settings
        const vscodeMock = new VSCodeMockBuilder()
            .withActiveEditor({
                languageId: 'css',
                content: document.getText(),
                uri: document.uri.toString(),
                fileName: document.uri.fsPath
            })
            .withSettings({
                oldFashioned: {
                    sorting: {
                        strategy: 'grouped', // Default fallback
                        emptyLinesBetweenGroups: true,
                        sortPropertiesWithinGroups: true
                    }
                }
            })
            .build();

        // Apply the mock
        Object.assign(vscode, vscodeMock);

        // First, check the detected config
        const config = getDocumentSortingOptions(document as any);

        // Should fall back to VS Code settings when there's a parsing error
        expect(config.source).toBe(ConfigSource.VSCODE);

        // Sort properties should still work using fallback settings
        await sortCssProperties(vscode.window.activeTextEditor as any);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });

    it('should provide information about what configuration source is being used', () => {
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

        // Setup mock filesystem
        fsMock.addStylelintConfig(`${tempDir}/with-config/.stylelintrc.json`, {
            plugins: ['stylelint-oldschool-order'],
            rules: {
                'oldschool/order': [true, { strategy: 'alphabetical' }]
            }
        }).build();

        // Check config source for document with project config
        const resultWithConfig = getDocumentSortingOptions(docWithConfig as any);
        expect(resultWithConfig.source).toBe(ConfigSource.PROJECT);
        expect(resultWithConfig.configPath).toContain('with-config/.stylelintrc.json');

        // Check config source for document without project config
        const resultWithoutConfig = getDocumentSortingOptions(docWithoutConfig as any);
        expect(resultWithoutConfig.source).toBe(ConfigSource.VSCODE);
    });
});
