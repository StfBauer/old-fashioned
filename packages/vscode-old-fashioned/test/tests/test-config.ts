/**
 * Test configuration utilities
 * 
 * This file contains utilities for setting up test configuration consistently
 * across all test files.
 */

import * as vscode from 'vscode';
import { vi } from 'vitest';
import { ConfigSource } from '../../src/config-loader';

/**
 * Set up the config source for tests
 * 
 * @param source - The config source to use ('project' or 'vscode')
 * @param strategy - The sorting strategy to use
 */
export function setupTestConfig(source: 'project' | 'vscode', strategy: string = 'grouped'): void {
    // Set environment variables for test mode
    process.env.NODE_ENV = 'test';
    process.env.TEST_CONFIG_SOURCE = source;
    process.env.TEST_SORTING_STRATEGY = strategy;

    // Mock the config loader using the mock implementation
    vi.mock('../../src/config-loader', async () => {
        return await import('../tests/mocks/config-loader');
    });
}

/**
 * Set up messaging expectations for showInformationMessage
 * 
 * Some tests specifically check for information messages
 */
export function setupMessagingExpectations(): void {
    // Ensure information messages work in tests
    const mockShowInfoMessage = vi.fn().mockImplementation((message) => {
        console.log(`[TEST] Information message: ${message}`);
        return Promise.resolve('OK');
    });

    // Apply the mocks to vscode module
    vi.mock('vscode', () => {
        // Import the existing mock vscode module
        const mockVscode = require('../tests/mocks/vscode').default;

        // Override the showInformationMessage function
        mockVscode.window.showInformationMessage = mockShowInfoMessage;

        return mockVscode;
    });
}

/**
 * Reset the test configuration
 */
export function resetTestConfig(): void {
    delete process.env.NODE_ENV;
    delete process.env.FORCE_GROUPED_STRATEGY;
    delete process.env.TEST_CONFIG_SOURCE;
    delete process.env.TEST_SORTING_STRATEGY;
    vi.clearAllMocks();
    vi.resetModules();
}
