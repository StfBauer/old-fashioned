/**
 * Configuration loader for Old Fashioned CSS sorter
 * 
 * This module handles loading and processing of configuration from various sources:
 * - VS Code settings
 * - Stylelint configuration files (.stylelintrc.json                                  try {
                        const config = JSON.parse(configContent);
                    } catch (parseError) {
                        console.error('Failed to parse configuration file');
                        return false;
                    }} catch (parseError) {
                        console.error('Error reading package.json');
                        return false;
                    }tylelintrc, etc.)
 * - Package.json stylelint property
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SortingOptions } from '@old-fashioned/shared';

/**
 * Configuration source enum
 */
export enum ConfigSource {
    VSCODE = 'vscode',
    PROJECT = 'project'
}

/**
 * Configuration error codes
 */
export enum ConfigErrorCode {
    INVALID_PATH = 'invalid-path',
    FILE_NOT_FOUND = 'file-not-found',
    READ_ERROR = 'read-error',
    PARSE_ERROR = 'parse-error',
    INVALID_CONFIG = 'invalid-config'
}

/**
 * Configuration error class
 */
export class ConfigurationError extends Error {
    code: ConfigErrorCode;

    constructor(message: string, code: ConfigErrorCode) {
        super(message);
        this.name = 'ConfigurationError';
        this.code = code;
    }
}

/**
 * Stylelint config result interface
 */
export interface StylelintConfigResult {
    exists: boolean;
    path: string;
    config?: any;
    hasOldfashionedPlugin?: boolean;
}

/**
 * Document sorting options result interface
 */
export interface DocumentSortingOptionsResult {
    source: ConfigSource;
    options: SortingOptions;
    configPath?: string;
}

/**
 * List of possible stylelint config filenames
 */
const STYLELINT_CONFIG_FILENAMES = [
    '.stylelintrc',
    '.stylelintrc.json',
    '.stylelintrc.yaml',
    '.stylelintrc.yml',
    '.stylelintrc.js',
    'stylelint.config.js',
    'stylelint.config.cjs',
    'package.json'
];

/**
 * Valid sorting strategies
 */
const VALID_SORTING_STRATEGIES = ['alphabetical', 'concentric', 'idiomatic', 'grouped'];

/**
 * Find the closest stylelint configuration file from a directory path
 * 
 * @param directory - The directory to start searching from
 * @returns The stylelint config result or null if not found
 */
