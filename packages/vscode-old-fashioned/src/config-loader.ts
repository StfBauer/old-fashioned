/**
 * Configuration loader for Old Fashioned
 * 
 * This module handles loading and processing configuration from various sources
 * including project-level stylelint configs and VS Code settings.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SortingOptions, SortingStrategy } from '@old-fashioned/shared';
import { getSortingOptions } from './utils';

/**
 * Sources for configuration
 */
export enum ConfigSource {
    VSCODE = 'vscode',
    PROJECT = 'project',
    DEFAULT = 'default'
}

/**
 * Configuration with source information
 */
export interface ConfigWithSource {
    source: ConfigSource;
    options: SortingOptions;
    configPath: string | null;
}

/**
 * Default sorting options
 */
export const DEFAULT_SORTING_OPTIONS: SortingOptions = {
    strategy: 'alphabetical', // Changed from 'grouped' to 'alphabetical'
    emptyLinesBetweenGroups: true,
    sortPropertiesWithinGroups: true
};

/**
 * Find stylelint configuration for a document
 * 
 * @param docOrPath - The document or file path to find configuration for
 * @returns The stylelint configuration and its path, or null if not found
 */
function findStylelintConfig(docOrPath: vscode.TextDocument | string): { config: any; configPath: string | null } {
    try {
        let filePath: string;

        // Handle both TextDocument and string input
        if (typeof docOrPath === 'string') {
            filePath = docOrPath;
        } else {
            // It's a TextDocument
            filePath = docOrPath.uri.fsPath;
        }

        if (!filePath) {
            return { config: null, configPath: null };
        }

        // Get directory path from file
        const dirPath = path.dirname(filePath);

        // Search for stylelint configuration files
        const stylelintConfigs = [
            '.stylelintrc',
            '.stylelintrc.json',
            '.stylelintrc.js',
            '.stylelintrc.yaml',
            '.stylelintrc.yml',
            'stylelint.config.js',
            'package.json'
        ];

        // Check each configuration file
        for (const configFile of stylelintConfigs) {
            const configPath = path.join(dirPath, configFile);

            if (fs.existsSync(configPath)) {
                if (configFile === 'package.json') {
                    // For package.json, check if it has a stylelint section
                    const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    if (packageJson.stylelint) {
                        return {
                            config: packageJson.stylelint,
                            configPath
                        };
                    }
                } else {
                    // For other config files, load the entire file
                    let config;
                    if (configFile.endsWith('.js')) {
                        // For JS files, we can't require them directly in VS Code extension
                        // We'd need a more complex solution, but for now we'll skip them
                        continue;
                    } else {
                        // For JSON and YAML files, read them as JSON
                        try {
                            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                            return {
                                config,
                                configPath
                            };
                        } catch (parseError) {
                            console.error(`Error parsing ${configFile}:`, parseError);
                        }
                    }
                }
            }
        }

        // If no config found in current directory, try parent directory (up to a limit)
        const parentDir = path.dirname(dirPath);
        if (parentDir && parentDir !== dirPath) {
            return findStylelintConfig(parentDir);
        }

        // If no config found, return null
        return { config: null, configPath: null };
    } catch (error) {
        console.error('Error finding stylelint config:', error);
        return { config: null, configPath: null };
    }
}

/**
 * Map configuration value to sorting strategy
 * 
 * @param value - Configuration value
 * @returns Sorting strategy
 */
function mapToSortingStrategy(value: string): SortingStrategy {
    // Convert to lowercase for case-insensitive matching
    const valueLower = value.toLowerCase();

    const valueMap: Record<string, SortingStrategy> = {
        alphabetical: 'alphabetical',
        concentric: 'concentric',
        outsidein: 'concentric',
        'outside-in': 'concentric',
        idiomatic: 'idiomatic',
        smacss: 'idiomatic',
    };

    return valueMap[valueLower] || 'alphabetical'; // Default to 'alphabetical'
}

/**
 * Get sorting options from a StyleLint configuration
 * 
 * @param stylelintConfig - The StyleLint configuration object
 * @returns The sorting options and the StyleLint plugin they came from, if any
 */
