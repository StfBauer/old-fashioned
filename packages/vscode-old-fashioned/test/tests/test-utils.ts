/**
 * Test Utilities
 * 
 * This module provides reusable testing utilities for VS Code extension tests,
 * making mocks more consistent and tests more reliable.
 */

import * as vscode from 'vscode';
import { vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type { SortingStrategy } from '@old-fashioned/shared';

/**
 * VS Code Mock Builder - Creates properly typed mock objects for VS Code API
 */
export class VSCodeMockBuilder {
    private mockVSCode: any = {
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
                get: vi.fn((key: string, defaultValue: any) => defaultValue)
            })),
            onDidOpenTextDocument: vi.fn(),
            onDidChangeTextDocument: vi.fn(),
            onDidSaveTextDocument: vi.fn(),
            onDidCloseTextDocument: vi.fn(),
            textDocuments: [] as any[],
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
            Notification: 1
        },
        ExtensionContext: class {
            subscriptions: any[] = [];
        },
        Uri: {
            file: vi.fn((path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })),
            parse: vi.fn((uri: string) => ({ scheme: uri.split(':')[0], fsPath: uri.replace(/^file:\/\//, '') }))
        }
    };

    /**
     * Configures the workspace.getConfiguration mock with custom settings
     */
    withSettings(settings: Record<string, any>): this {
        this.mockVSCode.workspace.getConfiguration = vi.fn(() => ({
            get: vi.fn((key: string, defaultValue: any) => {
                // Support accessing nested properties with dot notation
                const keys = key.split('.');
                let value = settings;

                // Navigate through nested keys
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        return defaultValue;
                    }
                }

                return value !== undefined ? value : defaultValue;
            })
        }));
        return this;
    }

    /**
     * Configures the active editor with custom document content
     */
    withActiveEditor(params: {
        languageId: string;
        content: string;
        uri?: string;
        fileName?: string;
    }): this {
        const lines = params.content.split('\n');
        const uri = params.uri || `file:///test.${params.languageId}`;
        const fileName = params.fileName || `/test.${params.languageId}`;

        this.mockVSCode.window.activeTextEditor = {
            document: {
                languageId: params.languageId,
                getText: vi.fn(() => params.content),
                lineCount: lines.length,
                lineAt: vi.fn((line: number) => ({
                    text: line < lines.length ? lines[line] : '',
                    range: new this.mockVSCode.Range(line, 0, line, lines[line]?.length || 0)
                })),
                uri: {
                    toString: vi.fn(() => uri),
                    scheme: 'file',
                    fsPath: fileName
                },
                fileName: fileName
            },
            selection: {
                isEmpty: true,
                start: new this.mockVSCode.Position(0, 0),
                end: new this.mockVSCode.Position(lines.length, 0)
            },
            edit: vi.fn(async (callback: Function) => {
                callback({ replace: vi.fn() });
                return true;
            })
        };
        return this;
    }

    /**
     * Configures the activeTextEditor with a selection
     */
    withSelection(startLine: number, startChar: number, endLine: number, endChar: number): this {
        if (!this.mockVSCode.window.activeTextEditor) {
            throw new Error('Cannot add selection without an active editor. Call withActiveEditor first.');
        }

        const start = new this.mockVSCode.Position(startLine, startChar);
        const end = new this.mockVSCode.Position(endLine, endChar);

        this.mockVSCode.window.activeTextEditor.selection = {
            isEmpty: startLine === endLine && startChar === endChar,
            start,
            end,
            active: end,
            anchor: start
        };

        return this;
    }

    /**
     * Builds and returns the VS Code mock object
     */
    build(): typeof vscode {
        return this.mockVSCode as typeof vscode;
    }
}

/**
 * File System Mock Builder - Creates consistent file system mocks
 */
export class FileSystemMockBuilder {
    private mockFiles: Record<string, string> = {};
    private existsSyncMock = vi.fn();
    private readFileSyncMock = vi.fn();

    /**
     * Adds a mock file to the virtual filesystem
     */
    addMockFile(filePath: string, content: string): this {
        this.mockFiles[filePath] = content;
        return this;
    }

    /**
     * Adds mock stylelint configuration
     */
    addStylelintConfig(filePath: string, config: {
        plugins?: string[];
        rules?: Record<string, any>;
        extends?: string | string[];
    }): this {
        return this.addMockFile(filePath, JSON.stringify(config, null, 2));
    }

    /**
     * Adds mock package.json with optional stylelint configuration
     */
    addPackageJson(filePath: string, packageContent: {
        name: string;
        stylelint?: {
            plugins?: string[];
            rules?: Record<string, any>;
        };
        [key: string]: any;
    }): this {
        return this.addMockFile(filePath, JSON.stringify(packageContent, null, 2));
    }

    /**
     * Builds and applies mocks to the fs module
     */
    build(): void {
        // Setup existsSync mock
        this.existsSyncMock.mockImplementation((checkPath: string | Buffer) => {
            const normalizedPath = String(checkPath);
            return Object.keys(this.mockFiles).some(path => normalizedPath.includes(path));
        });

        // Setup readFileSync mock
        this.readFileSyncMock.mockImplementation((filePath: string | Buffer, options?: any) => {
            const normalizedPath = String(filePath);
            const matchedPath = Object.keys(this.mockFiles).find(path => normalizedPath.includes(path));

            if (matchedPath) {
                return this.mockFiles[matchedPath];
            }

            throw new Error(`File not found: ${normalizedPath}`);
        });

        // Apply mocks
        vi.mocked(fs.existsSync).mockImplementation(this.existsSyncMock);
        vi.mocked(fs.readFileSync).mockImplementation(this.readFileSyncMock);
    }

    /**
     * Gets the mock files object for inspection
     */
    getMockFiles(): Record<string, string> {
        return { ...this.mockFiles };
    }
}

/**
 * Creates a test document object
 */
export function createTestDocument(params: {
    languageId: string;
    content: string;
    uri: string;
}): vscode.TextDocument {
    const lines = params.content.split('\n');

    return {
        languageId: params.languageId,
        getText: () => params.content,
        lineCount: lines.length,
        lineAt: (line: number) => ({
            text: lines[line] || '',
            range: new vscode.Range(
                new vscode.Position(line, 0),
                new vscode.Position(line, lines[line]?.length || 0)
            )
        }),
        uri: {
            toString: () => params.uri,
            fsPath: params.uri.replace('file://', ''),
            scheme: 'file'
        },
        fileName: params.uri.replace('file://', ''),
        offsetAt: () => 0,
        positionAt: () => new vscode.Position(0, 0),
        getWordRangeAtPosition: () => undefined,
        validateRange: (range: vscode.Range) => range,
        validatePosition: (position: vscode.Position) => position
    } as unknown as vscode.TextDocument;
}

/**
 * Creates a test editor object
 */
export function createTestEditor(document: vscode.TextDocument): vscode.TextEditor {
    return {
        document,
        selection: new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0)),
        selections: [new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))],
        visibleRanges: [new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount, 0))],
        options: {
            tabSize: 2,
            insertSpaces: true,
            cursorStyle: vscode.TextEditorCursorStyle.Line,
            lineNumbers: vscode.TextEditorLineNumbersStyle.On
        },
        viewColumn: vscode.ViewColumn.One,
        edit: async () => true,
        insertSnippet: async () => true,
        setDecorations: () => { },
        revealRange: () => { },
        show: () => { }
    } as unknown as vscode.TextEditor;
}

/**
 * Resets all mocks and cleans up after tests
 */
export function resetAllMocks(): void {
    vi.resetAllMocks();
}
