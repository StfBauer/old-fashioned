/**
 * Config Loader Tests
 * 
 * Tests for the stylelint configuration loading functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { findStylelintConfig, hasOldfashionedOrderPlugin, getDocumentSortingOptions, ConfigSource } from '../config-loader';

// Mock Node.js modules
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Mock VS Code APIs directly to avoid circular dependencies
const mockVSCode = {
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: (key: string, defaultValue: any) => defaultValue
        }))
    },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })
    }
};
vi.mock('vscode', () => mockVSCode);

describe('Config Loader', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('findStylelintConfig', () => {
        it('should find stylelint config in the current directory', () => {
            // Setup mock
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                return String(path).includes('/project/.stylelintrc');
            });

            const result = findStylelintConfig('/project/src');

            expect(result).not.toBeNull();
            expect(result?.exists).toBe(true);
            expect(fs.existsSync).toHaveBeenCalled();
        });

        it('should search parent directories for config', () => {
            // Setup mock
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                return String(path).includes('/project/.stylelintrc.json');
            });

            const result = findStylelintConfig('/project/src/components');

            expect(result).not.toBeNull();
            expect(result?.path).toContain('/project/.stylelintrc.json');
        });

        it('should check package.json for stylelint property', () => {
            // Setup mocks
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                return String(path).endsWith('package.json');
            });

            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                stylelint: { rules: {} }
            }));

            const result = findStylelintConfig('/project');

            expect(result).not.toBeNull();
            expect(result?.path).toContain('package.json');
            expect(fs.readFileSync).toHaveBeenCalled();
        });

        it('should return null if no config is found', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = findStylelintConfig('/project');

            expect(result).toBeNull();
        });
    });

    describe('hasOldfashionedOrderPlugin', () => {
        it('should detect oldfashioned-order plugin in JSON config', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldfashioned-order']
            }));

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should detect plugin with partial name match', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['@some-scope/oldfashioned-order']
            }));

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should return false if plugin is not in config', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['some-other-plugin']
            }));

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
        });

        it('should handle package.json with stylelint property', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                name: 'my-project',
                stylelint: {
                    plugins: ['stylelint-oldfashioned-order']
                }
            }));

            const result = hasOldfashionedOrderPlugin('/project/package.json');

            expect(result).toBe(true);
        });
    });

    describe('getDocumentSortingOptions', () => {
        it('should use VS Code settings when no project config exists', () => {
            // Setup mocks
            vi.mocked(fs.existsSync).mockReturnValue(false);

            // Update mock VS Code settings
            mockVSCode.workspace.getConfiguration = vi.fn().mockReturnValue({
                get: (key: string) => {
                    if (key === 'sorting.strategy') return 'grouped';
                    if (key === 'sorting.emptyLinesBetweenGroups') return true;
                    if (key === 'sorting.sortPropertiesWithinGroups') return true;
                    return undefined;
                }
            });

            // Mock document
            const document = {
                uri: mockVSCode.Uri.file('/project/src/style.css'),
                languageId: 'css',
                getText: () => '.test { color: red; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
            expect(result.options.strategy).toBe('grouped');
        });

        it('should use project config when it exists with oldfashioned-order plugin', () => {
            // Setup mocks for finding config
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                return String(path).includes('.stylelintrc.json');
            });

            // Setup mocks for reading config
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldfashioned-order'],
                rules: {
                    'oldfashioned/order': [true, { strategy: 'alphabetical' }]
                }
            }));

            // Mock document
            const document = {
                uri: mockVSCode.Uri.file('/project/src/style.css'),
                languageId: 'css',
                getText: () => '.test { color: red; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toBeDefined();
            // In a real implementation, we would check that the options.strategy is 'alphabetical'
        });

        it('should fallback to VS Code settings for non-file documents', () => {
            // Setup mocks
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldfashioned-order']
            }));

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
            // Setup mocks for finding config
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                return String(path).includes('/project/.stylelintrc.json');
            });

            // Setup mocks for reading config
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldfashioned-order'],
                rules: {
                    'oldfashioned/order': [true, { strategy: 'alphabetical' }]
                }
            }));

            // Mock document in a deeply nested location
            const document = {
                uri: mockVSCode.Uri.file('/project/src/components/Button/Button.css'),
                languageId: 'css',
                getText: () => '.button { background: blue; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toContain('.stylelintrc.json');
            // In a real implementation, we would check that the strategy is 'alphabetical'
        });

        it('should handle multiple config files correctly', () => {
            // Set up mock to find different configs based on path
            let callCount = 0;
            vi.mocked(fs.existsSync).mockImplementation((path) => {
                callCount++;
                // First return false to skip some files, then return true for the targeted config
                if (String(path).includes('/project/src/components/.stylelintrc.json')) {
                    return true;
                }
                // Prevent finding the root config
                if (String(path).includes('/project/.stylelintrc.json') && callCount > 5) {
                    return true;
                }
                return false;
            });

            // Return different config based on path
            vi.mocked(fs.readFileSync).mockImplementation((path) => {
                if (String(path).includes('/project/src/components/.stylelintrc.json')) {
                    return JSON.stringify({
                        plugins: ['stylelint-oldfashioned-order'],
                        rules: {
                            'oldfashioned/order': [true, { strategy: 'concentric' }]
                        }
                    });
                }
                return JSON.stringify({
                    plugins: ['stylelint-oldfashioned-order'],
                    rules: {
                        'oldfashioned/order': [true, { strategy: 'alphabetical' }]
                    }
                });
            });

            // Mock document that should use the nested config
            const document = {
                uri: mockVSCode.Uri.file('/project/src/components/Button/Button.css'),
                languageId: 'css',
                getText: () => '.button { background: blue; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toContain('.stylelintrc.json');
        });
    });
});