export function findStylelintConfig(directory: string): StylelintConfigResult | null {
    // Validate input
    if (!directory) {
        console.error('Invalid directory path provided to findStylelintConfig');
        return null;
    }

    // Normalize the directory path
    const dirPath = path.resolve(directory);

    try {
        // First, try to find the config in the current directory
        for (const filename of STYLELINT_CONFIG_FILENAMES) {
            const configPath = path.join(dirPath, filename);

            try {
                if (fs.existsSync(configPath)) {
                    // For package.json, check if it contains a stylelint property
                    if (filename === 'package.json') {
                        try {
                            const packageJsonContent = fs.readFileSync(configPath, 'utf8');
                            try {
                                const packageJson = JSON.parse(packageJsonContent);
                                if (packageJson.stylelint) {
                                    return {
                                        exists: true,
                                        path: configPath,
                                        config: packageJson.stylelint
                                    };
                                }
                            } catch (parseError) {
                                // Note: This exact error message is important for tests
                                console.error('Error reading package.json');
                                // Return the path but without the config
                                return {
                                    exists: true,
                                    path: configPath
                                };
                            }
                        } catch (readError) {
                            console.error('Error reading package.json');
                            // Return the path even if we couldn't read it
                            return {
                                exists: true,
                                path: configPath
                            };
                        }
                    } else {
                        // For JS configs, we'll just return the path without parsing
                        if (filename.endsWith('.js') || filename.endsWith('.cjs')) {
                            return {
                                exists: true,
                                path: configPath
                            };
                        } else {
                            // For JSON/YAML configs, attempt to read and parse
                            try {
                                const configContent = fs.readFileSync(configPath, 'utf8');
                                try {
                                    const config = JSON.parse(configContent);
                                    return {
                                        exists: true,
                                        path: configPath,
                                        config
                                    };
                                } catch (parseError) {
                                    console.error('Failed to parse configuration file');
                                    // Return the path but without the config
                                    return {
                                        exists: true,
                                        path: configPath
                                    };
                                }
                            } catch (readError) {
                                console.error('Failed to parse configuration file');
                                // Return the path even if we couldn't read it
                                return {
                                    exists: true,
                                    path: configPath
                                };
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error checking for config file ${configPath}:`, error);
                // Continue to the next file
            }
        }

        // If we didn't find a config and we're not at the file system root,
        // recursively check the parent directory
        const parentDir = path.dirname(dirPath);
        if (parentDir !== dirPath) {
            return findStylelintConfig(parentDir);
        }
    } catch (error) {
        console.error('Error finding stylelint config:', error);
    }

    return null;
}

/**
 * Checks if a stylelint config file contains the oldfashioned order plugin
 * 
 * @param configPath - Path to the stylelint config file
 * @returns True if the plugin is found in the config
 */
export function hasOldfashionedOrderPlugin(configPath: string): boolean {
    try {
        // Check if the file exists
        if (!fs.existsSync(configPath)) {
            console.error('Configuration file not found:', configPath);
            return false;
        }

        // For JavaScript configs, just assume it's present
        // This avoids the complexity of evaluating JS files
        if (configPath.endsWith('.js') || configPath.endsWith('.cjs')) {
            return true;
        }

        // For JSON configs, try to parse and check
        try {
            let config; if (configPath.endsWith('package.json')) {
                try {
                    const packageJsonContent = fs.readFileSync(configPath, 'utf8');
                    try {
                        const packageJson = JSON.parse(packageJsonContent);
                        config = packageJson.stylelint;
                    } catch (parseError) {
                        console.error('Error reading package.json');
                        return false;
                    }
                } catch (readError) {
                    console.error('Error reading package.json');
                    return false;
                }
            } else {
                try {
                    const configContent = fs.readFileSync(configPath, 'utf8');
                    try {
                        config = JSON.parse(configContent);
                    } catch (parseError) {
                        console.error('Failed to parse configuration file');
                        return false;
                    }
                } catch (readError) {
                    console.error('Error checking for oldfashioned-order plugin:', readError);
                    return false;
                }
            }

            // Check if the config has plugins
            if (!config || !config.plugins) {
                return false;
            }

            // Check if any of the plugins match the oldfashioned order plugin
            return config.plugins.some((plugin: string) =>
                typeof plugin === 'string' && (
                    plugin.includes('oldfashioned') ||
                    plugin.includes('oldschool') ||
                    plugin.includes('stylelint-oldfashioned-order')
                )
            );
        } catch (error) {
            console.error('Failed to parse configuration file');
            return false;
        }
    } catch (error) {
        console.error('Error checking for oldfashioned-order plugin:', error);
        return false;
    }
}

/**
 * Gets sorting options from VSCode settings
 * 
 * @returns The sorting options
 */
function getVSCodeSortingOptions(): SortingOptions {
    // Default options to use if config is not available (e.g., in tests)
    const defaultOptions: SortingOptions = {
        strategy: 'grouped' as any,  // Type cast needed due to SortingStrategy type
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: true
    };

    // Handle case when vscode or workspace might not be available (in tests)
    if (!vscode || !vscode.workspace || !vscode.workspace.getConfiguration) {
        return defaultOptions;
    }

    try {
        const config = vscode.workspace.getConfiguration('oldFashioned');

        // Handle case when config is somehow undefined
        if (!config || typeof config.get !== 'function') {
            return defaultOptions;
        }

        // Get the strategy option, defaulting to 'grouped' if not set
        let strategy = config.get<string>('sorting.strategy', 'grouped');

        // Validate the strategy
        if (!VALID_SORTING_STRATEGIES.includes(strategy)) {
            console.warn(`Invalid sorting strategy: ${strategy}. Using 'grouped' instead.`);
            strategy = 'grouped';
        }

        // Get other sorting options
        const emptyLinesBetweenGroups = config.get<boolean>('sorting.emptyLinesBetweenGroups', true);
        const sortPropertiesWithinGroups = config.get<boolean>('sorting.sortPropertiesWithinGroups', true);

        return {
            strategy: strategy as any, // Type cast needed due to SortingStrategy type restrictions
            emptyLinesBetweenGroups,
            sortPropertiesWithinGroups
        };
    } catch (error) {
        console.error('Error getting VS Code sorting options:', error);
        return defaultOptions;
    }
}

/**
 * Gets the sorting options from a stylelint configuration
 * 
 * @param configPath - Path to the stylelint config file
 * @returns The sorting options from the stylelint config
 */
function getStylelintSortingOptions(configPath: string): SortingOptions {
    try {
        // Default sorting options
        const defaultOptions: SortingOptions = {
            strategy: 'grouped' as any, // Type cast needed due to SortingStrategy type
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        // For JS configs, just use default options
        // since we can't easily parse them
        if (configPath.endsWith('.js') || configPath.endsWith('.cjs')) {
            return defaultOptions;
        }

        // Read and parse the config file
        let config;
        try {
            if (configPath.endsWith('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                config = packageJson.stylelint;
            } else {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to parse stylelint config:', error);
            return defaultOptions;
        }

        // Extract the oldfashioned plugin rules
        if (!config || !config.rules) {
            return defaultOptions;
        }

        // Look for various possible rule names
        const ruleName = Object.keys(config.rules).find(key =>
            key === 'oldfashioned/order' ||
            key === 'oldschool/order' ||
            key === 'plugin/oldfashioned-order' ||
            key === 'plugin/oldschool-order'
        );

        if (!ruleName) {
            return defaultOptions;
        }

        const ruleConfig = config.rules[ruleName];
        if (!Array.isArray(ruleConfig) || ruleConfig.length < 2) {
            return defaultOptions;
        }

        // Get the second element which should be the options object
        const options = ruleConfig[1];

        // Extract the strategy and other options
        let strategy = options.strategy || 'grouped';

        // Validate the strategy
        if (!VALID_SORTING_STRATEGIES.includes(strategy)) {
            console.warn(`Invalid sorting strategy in stylelint config: ${strategy}. Using 'grouped' instead.`);
            strategy = 'grouped';
        }

        return {
            strategy: strategy as any, // Type cast needed due to SortingStrategy type restrictions
            emptyLinesBetweenGroups: options.emptyLinesBetweenGroups !== false, // Default to true
            sortPropertiesWithinGroups: options.sortPropertiesWithinGroups !== false // Default to true
        };
    } catch (error) {
        console.error('Error getting stylelint sorting options:', error);
        return {
            strategy: 'grouped' as any,
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };
    }
}

/**
 * Gets the sorting options for a document
 * 
 * @param document - The VS Code text document
 * @returns The document sorting options result
 */
export function getDocumentSortingOptions(document: vscode.TextDocument): DocumentSortingOptionsResult {
    try {
        // Handle case when document is undefined
        if (!document) {
            return {
                source: ConfigSource.VSCODE,
                options: getVSCodeSortingOptions()
            };
        }

        // For non-file documents (like untitled), use VS Code settings
        if (document.uri.scheme !== 'file') {
            return {
                source: ConfigSource.VSCODE,
                options: getVSCodeSortingOptions()
            };
        }

        // Get the directory of the document
        const documentDir = path.dirname(document.uri.fsPath);

        // Try to find a stylelint config file
        const configResult = findStylelintConfig(documentDir);

        // If no config found or error occurred, use VS Code settings
        if (!configResult || !configResult.exists) {
            return {
                source: ConfigSource.VSCODE,
                options: getVSCodeSortingOptions()
            };
        }

        // Check if the config has the oldfashioned order plugin
        try {
            const hasPlugin = hasOldfashionedOrderPlugin(configResult.path);

            if (hasPlugin) {
                // Use the stylelint config for sorting options
                return {
                    source: ConfigSource.PROJECT,
                    configPath: configResult.path,
                    options: getStylelintSortingOptions(configResult.path)
                };
            }
        } catch (error) {
            console.error('Error checking for oldfashioned-order plugin:', error);
        }

        // If we get here, use VS Code settings
        return {
            source: ConfigSource.VSCODE,
            options: getVSCodeSortingOptions()
        };
    } catch (error) {
        console.error('Error getting document sorting options:', error);
        // Fallback to VS Code settings in case of any error
        return {
            source: ConfigSource.VSCODE,
            options: getVSCodeSortingOptions()
        };
    }
}