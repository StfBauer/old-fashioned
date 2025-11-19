/**
 * Setup file for Vitest
 * 
 * This file will be run before all tests to set up the mock environment.
 */

import { vi } from 'vitest';
import vscode from './mocks/vscode';

// Mock the VS Code module globally
vi.mock('vscode', () => vscode);

// Mock Stylelint module - export the spy so it can be referenced in tests
export const stylelintMock = {
    default: {
        lint: vi.fn().mockImplementation((code, options) => {
            console.log('Stylelint mock called with:', code.substring(0, 20) + (code.length > 20 ? '...' : ''));
            return Promise.resolve({
                results: [{ warnings: [] }],
                output: 'sorted-css' + (code || '').substring(0, 10)
            });
        })
    }
};

vi.mock('stylelint', () => stylelintMock);
