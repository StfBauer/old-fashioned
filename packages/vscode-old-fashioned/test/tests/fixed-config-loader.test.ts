/**
 * Properly Fixed Config Loader Test
 */

// Setup our mocks FIRST before any imports
import { vi } from 'vitest';

// Mock VS Code first to avoid the initialization error
vi.mock('vscode', () => ({
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: (key: string, defaultValue: any) => defaultValue
        }))
    },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path, toString: () => `file://${path}` })
    }
}));

// Mock fs module
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}));

// NOW we can import the modules
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { findStylelintConfig, hasOldfashionedOrderPlugin, getDocumentSortingOptions, ConfigSource } from '../../src/config-loader';

// Now create a helper for logging/capturing console messages
class ConsoleSpy {
    private errorMessages: string[] = [];

    start() {
        // Store original console methods and mock them
        const originalError = console.error;
        console.error = vi.fn((...args) => {
            this.errorMessages.push(args.map(String).join(' '));
            originalError(...args);
        });
    }

    stop() {
        // No need to restore console since it's test-scoped
    }

    hasError(pattern: string | RegExp): boolean {
        if (typeof pattern === 'string') {
            return this.errorMessages.some(msg => msg.includes(pattern));
        }
        return this.errorMessages.some(msg => pattern.test(msg));
    }
}

describe('Fixed Config Loader Tests', () => {
    let consoleSpy: ConsoleSpy;

    beforeEach(() => {
        vi.resetAllMocks();
        consoleSpy = new ConsoleSpy();
        consoleSpy.start();
    });

    afterEach(() => {
        vi.resetAllMocks();
        consoleSpy.stop();
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

    describe('hasOldschoolOrderPlugin', () => {
        it('should detect oldschool-order plugin in JSON config', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['stylelint-oldschool-order']
            }));

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });

        it('should detect plugin with partial name match', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                plugins: ['@some-scope/oldschool-order']
            }));

            const result = hasOldfashionedOrderPlugin('/project/.stylelintrc.json');

            expect(result).toBe(true);
        });
    });

    describe('getDocumentSortingOptions', () => {
        it('should use VS Code settings when no project config exists', () => {
            // Setup mocks
            vi.mocked(fs.existsSync).mockReturnValue(false);

            // Create mock document
            const document = {
                uri: { scheme: 'file', fsPath: '/project/src/style.css', toString: () => 'file:///project/src/style.css' },
                languageId: 'css',
                getText: () => '.test { color: red; }'
            };

            const result = getDocumentSortingOptions(document as any);

            expect(result.source).toBe(ConfigSource.VSCODE);
            expect(result.options).toBeDefined();
        });
    });
});
