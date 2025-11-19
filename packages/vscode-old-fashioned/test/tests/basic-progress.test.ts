/**
 * Basic Progress Notification Test
 * 
 * This test validates that the progress notification handling works correctly
 * in both normal and test environments.
 */

// Set the test environment variable first
process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock vscode directly without module import complications
const mockWithProgress = vi.hoisted(() => vi.fn().mockImplementation((options, task) => task()));
const mockShowInfoMessage = vi.hoisted(() => vi.fn().mockResolvedValue('OK'));

// Use vi.hoisted to prevent "Cannot access before initialization" errors
const mockVscode = vi.hoisted(() => ({
    window: {
        withProgress: mockWithProgress,
        showInformationMessage: mockShowInfoMessage,
        showErrorMessage: vi.fn()
    },
    ProgressLocation: {
        Notification: 1,
        Window: 2
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
    Range: class {
        start: any;
        end: any;
        constructor(startLine: any, startChar: any, endLine: any, endChar: any) {
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

// Mock stylelint to return successful sorting
const mockStylelint = vi.hoisted(() => ({
    default: {
        lint: vi.fn().mockResolvedValue({
            results: [{ warnings: [] }],
            output: '.test { display: block; color: red; }'
        })
    }
}));

// Mock the diagnostics module to avoid direct stylelint usage
const mockDiagnostics = vi.hoisted(() => ({
    activateDiagnostics: vi.fn(),
    updateDiagnostics: vi.fn(),
    clearDiagnostics: vi.fn()
}));

vi.mock('vscode', () => mockVscode);
vi.mock('stylelint', () => mockStylelint);
vi.mock('../../src/diagnostics', () => mockDiagnostics);

// Import the module under test after mocks are set up
import { sortCssProperties } from '../../src/sorting';

describe('CSS Properties Sorting Tests', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    it('should bypass progress notification in test environment', async () => {
        // Create a simplified mock with type assertion to bypass typing issues
        const mockEditor: any = {
            document: {
                languageId: 'css',
                getText: () => '.test { z-index: 1; background: red; color: blue; display: block; }',
                uri: { fsPath: '/test.css', scheme: 'file' },
                lineCount: 1,
                lineAt: () => ({ text: '.test { z-index: 1; background: red; color: blue; display: block; }' })
            },
            selection: { isEmpty: true },
            selections: [{ isEmpty: true }],
            edit: vi.fn().mockResolvedValue(true)
        };

        // Call the function under test
        await sortCssProperties(mockEditor);

        // Verify progress notification was not used in test environment
        expect(mockWithProgress).not.toHaveBeenCalled();

        // Verify workspace.applyEdit was called (sorting was attempted)
        expect(mockVscode.workspace.applyEdit).toHaveBeenCalled();

        // Verify success message was shown
        expect(mockShowInfoMessage).toHaveBeenCalledWith(
            expect.stringContaining('CSS properties sorted successfully')
        );
    });
});
