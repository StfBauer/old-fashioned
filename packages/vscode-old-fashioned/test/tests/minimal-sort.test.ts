/**
 * Minimal Test for CSS Sorting
 * 
 * This file contains a simplified test for CSS sorting that doesn't rely on complex mocks
 */

// Set test environment variable first before any imports
process.env.NODE_ENV = 'test';
process.env.SKIP_PROGRESS_NOTIFICATION = 'true';

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define mocks using vi.hoisted to prevent hoisting issues
const mockVscode = vi.hoisted(() => ({
    window: {
        showInformationMessage: vi.fn().mockResolvedValue('OK'),
        showErrorMessage: vi.fn(),
        withProgress: vi.fn().mockImplementation((options, task) => task())
    },
    workspace: {
        getConfiguration: vi.fn().mockReturnValue({
            get: vi.fn().mockImplementation((key) => {
                if (key === 'sorting.strategy') return 'alphabetical';
                if (key === 'notificationLevel') return 'verbose';
                return true;
            })
        }),
        applyEdit: vi.fn().mockResolvedValue(true)
    },
    ProgressLocation: {
        Notification: 1
    },
    Range: class {
        constructor(startLine, startChar, endLine, endChar) {
            this.start = { line: startLine, character: startChar };
            this.end = { line: endLine, character: endChar };
        }
    },
    WorkspaceEdit: class {
        replace = vi.fn();
        constructor() { }
    },
    commands: {
        executeCommand: vi.fn()
    }
}));

// Create mock for stylelint using vi.hoisted
const mockStylelint = vi.hoisted(() => ({
    default: {
        lint: vi.fn().mockResolvedValue({
            results: [{ warnings: [] }],
            output: '.test { background: red; color: blue; display: block; }'
        })
    }
}));

// Create config-loader mock 
const mockConfigLoader = vi.hoisted(() => ({
    getDocumentSortingOptions: vi.fn().mockReturnValue({
        source: 'vscode',
        options: {
            strategy: 'alphabetical',
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        }
    }),
    ConfigSource: {
        VSCODE: 'vscode',
        PROJECT: 'project'
    }
}));

// Mock the diagnostics module to avoid direct stylelint usage
const mockDiagnostics = vi.hoisted(() => ({
    activateDiagnostics: vi.fn(),
    updateDiagnostics: vi.fn(),
    clearDiagnostics: vi.fn()
}));

// Apply mocks
vi.mock('vscode', () => mockVscode);
vi.mock('stylelint', () => mockStylelint);
vi.mock('../../src/config-loader', () => mockConfigLoader);
vi.mock('../../src/diagnostics', () => mockDiagnostics);

// Now import sorting module
import { sortCssProperties } from '../../src/sorting';

describe('CSS Sorting Minimal Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should sort CSS properties without errors', async () => {
        // Create a more complete mock that will work with the text processing logic  
        // Using unsorted CSS that will definitely change when sorted alphabetically
        const mockText = '.test { z-index: 1; background: red; color: blue; display: block; }';
        const mockDocument = {
            languageId: 'css',
            getText: vi.fn().mockReturnValue(mockText),
            uri: { fsPath: '/test.css', scheme: 'file' },
            lineCount: 1,
            lineAt: vi.fn().mockReturnValue({ text: mockText })
        };

        const mockEditor: any = {
            document: mockDocument,
            selection: { isEmpty: true },
            selections: [{ isEmpty: true }],
            edit: vi.fn((callback) => {
                // Call the callback with a mock edit builder
                callback({
                    replace: vi.fn()
                });
                return Promise.resolve(true);
            })
        };

        // Call sort function
        await sortCssProperties(mockEditor);

        // Verify workspace.applyEdit was called (sorting was attempted)
        expect(mockVscode.workspace.applyEdit).toHaveBeenCalled();

        // Check for success message
        expect(mockVscode.window.showInformationMessage).toHaveBeenCalledWith(
            expect.stringContaining('CSS properties sorted successfully')
        );
    });
});
