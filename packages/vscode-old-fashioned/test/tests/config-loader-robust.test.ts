/**
 * Config Loader Robustness Tests
 * 
 * These tests specifically focus on the error handling capabilities
 * and edge cases in the config loader to ensure reliable behavior.
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
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: (key: string, defaultValue: any) => defaultValue
        })),
        onDidOpenTextDocument: vi.fn(),
        onDidChangeTextDocument: vi.fn(),
        onDidSaveTextDocument: vi.fn(),
        textDocuments: []
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
    }
}));

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { findStylelintConfig, hasOldfashionedOrderPlugin, getDocumentSortingOptions, ConfigSource } from '../../src/config-loader';
import { FileSystemMockBuilder, resetAllMocks, createTestDocument } from './test-utils';
import { ConsoleSpy, ErrorSimulator } from './error-utils';

describe('Config Loader Robustness', () => {
    let fsMock: FileSystemMockBuilder;
    let consoleSpy: ConsoleSpy;

    beforeEach(() => {
        resetAllMocks();
        fsMock = new FileSystemMockBuilder();
        consoleSpy = new ConsoleSpy();
        consoleSpy.start();
    });

    afterEach(() => {
        resetAllMocks();
        consoleSpy.stop();
    });

    describe('findStylelintConfig robustness', () => {
        it('should handle null or empty directory paths gracefully', () => {
            const result1 = findStylelintConfig('');
            const result2 = findStylelintConfig(null as any);

            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(consoleSpy.hasError('Invalid directory path')).toBe(true);
        });

        it('should handle file read errors gracefully', async () => {
            // Setup mock filesystem with file that exists but errors on reading
            fsMock.addMockFile('/project/package.json', '').build();

            // Make readFileSync throw an error
            vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
                throw new Error('Simulated read error');
            });

            // Should not throw, but should log error and continue
            const result = findStylelintConfig('/project');

            // Should still find the file because existsSync returns true
            expect(result).not.toBeNull();
            expect(consoleSpy.hasError('Error reading package.json')).toBe(true);
        });

        it('should handle invalid JSON in package.json gracefully', async () => {
            // Setup mock filesystem with package.json containing invalid JSON
            fsMock.build();

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValueOnce('{ invalid json }');

            // Should not throw, but should log error and continue
            const result = findStylelintConfig('/project');

            expect(consoleSpy.hasError('Error reading package.json')).toBe(true);
        });

        it('should handle filesystem traversal errors', () => {
            // Mock existsSync to simulate a path traversal error for a specific path
            vi.mocked(fs.existsSync).mockImplementation((filePath) => {
                if (String(filePath).includes('deeply/nested')) {
                    throw new Error('Path traversal error');
                }
                return false;
            });

            const result = findStylelintConfig('/project/deeply/nested/path');

            expect(result).toBeNull();
            expect(consoleSpy.hasError(/Error finding stylelint config|Path traversal error/)).toBe(true);
        });
    });

    describe('hasOldfashionedOrderPlugin robustness', () => {
        it('should handle nonexistent config files gracefully', () => {
            // Setup mock filesystem with no files
            fsMock.build();

            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
            expect(consoleSpy.hasError('Configuration file not found')).toBe(true);
        });

        it('should handle invalid JSON in config files gracefully', () => {
            // Setup mock filesystem with invalid JSON
            fsMock.build();

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValueOnce('{ invalid: json }');

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
            expect(consoleSpy.hasError('Failed to parse configuration file')).toBe(true);
        });

        it('should handle empty config files gracefully', () => {
            // Setup mock filesystem with empty config
            fsMock.build();

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValueOnce('{}');

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
            // No error expected for valid but empty JSON
        });

        it('should handle config with plugins but no oldfashioned plugin', () => {
            // Setup mock filesystem with config that has plugins but not oldfashioned
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-other-plugin']
            }).build();

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
        });

        it('should return true for JS configs without trying to parse them', () => {
            // Setup mock filesystem with JS config
            fsMock.build();

            vi.mocked(fs.existsSync).mockReturnValue(true);

            const result = hasOldfashionedOrderPlugin('/project/stylelint.config.js');

            expect(result).toBe(true);
        });
    });

    describe('getDocumentSortingOptions robustness', () => {
        it('should handle undefined document gracefully', () => {
            const result = getDocumentSortingOptions(undefined as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
        });

        it('should handle non-file documents gracefully', () => {
            // Create a non-file document
            const document = {
                uri: { scheme: 'untitled', fsPath: '/untitled.css' },
                languageId: 'css'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
        });

        it('should handle file read errors in project configs', () => {
            // Setup mock filesystem
            fsMock.build();

            // Make existsSync return true but readFileSync throw
            vi.mocked(fs.existsSync).mockImplementation(path => String(path).includes('.stylelintrc'));
            vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
                throw new Error('File read error');
            });

            // Create test document
            const document = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            const result = getDocumentSortingOptions(document as any);

            // Should fall back to VS Code settings
            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(consoleSpy.hasError('Error checking for oldfashioned-order plugin')).toBe(true);
        });

        it('should handle invalid JSON in project configs', () => {
            // Setup mock filesystem with invalid JSON in config
            fsMock.build();

            vi.mocked(fs.existsSync).mockImplementation(path => String(path).includes('.stylelintrc'));
            vi.mocked(fs.readFileSync).mockReturnValueOnce('{ invalid json }');

            // Create test document
            const document = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            const result = getDocumentSortingOptions(document as any);

            // Should fall back to VS Code settings
            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(consoleSpy.hasError('Failed to parse configuration file')).toBe(true);
        });

        it('should handle missing oldfashioned rule config gracefully', () => {
            // Setup mock filesystem with config that has the plugin but no rule config
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldfashioned-order'],
                rules: {
                    // No oldfashioned rule
                    'other-rule': true
                }
            }).build();

            // Create test document
            const document = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            const result = getDocumentSortingOptions(document as any);

            // Should use project config but with default settings
            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toBeDefined();
            expect(result.options.strategy).toBe('grouped'); // Default
        });

        it('should validate sorting strategy values', () => {
            // Setup mock filesystem with invalid strategy
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldfashioned-order'],
                rules: {
                    'oldfashioned/order': [true, { strategy: 'invalid-strategy' }]
                }
            }).build();

            // Create test document
            const document = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            const result = getDocumentSortingOptions(document as any);

            // Should use project config but with default strategy
            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.options.strategy).toBe('grouped'); // Default when invalid
        });

        it('should handle VS Code settings that are missing or invalid', () => {
            // Set up directly without using VSCodeMockBuilder
            // No need to replace the mock since we're modifying it directly

            // Make getConfiguration return a mock that returns undefined
            vscode.workspace.getConfiguration = vi.fn().mockReturnValue({
                get: vi.fn().mockReturnValue(undefined)
            });

            // Create test document
            const document = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            // Should use default values when settings are missing
            const result = getDocumentSortingOptions(document as any);
            expect(result.options.strategy).toBe('grouped'); // Default
        });
    });

    describe('Real-world edge cases', () => {
        it('should handle complex project structures with nested configurations', async () => {
            // Set up a complex mock filesystem structure
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'oldschool/order': [true, { strategy: 'alphabetical' }]
                }
            })
                .addStylelintConfig('/project/packages/component-lib/.stylelintrc.json', {
                    extends: ['../../.stylelintrc.json'],
                    plugins: ['stylelint-oldschool-order'],
                    rules: {
                        'oldschool/order': [true, { strategy: 'grouped' }]
                    }
                })
                .addStylelintConfig('/project/packages/website/.stylelintrc.json', {
                    plugins: ['some-other-plugin']
                    // No oldschool plugin here
                })
                .build();

            // Test documents at different levels
            const rootLevelDoc = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/style.css'
            });

            const componentLibDoc = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/packages/component-lib/style.css'
            });

            const websiteDoc = createTestDocument({
                languageId: 'css',
                content: '.test {}',
                uri: 'file:///project/packages/website/style.css'
            });

            // Check the configuration source for each document
            const rootResult = getDocumentSortingOptions(rootLevelDoc as any);
            const componentResult = getDocumentSortingOptions(componentLibDoc as any);
            const websiteResult = getDocumentSortingOptions(websiteDoc as any);

            expect(rootResult.source).toBe(ConfigSource.PROJECT);
            expect(rootResult.options.strategy).toBe('alphabetical');

            expect(componentResult.source).toBe(ConfigSource.PROJECT);
            expect(componentResult.options.strategy).toBe('grouped');

            // Website has no oldschool plugin, so should fall back to VS Code settings
            expect(websiteResult.source).toBe(ConfigSource.VSCODE);
        });
    });
});
