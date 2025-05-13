// Import vi first for mocks
import { vi } from 'vitest';

// Setup mocks before importing modules
vi.mock('vscode', () => ({
    window: {
        activeTextEditor: null as any,
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn()
    },
    Uri: {
        file: (path: string) => ({ scheme: 'file', fsPath: path })
    }
}));

// Import test modules AFTER mocks are set up
import { describe, it, expect } from 'vitest';

// Simple test to verify the configuration
describe('Test Setup', () => {
    it('should be properly configured', () => {
        expect(true).toBe(true);
    });
});