function getSortingOptionsFromStylelint(stylelintConfig: any): { options: SortingOptions; plugin: string | null } {
    if (!stylelintConfig) {
        return {
            options: DEFAULT_SORTING_OPTIONS,
            plugin: null
        };
    }

    // Check for various stylelint plugins that might contain sorting rules
    // First, check for our own plugin
    if (
        stylelintConfig.plugins &&
        Array.isArray(stylelintConfig.plugins) &&
        stylelintConfig.plugins.includes('stylelint-oldfashioned-order') &&
        stylelintConfig.rules &&
        stylelintConfig.rules['oldfashioned/properties-order']
    ) {
        const ruleOptions = stylelintConfig.rules['oldfashioned/properties-order'];
        let orderConfig = '';

        // Extract order configuration
        if (Array.isArray(ruleOptions) && ruleOptions.length > 0) {
            orderConfig = ruleOptions[0];
        } else if (typeof ruleOptions === 'string') {
            orderConfig = ruleOptions;
        }

        // Extract the strategy (order) from the rule
        let strategy: SortingStrategy = 'alphabetical'; // Default strategy
        if (orderConfig === 'alphabetical') {
            strategy = 'alphabetical';
        } else if (orderConfig === 'concentric' || orderConfig === 'outside-in') {
            strategy = 'concentric';
        } else if (orderConfig === 'idiomatic' || orderConfig === 'recess') {
            strategy = 'idiomatic';
        }

        return {
            options: {
                strategy,
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            },
            plugin: 'stylelint-oldfashioned-order'
        };
    }

    // Check for stylelint-order plugin
    if (
        stylelintConfig.plugins &&
        Array.isArray(stylelintConfig.plugins) &&
        stylelintConfig.plugins.includes('stylelint-order') &&
        stylelintConfig.rules &&
        stylelintConfig.rules['order/properties-order']
    ) {
        const ruleOptions = stylelintConfig.rules['order/properties-order'];
        let orderConfig = '';

        // Extract order configuration
        if (Array.isArray(ruleOptions) && ruleOptions.length > 0 && typeof ruleOptions[0] === 'string') {
            orderConfig = ruleOptions[0];
        } else if (typeof ruleOptions === 'string') {
            orderConfig = ruleOptions;
        }

        // Map the stylelint-order configuration to our strategy
        let strategy: SortingStrategy = 'alphabetical'; // Default strategy
        if (orderConfig === 'alphabetical') {
            strategy = 'alphabetical';
        } else if (orderConfig === 'concentric' || orderConfig === 'outside-in' || orderConfig === 'smacss') {
            strategy = 'concentric';
        } else if (orderConfig === 'idiomatic' || orderConfig === 'recess') {
            strategy = 'idiomatic';
        }

        return {
            options: {
                strategy,
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            },
            plugin: 'stylelint-order'
        };
    }

    // If no valid configuration is found, use default options
    return {
        options: {
            strategy: 'alphabetical', // Default strategy
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        },
        plugin: null
    };
}

/**
 * Get sorting options for a document
 * 
 * @param document - The text document
 * @returns The sorting options and information about how they were determined
 */
export function getDocumentSortingOptions(document: vscode.TextDocument): ConfigWithSource {
    try {
        // First check if there are VSCode settings defined
        const config = vscode.workspace.getConfiguration('oldFashioned');
        const vscodeSortingStrategy = config.get<string>('sorting.strategy');

        if (vscodeSortingStrategy) {
            // VSCode settings take precedence
            console.log(`Using sorting strategy from VSCode settings: ${vscodeSortingStrategy}`);
            return {
                source: ConfigSource.VSCODE,
                options: getSortingOptions(),
                configPath: 'VSCode settings'
            };
        }

        // Check for stylelint configuration in the workspace
        const stylelintResult = findStylelintConfig(document);

        if (stylelintResult && stylelintResult.config) {
            // Use the stylelint configuration
            console.log(`Using sorting configuration from stylelint at: ${stylelintResult.configPath}`);
            const optionsResult = getSortingOptionsFromStylelint(stylelintResult.config);

            return {
                source: ConfigSource.PROJECT,
                options: optionsResult.options,
                configPath: stylelintResult.configPath
            };
        }

        // Configure sorting options to match stylelint-order configuration
        const options: SortingOptions = {
            strategy: 'alphabetical', // Default strategy
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        // If no configuration was found, use defaults
        return {
            source: ConfigSource.DEFAULT,
            options,
            configPath: null
        };
    } catch (error) {
        console.error('Error getting document sorting options:', error instanceof Error ? error.message : String(error));

        // Fallback to default options
        return {
            source: ConfigSource.DEFAULT,
            options: DEFAULT_SORTING_OPTIONS,
            configPath: null
        };
    }
}
