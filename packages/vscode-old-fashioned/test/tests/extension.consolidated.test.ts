/**
 * VS Code Extension Tests - Consolidated Version
 * 
 * This is the main test file for the VS Code extension, consolidating the best practices
 * from the different test approaches (fixed, improved, etc.).
 */

// Import vi first for mocking
import { vi } from 'vitest';  // Define mocks with hoisting to prevent initialization errors
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
        withProgress: vi.fn().mockImplementation((options, task) => {
            // Actually execute the task to ensure associated code runs
            return task();
        })
    },
    commands: {
        registerCommand: vi.fn(),
        executeCommand: vi.fn()
    },
    workspace: {
        getConfiguration: vi.fn().mockImplementation((section) => {
            // Return appropriate config object based on section
            if (section === 'oldFashioned') {
                return {
                    get: vi.fn().mockImplementation((key: string, defaultValue: any) => {
                        if (key === 'showActivationMessage') return true;
                        return defaultValue;
                    })
                };
            }

            // Default for other sections
            return {
                get: vi.fn().mockImplementation((key: string, defaultValue: any) => {
                    if (key === 'sorting.strategy') return 'grouped';
                    if (key === 'sorting.emptyLinesBetweenGroups') return true;
                    if (key === 'sorting.sortPropertiesWithinGroups') return true;
                    return defaultValue;
                })
            };
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
vi.mock('stylelint', () => mockStylelint);
vi.mock('vscode', () => mockVSCode);

// Mock fs module for config tests
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { sortCssProperties } from '../../src/sorting';
import { getSortingOptions, getParseSyntax, createDiagnosticFromWarning } from '../../src/utils';
import { resetAllMocks } from './test-utils';
import { activate } from '../../src/extension';

describe('VS Code extension', () => {
    let context: any;

    beforeEach(() => {
        resetAllMocks();
        context = { subscriptions: [] };

        // Reset specific mocks we need to test
        mockVSCode.window.withProgress.mockClear();
        mockStylelint.default.lint.mockClear();
    });

    afterEach(() => {
        resetAllMocks();
    });

    // GROUP 1: Extension Activation Tests
    describe('activate', () => {
        it('should register commands and providers', () => {
            // Call activate function
            activate(context);

            // Verify commands and providers were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'old-fashioned.sortProperties',
                expect.any(Function)
            );
            expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalled();
        });

        it('should show activation message based on configuration', () => {
            // Call activate function
            activate(context);

            // By default the showActivationMessage is true in our mock
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Old Fashioned CSS Sorter is now active')
            );
        });
    });

    // GROUP 2: CSS Property Sorting Tests
    describe('sortCssProperties', () => {
        it('should show an error message when no active editor', async () => {
            // Set activeTextEditor to undefined as expected by the type
            vscode.window.activeTextEditor = undefined;

            // Call the function with undefined, cast to any to avoid type error
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify that an error message was shown
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('No active editor')
            );
        });

        it('should run sorting operation with progress indicator', async () => {
            // Setup vscode mock with settings and editor
            const mockEditor = {
                document: {
                    languageId: 'css',
                    getText: () => '.foo { color: red; display: block; }',
                    uri: { fsPath: '/test/style.css', scheme: 'file' },
                    lineCount: 1,
                    lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
                    fileName: '/test/style.css'
                },
                selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                edit: vi.fn().mockResolvedValue(true)
            };

            // Set up the editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call the function
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify that progress indicator was shown
            expect(vscode.window.withProgress).toHaveBeenCalled();

            // Verify stylelint was called
            expect(mockStylelint.default.lint).toHaveBeenCalled();
        });

        it('should show an error message for non-CSS files', async () => {
            // Setup mock for a non-CSS file
            const mockEditor = {
                document: {
                    languageId: 'javascript',
                    getText: () => 'const foo = "bar";',
                    uri: { fsPath: '/test/script.js', scheme: 'file' },
                    fileName: '/test/script.js'
                },
                selection: { isEmpty: true }
            };

            // Set as active editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call the function
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify error was shown
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('only works on CSS, SCSS, or SASS')
            );
        });
    });

    // GROUP 3: Utility Function Tests
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
            // Setup proper configuration mock for this specific test
            mockVSCode.workspace.getConfiguration.mockReturnValue({
                get: vi.fn((key: string, defaultValue: any) => defaultValue)
            });

            // Test with default (empty) settings
            const options = getSortingOptions();
            expect(options).toBeDefined();
            expect(options.strategy).toBe('grouped');
            expect(options.emptyLinesBetweenGroups).toBe(true);
        });

        it('should create diagnostic from stylelint warning', () => {
            const warning = {
                line: 2,
                column: 3,
                rule: 'test-rule',
                text: 'Test warning',
                severity: 'warning'
            };

            // Create a mock document instead of a range
            const mockDocument = {
                lineAt: (line: number) => ({ text: 'color: red;' }),
                uri: { fsPath: '/test/style.css', scheme: 'file' },
                fileName: '/test/style.css',
                languageId: 'css'
            };

            const diagnostic = createDiagnosticFromWarning(warning, mockDocument as any);

            expect(diagnostic).toBeDefined();
            expect(diagnostic.source).toBe('old-fashioned');
            expect(diagnostic.code).toBe('test-rule');
        });
    });

    // GROUP 4: Sorting Implementation Tests 
    describe('sorting', () => {
        it('should call stylelint to perform sorting', async () => {
            // Create a more complete mock editor
            const mockEditor = {
                document: {
                    languageId: 'css',
                    getText: () => '.foo { color: red; display: block; }',
                    uri: { fsPath: '/test/style.css', scheme: 'file' },
                    lineCount: 1,
                    lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
                    fileName: '/test/style.css'
                },
                selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                edit: vi.fn().mockResolvedValue(true)
            };

            // Set it as active editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call sort function with the proper type cast
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify stylelint was called
            expect(mockStylelint.default.lint).toHaveBeenCalled();

            // Verify progress was shown
            expect(vscode.window.withProgress).toHaveBeenCalled();
        });

        it('should show success message when sorting completes', async () => {
            // Create a mock editor
            const mockEditor = {
                document: {
                    languageId: 'css',
                    getText: () => '.foo { color: red; display: block; }',
                    uri: { fsPath: '/test/style.css', scheme: 'file' },
                    lineCount: 1,
                    lineAt: (line: number) => ({ text: '.foo { color: red; display: block; }' }),
                    fileName: '/test/style.css'
                },
                selection: { isEmpty: true, start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                edit: vi.fn().mockResolvedValue(true)
            };

            // Make stylelint mock return different content to simulate changes
            mockStylelint.default.lint.mockResolvedValueOnce({
                results: [{ warnings: [] }],
                output: '.foo { display: block; color: red; }' // Different order
            });

            // Set as active editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call sort function
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify success message
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('CSS properties sorted successfully')
            );
        });
    });
});
