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
vi.mock('fs', () => {
    return {
        existsSync: vi.fn(),
        readFileSync: vi.fn()
    };
});

// Mock VS Code APIs
const mockTextEdit = vi.fn();
const mockEditBuilder = {
    replace: mockTextEdit
};

const vscode = vi.hoisted(() => {
    return {
        window: {
            activeTextEditor: null,
            showErrorMessage: vi.fn(),
            showInformationMessage: vi.fn(),
            withProgress: vi.fn((options, task) => task())
        },
        workspace: {
            getConfiguration: vi.fn(() => ({
                get: (key: string, defaultValue: any) => {
                    // Default VS Code settings - these would be overridden by project config
                    if (key === 'sortingStrategy') return 'concentric';
                    return defaultValue;
                }
            })),
            applyEdit: vi.fn(),
            WorkspaceEdit: class {
                replace() { }
            }
        },
        Uri: {
            file: (path: string) => ({ scheme: 'file', fsPath: path })
        },
        Range: class {
            constructor(public start: any, public end: any) { }
        },
        Position: class {
            constructor(public line: number, public character: number) { }
        },
        WorkspaceEdit: class {
            constructor() { }
            replace() { }
        }
    };
});
vi.mock('vscode', () => vscode, { virtual: true });

describe('Project-Level Configuration Integration Tests', () => {
    // Setup temporary directory for tests
    let tempDir: string;

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();
        mockTextEdit.mockClear();

        // Create temp directory for test files if needed
        // In Vitest, we're mocking the filesystem, so this is just for representational purposes
        tempDir = path.join(os.tmpdir(), `oldschool-test-${Date.now()}`);
    });

    afterEach(() => {
        // Clean up temp directory if needed
        // Again, with mocked fs this is representational
    });

    it('should respect project-level alphabetical sorting strategy over VS Code settings', async () => {
        // Set up mock filesystem with project-level config
        const mockFiles = {
            [`${tempDir}/.stylelintrc.json`]: JSON.stringify({
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'oldschool/order': [true, { strategy: 'alphabetical' }]
                }
            }),
            [`${tempDir}/style.css`]: `
        .element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }
      `
        };

        // Mock filesystem operations
        vi.mocked(fs.existsSync).mockImplementation((path: string) =>
            Object.keys(mockFiles).some(file => path.includes(file.replace(tempDir, '')))
        );

        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            const key = Object.keys(mockFiles).find(file => path.includes(file.replace(tempDir, '')));
            return key ? mockFiles[key] : '';
        });

        // Mock document and editor
        const document = {
            uri: { scheme: 'file', fsPath: `${tempDir}/style.css` },
            getText: () => mockFiles[`${tempDir}/style.css`],
            lineCount: 7,
            lineAt: (idx: number) => {
                const lines = mockFiles[`${tempDir}/style.css`].split('\n');
                return { text: lines[idx], range: new vscode.Range(new vscode.Position(idx, 0), new vscode.Position(idx, lines[idx].length)) };
            },
            languageId: 'css'
        };

        const editor = {
            document,
            selection: {
                isEmpty: true,
                start: new vscode.Position(0, 0),
                end: new vscode.Position(7, 0)
            },
            edit: async (callback: Function) => {
                callback(mockEditBuilder);
                return true;
            }
        };

        // Set active editor
        vscode.window.activeTextEditor = editor;

        // First, check the detected config source directly
        const config = getDocumentSortingOptions(document as any);
        expect(config.source).toBe(ConfigSource.PROJECT);
        expect(config.options.strategy).toBe('alphabetical');

        // Call function under test
        await sortCssProperties(editor as any);

        // Check if sorting was called
        expect(mockTextEdit).toHaveBeenCalled();
    });

    it('should respect VS Code settings when no project config exists', async () => {
        // Set up mock filesystem without project-level config
        const mockFiles = {
            [`${tempDir}/style.css`]: `
        .element {
          width: 100px;
          color: red;
          background: blue;
          animation: fade 1s;
        }
      `
        };

        // Mock filesystem operations
        vi.mocked(fs.existsSync).mockImplementation((path: string) =>
            Object.keys(mockFiles).some(file => path.includes(file.replace(tempDir, '')))
        );

        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            const key = Object.keys(mockFiles).find(file => path.includes(file.replace(tempDir, '')));
            return key ? mockFiles[key] : '';
        });

        // Mock document and editor
        const document = {
            uri: { scheme: 'file', fsPath: `${tempDir}/style.css` },
            getText: () => mockFiles[`${tempDir}/style.css`],
            lineCount: 7,
            lineAt: (idx: number) => {
                const lines = mockFiles[`${tempDir}/style.css`].split('\n');
                return { text: lines[idx], range: new vscode.Range(new vscode.Position(idx, 0), new vscode.Position(idx, lines[idx].length)) };
            },
            languageId: 'css'
        };

        const editor = {
            document,
            selection: {
                isEmpty: true,
                start: new vscode.Position(0, 0),
                end: new vscode.Position(7, 0)
            },
            edit: async (callback: Function) => {
                callback(mockEditBuilder);
                return true;
            }
        };

        // Set active editor
        vscode.window.activeTextEditor = editor;

        // First, check the detected config source directly
        const config = getDocumentSortingOptions(document as any);
        expect(config.source).toBe(ConfigSource.VSCODE);

        // Call function under test
        await sortCssProperties(editor as any);

        // Check if sorting was called
        expect(mockTextEdit).toHaveBeenCalled();
    });

    it('should provide information about what configuration source is being used', () => {
        // Create mock documents
        const docWithProjectConfig = {
            uri: { scheme: 'file', fsPath: `${tempDir}/with-config/style.css` }
        };

        const docWithoutProjectConfig = {
            uri: { scheme: 'file', fsPath: `${tempDir}/no-config/style.css` }
        };

        // Mock config file existence
        vi.mocked(fs.existsSync).mockImplementation((path: string) => {
            return path.includes(`${tempDir}/with-config`) && path.includes('.stylelintrc');
        });

        // Mock config file content
        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            if (path.includes(`${tempDir}/with-config`)) {
                return JSON.stringify({
                    plugins: ['stylelint-oldschool-order'],
                    rules: {
                        'oldschool/order': [true, { strategy: 'alphabetical' }]
                    }
                });
            }
            return '';
        });

        // Check config source for document with project config
        const resultWithConfig = getDocumentSortingOptions(docWithProjectConfig as any);
        expect(resultWithConfig.source).toBe(ConfigSource.PROJECT);

        // Check config source for document without project config
        const resultWithoutConfig = getDocumentSortingOptions(docWithoutProjectConfig as any);
        expect(resultWithoutConfig.source).toBe(ConfigSource.VSCODE);
    });
});
