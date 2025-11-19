/**
 * Mock config-loader for testing
 * 
 * This mock allows tests to override the configuration detection logic
 * with predictable results. This is especially important for tests that expect
 * specific configuration sources.
 */

import { vi } from 'vitest';
import { SortingOptions } from '@old-fashioned/shared';

// Create the enum values exactly as they are in the actual module
export enum ConfigSource {
    VSCODE = 'vscode',
    PROJECT = 'project'
}

// Mock implementation of getDocumentSortingOptions
export const getDocumentSortingOptions = vi.fn().mockImplementation(document => {
    // Check for environment variables set by tests
    const mockSource = process.env.TEST_CONFIG_SOURCE;
    const mockStrategy = process.env.TEST_SORTING_STRATEGY || 'grouped';

    // By default, return VS Code source unless TEST_CONFIG_SOURCE is set to 'project'
    const source = mockSource === 'project' ? ConfigSource.PROJECT : ConfigSource.VSCODE;

    // Create mock options based on the requested strategy
    const options: SortingOptions = {
        strategy: mockStrategy as any,
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: true
    };

    return {
        source,
        options,
        configPath: source === ConfigSource.PROJECT ? '/mock/path/to/stylelint.config.js' : undefined
    };
});

// Other mock functions that might be needed
export const findStylelintConfig = vi.fn().mockImplementation(directory => {
    if (process.env.TEST_CONFIG_SOURCE === 'project') {
        return {
            exists: true,
            path: '/mock/path/to/stylelint.config.js',
            config: {
                plugins: ['stylelint-oldschool-order'],
                rules: {
                    'plugin/oldschool-order': [true, { strategy: process.env.TEST_SORTING_STRATEGY || 'grouped' }]
                }
            }
        };
    }

    return null;
});

export const getVSCodeSortingOptions = vi.fn().mockReturnValue({
    strategy: process.env.TEST_SORTING_STRATEGY || 'grouped',
    emptyLinesBetweenGroups: true,
    sortPropertiesWithinGroups: true
});

export const getStylelintSortingOptions = vi.fn().mockImplementation(configPath => {
    return {
        strategy: process.env.TEST_SORTING_STRATEGY || 'grouped',
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: true
    };
});

export const hasOldfashionedOrderPlugin = vi.fn().mockImplementation(configPath => {
    return process.env.TEST_CONFIG_SOURCE === 'project';
});

// Mock error classes and enums that might be used in tests
export enum ConfigErrorCode {
    INVALID_PATH = 'invalid-path',
    FILE_NOT_FOUND = 'file-not-found',
    READ_ERROR = 'read-error',
    PARSE_ERROR = 'parse-error',
    INVALID_CONFIG = 'invalid-config'
}

export class ConfigurationError extends Error {
    code: ConfigErrorCode;

    constructor(message: string, code: ConfigErrorCode) {
        super(message);
        this.name = 'ConfigurationError';
        this.code = code;
    }
}
