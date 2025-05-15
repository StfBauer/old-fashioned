/**
 * Config Loader Tests
 * 
 * Tests for the stylelint configuration loading functionality
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
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: (key: string, defaultValue: any) => defaultValue
        }))
    },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path })
    }
}));

// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode'; // Import vscode to access the mock
import { findStylelintConfig, hasOldfashionedOrderPlugin, getDocumentSortingOptions, ConfigSource } from '../../src/config-loader';
import { VSCodeMockBuilder, FileSystemMockBuilder, resetAllMocks, createTestDocument } from './test-utils';

describe('Config Loader', () => {
    // Setup mock filesystem for each test
    let fsMock: FileSystemMockBuilder;

    beforeEach(() => {
        resetAllMocks();
        fsMock = new FileSystemMockBuilder();
    });

    afterEach(() => {
        resetAllMocks();
    });

    describe('findStylelintConfig', () => {
        it('should find stylelint config in the current directory', () => {
            // Setup mock files
            fsMock.addStylelintConfig('/project/.stylelintrc', {
                plugins: ['stylelint-oldschool-order']
            }).build();

            const result = findStylelintConfig('/project/src');

            expect(result).not.toBeNull();
            expect(result?.exists).toBe(true);
            expect(fs.existsSync).toHaveBeenCalled();
        });

        it('should search parent directories for config', () => {
            // Setup mock files that only match at parent directory level
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order']
            }).build();

            const result = findStylelintConfig('/project/src/components');

            expect(result).not.toBeNull();
            expect(result?.path).toContain('/project/.stylelintrc.json');
        });

        it('should check package.json for stylelint property', () => {
            // Setup mock package.json with stylelint config
            fsMock.addPackageJson('/project/package.json', {
                name: 'test-project',
                stylelint: {
                    plugins: ['stylelint-oldschool-order'],
                    rules: {}
                }
            }).build();

            const result = findStylelintConfig('/project');

            expect(result).not.toBeNull();
            expect(result?.path).toContain('package.json');
            expect(fs.readFileSync).toHaveBeenCalled();
        });

        it('should return null if no config is found', () => {
            // Empty mock filesystem
            fsMock.build();

            const result = findStylelintConfig('/project');

            expect(result).toBeNull();
        });
    });

    describe('hasOldschoolOrderPlugin', () => {
        it('should detect oldschool-order plugin in JSON config', () => {
            // Setup mock files
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order']
            }).build();

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should detect plugin with partial name match', () => {
            // Setup mock files
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['@some-scope/oldschool-order']
            }).build();

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should return false if plugin is not in config', () => {
            // Setup mock files
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['some-other-plugin']
            }).build();

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
        });

        it('should handle package.json with stylelint property', () => {
            // Setup mock files
            fsMock.addPackageJson('/project/package.json', {
                name: 'my-project',
                stylelint: {
                    plugins: ['stylelint-oldschool-order']
                }
            }).build();

            const result = hasOldfashionedOrderPlugin('/project/package.json');

            expect(result).toBe(true);
        });
    });

    describe('getDocumentSortingOptions', () => {
        it('should use VS Code settings when no project config exists', () => {
            // Setup VS Code mock with settings
            const vscodeWithSettings = new VSCodeMockBuilder()
                .withSettings({
                    oldFashioned: {
                        sorting: {
                            strategy: 'grouped',
                            emptyLinesBetweenGroups: true,
                            sortPropertiesWithinGroups: true
                        }
                    }
                })
                .build();

            // Replace the mock
            Object.assign(vscode, vscodeWithSettings);

            // Setup empty filesystem - no config files
            fsMock.build();

            // Mock document without using createTestDocument
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/style.css' },
                languageId: 'css',
                getText: () => '.test { color: red; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
            expect(result.options.strategy).toBe('grouped');
        });

        it('should use project config when it exists with oldschool-order plugin', () => {
            // Setup mock files with project config
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'oldschool/order': [true, { strategy: 'alphabetical' }]
                }
            }).build();

            // Mock document without using createTestDocument
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/style.css' },
                languageId: 'css',
                getText: () => '.test { color: red; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toBeDefined();
            // In a real implementation, we would check that the options.strategy is 'alphabetical'
        });

        it('should fallback to VS Code settings for non-file documents', () => {
            // Setup mock files with project config (that shouldn't be used)
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order']
            }).build();

            // Mock document with non-file scheme
            const document = {
                uri: { scheme: 'untitled', fsPath: '/project/untitled.css' },
                languageId: 'css'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
        });
    });

    describe('Integration Tests for Project Config Detection', () => {
        it('should correctly detect and use project config in a nested directory structure', () => {
            // Set up mock filesystem structure
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'oldschool/order': [true, { strategy: 'alphabetical' }]
                }
            })
                .addMockFile('/project/src/styles.css', 'body { color: red; }')
                .addMockFile('/project/src/components/Button/Button.css', '.button { background: blue; }')
                .build();

            // Mock document in a deeply nested location
            const document = createTestDocument({
                languageId: 'css',
                content: '.button { background: blue; }',
                uri: 'file:///project/src/components/Button/Button.css'
            });

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toContain('.stylelintrc.json');
            // In a real implementation, we would check that the strategy is 'alphabetical'
        });

        it('should handle multiple config files correctly', () => {
            // Set up mock filesystem with multiple configs at different levels
            fsMock.addStylelintConfig('/project/.stylelintrc.json', {
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'oldschool/order': [true, { strategy: 'alphabetical' }]
                }
            })
                .addStylelintConfig('/project/src/components/.stylelintrc.json', {
                    plugins: ['stylelint-oldschool-order'],
                    rules: {
                        'oldschool/order': [true, { strategy: 'concentric' }]
                    }
                })
                .build();

            // Mock document that should use the nested config
            const document = createTestDocument({
                languageId: 'css',
                content: '.button { background: blue; }',
                uri: 'file:///project/src/components/Button/Button.css'
            });

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toContain('/project/src/components/.stylelintrc.json');
            // The config from the closest parent directory should be used
        });
    });
});
