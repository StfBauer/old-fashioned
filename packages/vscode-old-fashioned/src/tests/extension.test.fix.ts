/**
 * Fixed Extension Test Suite
 * 
 * Tests for the VS Code extension functionality with proper mock organization
 */

// Import vi first for mocking
import { vi } from 'vitest';

// Mock stylelint with hoisting to prevent circular dependencies
const mockStylelint = vi.hoisted(() => ({
    default: {
        lint: vi.fn().mockResolvedValue({
            results: [{ warnings: [] }],
            output: 'sorted-css'
        })
    }
}));
vi.mock('stylelint', () => mockStylelint);

// Mock VS Code APIs directly
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: undefined,
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        withProgress: vi.fn((options: any, task: any) => task())
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
        onDidCloseTextDocument: vi.fn(), // Add missing event handler
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
    },
    TextEdit: { replace: vi.fn((range, newText) => ({ range, newText })) }
}));

// Mock the extension module
const mockExtension = {
    activate: vi.fn(),
    deactivate: vi.fn()
};
vi.mock('../extension', () => mockExtension);

// Mock fs module
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { sortCssProperties } from '../sorting';
import { getSortingOptions, getParseSyntax, createDiagnosticFromWarning } from '../utils';
import { resetAllMocks } from './test-utils';

describe('Extension Tests', () => {
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
            mockExtension.activate(context);

            // Verify commands and providers were registered
            expect(vscode.commands.registerCommand).toHaveBeenCalled();
            expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalled();
        });
    });

    describe('sortCssProperties', () => {
        it('should show an error message when no active editor', async () => {
            // Set activeTextEditor to undefined as expected by the VS Code API
            vscode.window.activeTextEditor = undefined;

            // Call the function with undefined cast to any to avoid type error
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
                    lineAt: () => ({ text: '.foo { color: red; display: block; }' })
                },
                selection: { isEmpty: true },
                edit: vi.fn().mockResolvedValue(true)
            };

            // Set up the editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call the function with proper type assertion
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify that progress indicator was shown
            expect(vscode.window.withProgress).toHaveBeenCalled();
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
            // Create a mock editor
            const mockEditor = {
                document: {
                    languageId: 'css',
                    getText: () => '.foo { color: red; display: block; }',
                    uri: { fsPath: '/test/style.css', scheme: 'file' },
                    lineCount: 1,
                    lineAt: () => ({ text: '.foo { color: red; display: block; }' })
                },
                selection: { isEmpty: true },
                edit: vi.fn().mockResolvedValue(true)
            };

            // Set it as active editor
            vscode.window.activeTextEditor = mockEditor as any;

            // Call sort function with the proper type assertion
            await sortCssProperties(vscode.window.activeTextEditor as any);

            // Verify stylelint was called
            expect(mockStylelint.default.lint).toHaveBeenCalled();
        });
    });
});
