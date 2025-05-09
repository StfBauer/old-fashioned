/**
 * Improved Extension Tests
 * 
 * This file uses the improved pattern for mocking VS Code APIs
 * to avoid circular dependencies in tests.
 */

// Setup mocks FIRST before any imports
import { vi } from 'vitest';

// Mock VS Code first to avoid the initialization error
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
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
    DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
    Position: class {
        constructor(public line: number, public character: number) { }
    },
    Range: class {
        constructor(
            public start: { line: number; character: number },
            public end: { line: number; character: number }
        ) { }
    },
    Selection: class {
        constructor(
            public anchor: { line: number; character: number },
            public active: { line: number; character: number }
        ) { }
    },
    TextEdit: { replace: vi.fn((range, newText) => ({ range, newText })) },
    Diagnostic: class {
        constructor(
            public range: any,
            public message: string,
            public severity: number
        ) {
            this.source = '';
            this.code = '';
        }
        source: string;
        code: string;
    }
}));

// Mock the extension module
vi.mock('../extension', () => ({
    activate: vi.fn(),
    deactivate: vi.fn()
}));

// Mock stylelint
vi.mock('stylelint', () => ({
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
}));

// Mock fs module
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// NOW we can import the modules
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sortCssProperties } from '../sorting';
import { getSortingOptions, getParseSyntax, createDiagnosticFromWarning } from '../utils';
import * as vscode from 'vscode';
import * as stylelint from 'stylelint';

describe('Improved Extension Tests', () => {
    let context: any;

    beforeEach(() => {
        // Create a mock context object compatible with the extension's expectations
        context = { subscriptions: [] };

        // Reset all mocks
        vi.resetAllMocks();
    });

    describe('sortCssProperties', () => {
        it('should show error when no active editor', async () => {
            // Set activeTextEditor to undefined
            vscode.window.activeTextEditor = undefined;

            await sortCssProperties(vscode.window.activeTextEditor as any);

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor found');
        });

        it('should sort CSS properties when editor available', async () => {
            const cssContent = '.test { color: red; display: block; }';

            // Setup mock editor directly
            vscode.window.activeTextEditor = {
                document: {
                    languageId: 'css',
                    getText: () => cssContent,
                    uri: {
                        scheme: 'file',
                        fsPath: '/test.css',
                        toString: () => 'file:///test.css'
                    },
                    fileName: '/test.css',
                    lineAt: (line: number) => ({
                        text: cssContent.split('\n')[line] || ''
                    }),
                    lineCount: cssContent.split('\n').length
                },
                selection: { isEmpty: true },
                edit: vi.fn().mockResolvedValue(true)
            } as any;

            // Setup VS Code settings
            vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
                get: (key: string, defaultValue: any) => {
                    if (key === 'sorting.strategy') return 'grouped';
                    if (key === 'sorting.emptyLinesBetweenGroups') return true;
                    if (key === 'sorting.sortPropertiesWithinGroups') return true;
                    return defaultValue;
                }
            });

            await sortCssProperties(vscode.window.activeTextEditor as any);

            expect(vscode.window.withProgress).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
            expect(stylelint.default.lint).toHaveBeenCalled();
        });
    });

    describe('utils', () => {
        it('should return correct parse syntax for CSS', () => {
            expect(getParseSyntax('css')).toBe('css');
        });

        it('should return correct parse syntax for SCSS', () => {
            expect(getParseSyntax('scss')).toBe('scss');
        });

        it('should return correct parse syntax for SASS', () => {
            expect(getParseSyntax('sass')).toBe('sass');
        });

        it('should return default sorting options', () => {
            const options = getSortingOptions();
            expect(options.strategy).toBe('grouped');
            expect(options.emptyLinesBetweenGroups).toBe(true);
            expect(options.sortPropertiesWithinGroups).toBe(true);
        });

        it('should create a diagnostic from a warning', () => {
            const warning = {
                line: 1,
                column: 1,
                text: 'Properties should be sorted',
                rule: 'plugin/oldschool-order',
                severity: 'warning'
            };

            const document = {
                lineAt: vi.fn().mockReturnValue({ text: 'color: red;' })
            };

            const diagnostic = createDiagnosticFromWarning(warning, document as any);

            expect(diagnostic).toBeDefined();
            expect(diagnostic.source).toBe('old-fashioned');
            expect(diagnostic.code).toBe('plugin/oldschool-order');
        });
    });
});
