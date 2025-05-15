/**
 * Error Handling Utilities for Tests
 * 
 * This module provides test-specific error handling utilities to make tests
 * more resilient and provide better error reporting.
 */

import { vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigSource, ConfigurationError, ConfigErrorCode } from '../../src/config-loader';

/**
 * A utility class for capturing and analyzing console output during tests
 */
export class ConsoleSpy {
    private originalConsole: Record<string, any> = {};
    private logs: string[] = [];
    private errors: string[] = [];
    private warnings: string[] = [];
    private infos: string[] = [];

    /**
     * Start capturing console output
     */
    start(): void {
        // Store original console methods
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        // Mock console methods
        console.log = vi.fn((...args) => {
            this.logs.push(args.map(String).join(' '));
        });

        console.error = vi.fn((...args) => {
            this.errors.push(args.map(String).join(' '));
        });

        console.warn = vi.fn((...args) => {
            this.warnings.push(args.map(String).join(' '));
        });

        console.info = vi.fn((...args) => {
            this.infos.push(args.map(String).join(' '));
        });
    }

    /**
     * Stop capturing and restore original console
     */
    stop(): void {
        // Restore original console methods
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
    }

    /**
     * Reset the captured logs
     */
    reset(): void {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.infos = [];
    }

    /**
     * Get all captured logs
     */
    getLogs(): string[] {
        return [...this.logs];
    }

    /**
     * Get all captured errors
     */
    getErrors(): string[] {
        return [...this.errors];
    }

    /**
     * Get all captured warnings
     */
    getWarnings(): string[] {
        return [...this.warnings];
    }

    /**
     * Get all captured info messages
     */
    getInfos(): string[] {
        return [...this.infos];
    }

    /**
     * Check if a specific message was logged
     */
    hasLog(messagePattern: string | RegExp): boolean {
        return this.logs.some(log =>
            typeof messagePattern === 'string'
                ? log.includes(messagePattern)
                : messagePattern.test(log)
        );
    }

    /**
     * Check if a specific error was logged
     */
    hasError(messagePattern: string | RegExp): boolean {
        return this.errors.some(error =>
            typeof messagePattern === 'string'
                ? error.includes(messagePattern)
                : messagePattern.test(error)
        );
    }
}

/**
 * A utility to simulate async errors and verify proper error handling
 */
export class ErrorSimulator {
    /**
     * Simulate a file system error
     */
    static simulateFileSystemError(mockFn: ReturnType<typeof vi.fn>, errorMessage: string): void {
        mockFn.mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
    }

    /**
     * Simulate a specific configuration error
     */
    static simulateConfigError(mockFn: ReturnType<typeof vi.fn>, code: ConfigErrorCode, message: string): void {
        mockFn.mockImplementationOnce(() => {
            throw new ConfigurationError(message, code);
        });
    }

    /**
     * Simulate a malformed JSON error
     */
    static simulateMalformedJsonError(mockFn: ReturnType<typeof vi.fn>): void {
        mockFn.mockImplementationOnce(() => {
            return '{ invalid: json: format: }';
        });
    }

    /**
     * Simulate a timeout error
     */
    static simulateTimeoutError(mockFn: ReturnType<typeof vi.fn>): void {
        mockFn.mockImplementationOnce(() => {
            throw new Error('Timeout error');
        });
    }
}

/**
 * A robust implementation of configuration retrieval for testing
 * that doesn't depend on VS Code API
 */
export class TestConfigLoader {
    private configFiles: Map<string, any> = new Map();
    private vscodeSettings: Record<string, any> = {};

    /**
     * Add a mock config file
     */
    addConfigFile(path: string, content: any): void {
        this.configFiles.set(path, content);
    }

    /**
     * Set VS Code settings
     */
    setVSCodeSettings(settings: Record<string, any>): void {
        this.vscodeSettings = settings;
    }

    /**
     * Get configuration source for a path (for testing)
     */
    getConfigSource(filePath: string): ConfigSource {
        const dir = path.dirname(filePath);

        // Check if any config file exists in the path or parent paths
        for (const configPath of this.configFiles.keys()) {
            if (configPath.startsWith(dir) || dir.startsWith(path.dirname(configPath))) {
                const config = this.configFiles.get(configPath);
                if (this.hasPlugin(config)) {
                    return ConfigSource.PROJECT;
                }
            }
        }

        return ConfigSource.VSCODE;
    }

    /**
     * Check if a configuration has the oldfashioned plugin
     */
    private hasPlugin(config: any): boolean {
        if (!config || !config.plugins) {
            return false;
        }

        return config.plugins.some((plugin: string) =>
            plugin.includes('oldfashioned') || plugin.includes('stylelint-oldfashioned-order')
        );
    }
}

/**
 * A helper to run a test block with proper error handling and cleanup
 */
export async function runSafeTest(
    testFn: () => Promise<void> | void,
    cleanup?: () => Promise<void> | void
): Promise<void> {
    try {
        await testFn();
    } catch (error) {
        console.error('Test error:', error);
        throw error;
    } finally {
        if (cleanup) {
            try {
                await cleanup();
            } catch (cleanupError) {
                console.error('Error during test cleanup:', cleanupError);
            }
        }
    }
}
