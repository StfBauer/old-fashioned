/**
 * VS Code Extension Tests - Fixed Version
 * 
 * Tests for the VS Code extension functionality with proper mock organization
 * to avoid circular dependencies
 */

// Import vi first for mocking
import { vi } from 'vitest';

// Define mocks with hoisting to prevent initialization errors
const mockStylelint = vi.hoisted(() => ({
    default: {
        lint: vi.fn().mockResolvedValue({
            results: [{ warnings: [] }],
            output: 'sorted-css'
        })
    }
}));

// Apply mocks
vi.mock('stylelint', () => mockStylelint);

// Mock VS Code APIs directly to avoid circular dependencies
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined, // Use undefined instead of null for activeTextEditor
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

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { sortCssProperties } from '../../src/sorting';
import { getSortingOptions, getParseSyntax, createDiagnosticFromWarning } from '../../src/utils';
import { VSCodeMockBuilder, FileSystemMockBuilder, resetAllMocks } from './test-utils';
import { activate } from '../../src/extension';

describe('VS Code extension', () => {
    let context: any;

    beforeEach(() => {
        resetAllMocks();
        context = { subscriptions: [] };
    });

    afterEach(() => {
        resetAllMocks();
    });

    describe('activate', () => {
        it('should register commands and providers', () => {
            // Call activate function
            activate(context);

            // Verify commands and providers were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalled();
            expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalled();
        });
    });

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

            // Reset the mocks for this test
            vscode.window.withProgress = vi.fn((options: any, task: any) => task());
            mockStylelint.default.lint.mockClear();

            // Set up the editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call the function
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify that progress indicator was shown
            expect(vscode.window.withProgress).toHaveBeenCalled();

            // Verify stylelint was called
            expect(mockStylelint.default.lint).toHaveBeenCalled();
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
            // Setup proper config mock for this test
            vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
                get: (key: string, defaultValue: any) => defaultValue
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
        });
    });

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

            // Reset the withProgress mock to verify it's called
            vscode.window.withProgress = vi.fn((options: any, task: any) => task());

            // Call sort function with the proper type cast
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify stylelint was called
            expect(mockStylelint.default.lint).toHaveBeenCalled();

            // Verify progress was shown
            expect(vscode.window.withProgress).toHaveBeenCalled();
        });
    });
});
