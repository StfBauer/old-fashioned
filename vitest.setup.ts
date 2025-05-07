// Import necessary types
import * as vscode from 'vscode';
import { vi } from 'vitest';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Setup global variables for tests
globalThis.vscode = vscode;

// Set up module resolution helpers for ESM or CommonJS
global.__dirname = typeof __dirname !== 'undefined'
    ? __dirname
    : fileURLToPath(new URL('.', import.meta.url));

// Set up mocks for resolving packages
vi.mock('stylelint-oldschool-order', () => {
    return {
        default: {
            ruleName: 'plugin/oldschool-order',
            messages: {
                expected: () => 'Expected properties to be in order.'
            }
        }
    };
});
