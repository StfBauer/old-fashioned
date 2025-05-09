/**
 * Config Loader Tests
 * 
 * Tests for the stylelint configuration loading functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { findStylelintConfig, hasOldschoolOrderPlugin, getDocumentSortingOptions, ConfigSource } from '../config-loader';

// Mock Node.js modules
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// Mock VS Code APIs
const vscode = vi.hoisted(() => {
    return {
        workspace: {
            getConfiguration: vi.fn(() => ({
                get: (key: string, defaultValue: any) => defaultValue
            }))
        },
        Uri: {
            file: (path: string) => ({ scheme: 'file', fsPath: path })
        }
    };
});
vi.mock('vscode', () => vscode, { virtual: true });

describe('Config Loader', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('findStylelintConfig', () => {
        it('should find stylelint config in the current directory', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            const result = findStylelintConfig('/project/src');

            expect(result).not.toBeNull();
            expect(result?.exists).toBe(true);
            expect(fs.existsSync).toHaveBeenCalled();
        });

        it('should search parent directories for config', () => {
            vi.mocked(fs.existsSync).mockImplementation((path: string) => {
                return path.includes('/project/.stylelintrc');
            });

            const result = findStylelintConfig('/project/src/components');

            expect(result).not.toBeNull();
            expect(result?.path).toContain('/project/.stylelintrc');
        });

        it('should check package.json for stylelint property', () => {
            vi.mocked(fs.existsSync).mockImplementation((path: string) => {
                return path.endsWith('package.json');
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

    describe('hasOldschoolOrderPlugin', () => {
        it('should detect oldschool-order plugin in JSON config', () => {
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldschool-order']
            }));

            const result = hasOldschoolOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should detect plugin with partial name match', () => {
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['@some-scope/oldschool-order']
            }));

            const result = hasOldschoolOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should return false if plugin is not in config', () => {
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['some-other-plugin']
            }));

            const result = hasOldschoolOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(false);
        });

        it('should handle package.json with stylelint property', () => {
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                name: 'my-project',
                stylelint: {
                    plugins: ['stylelint-oldschool-order']
                }
            }));

            const result = hasOldschoolOrderPlugin('/project/package.json');

            expect(result).toBe(true);
        });
    });

    describe('getDocumentSortingOptions', () => {
        it('should use VS Code settings when no project config exists', () => {
            // Mock document
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/style.css' }
            };

            // Mock that no config file exists
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
        });

        it('should use project config when it exists with oldschool-order plugin', () => {
            // Mock document
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/style.css' }
            };

            // Mock that config file exists
            vi.mocked(fs.existsSync).mockImplementation((path: string) => {
                return path.includes('.stylelintrc');
            });

            // Mock that config contains the plugin
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldschool-order']
            }));

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toBeDefined();
        });

        it('should fallback to VS Code settings for non-file documents', () => {
            // Mock document with non-file scheme
            const document = {
                uri: { scheme: 'untitled' }
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
        });
    });

    describe('Integration Tests for Project Config Detection', () => {
        it('should correctly detect and use project config in a nested directory structure', () => {
            // Set up mock filesystem structure
            const mockFileSystem = {
                '/project/.stylelintrc.json': JSON.stringify({
                    plugins: ['stylelint-oldschool-order'],
                    rules: {
                        'oldschool/order': [true, { strategy: 'alphabetical' }]
                    }
                }),
                '/project/src/styles.css': 'body { color: red; }',
                '/project/src/components/Button/Button.css': '.button { background: blue; }'
            };

            // Mock filesystem operations
            vi.mocked(fs.existsSync).mockImplementation((filepath: string) => {
                return Object.keys(mockFileSystem).some(f => filepath.includes(f));
            });

            vi.mocked(fs.readFileSync).mockImplementation((filepath: string) => {
                const key = Object.keys(mockFileSystem).find(f => filepath.includes(f));
                return key ? mockFileSystem[key] : '';
            });

            // Test with a deeply nested file
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/components/Button/Button.css' }
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.PROJECT);
            expect(result.configPath).toContain('.stylelintrc.json');

            // In a real implementation, we would check that the strategy is 'alphabetical'
            // as specified in the mock config
        });
    });
});
