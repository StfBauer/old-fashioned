/**
 * VS Code Mock Module
 * 
 * A consistent mock for the VS Code module used across all tests
 */

import { vi } from 'vitest';

// Create basic VS Code mock
const vscode = {
    window: {
        activeTextEditor: undefined,
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        withProgress: vi.fn((options, task) => task())
    },
    commands: {
        registerCommand: vi.fn().mockImplementation((command, callback) => {
            return { dispose: vi.fn() }; // Return a disposable object
        }),
        executeCommand: vi.fn().mockImplementation((command, ...args) => {
            // Mock implementation for editor.action.formatDocument
            if (command === 'editor.action.formatDocument') {
                console.log('Mocking format document command');
                return Promise.resolve(true);
            }
            return Promise.resolve();
        })
    },
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: vi.fn((key, defaultValue) => {
                if (key === 'oldFashioned.sorting.strategy') return 'grouped';
                if (key === 'sorting.strategy') return 'grouped';
                if (key === 'oldFashioned.sorting.emptyLinesBetweenGroups') return true;
                if (key === 'sorting.emptyLinesBetweenGroups') return true;
                if (key === 'oldFashioned.sorting.sortPropertiesWithinGroups') return true;
                if (key === 'sorting.sortPropertiesWithinGroups') return true;
                return defaultValue;
            })
        })),
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
    CancellationTokenSource: class {
        token = { isCancellationRequested: false };
        cancel() { this.token.isCancellationRequested = true; }
        dispose() { }
    },
    Range: class {
        constructor(
            public startLine: number,
            public startChar: number,
            public endLine: number,
            public endChar: number
        ) { }
    },
    Position: class {
        constructor(public line: number, public character: number) { }
    },
    Selection: class {
        constructor(public anchor: any, public active: any) { }
        isEmpty = false;
    },
    CodeAction: class {
        constructor(public title: string, public kind: any) { }
        command: any = undefined;
    },
    CodeActionKind: {
        QuickFix: 'quickfix'
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
    },
    Diagnostic: class {
        constructor(public range: any, public message: string, public severity: number) { }
        source: string = '';
        code: string = '';
    },
    TextEdit: {
        replace: vi.fn((range, text) => ({ range, newText: text }))
    },
    WorkspaceEdit: class {
        replace = vi.fn();
        constructor() { }
    },
    ProgressLocation: {
        Notification: 1,
        Window: 2,
        Notification2: 3,
        Editor: 4
    },
    ProgressOptions: class {
        constructor(public location: any, public title: string) { }
    },
    ExtensionContext: class {
        subscriptions: any[] = [];
        extensionPath: string = '/path/to/extension';
        extensionUri = {
            scheme: 'file',
            fsPath: '/path/to/extension',
            toString: () => 'file:///path/to/extension'
        };
        storageUri = {
            scheme: 'file',
            fsPath: '/path/to/storage',
            toString: () => 'file:///path/to/storage'
        };
        asAbsolutePath(relativePath: string) {
            return `/path/to/extension/${relativePath}`;
        }
    },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` }),
        parse: (uri: string) => ({ scheme: uri.split(':')[0], fsPath: uri.replace(/^file:\/\//, '') })
    }
};

// Export specific constants and enums as named exports
// This makes them available for direct import
export const ProgressLocation = vscode.ProgressLocation;
export const Position = vscode.Position;
export const Range = vscode.Range;
export const Selection = vscode.Selection;
export const DiagnosticSeverity = vscode.DiagnosticSeverity;
export const CodeActionKind = vscode.CodeActionKind;

// Export the entire mock as default
export default vscode;
