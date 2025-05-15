/**
 * Stylelint Configuration Loader
 * 
 * This module handles loading stylelint configurations from various sources
 * and merging them with the VS Code extension settings.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SortingOptions, SortingStrategy } from '@old-fashioned/shared';

/**
 * Configuration source for tracking where settings came from
 */
export enum ConfigSource {
    DEFAULT = 'default',
    VSCODE = 'vscode',
    PROJECT = 'project'
}

/**
 * Combined configuration with information about its source
 */
export interface ConfigWithSource {
    options: SortingOptions;
    source: ConfigSource;
    configPath?: string;
}

/**
 * Configuration file details
 */
export interface ConfigFileDetails {
    path: string;
    exists: boolean;
}

/**
 * Interface for parsed stylelint configuration
 */
export interface StylelintConfig {
    plugins?: string[];
    rules?: Record<string, any>;
    extends?: string | string[];
}

/**
 * Interface for parsed package.json with stylelint config
 */
export interface PackageJsonWithStylelint {
    stylelint?: StylelintConfig;
    [key: string]: any;
}

/**
 * Interface for oldfashioned plugin rule configuration
 */
export interface OldfashionedOrderRule {
    strategy?: SortingStrategy;
    emptyLinesBetweenGroups?: boolean;
    sortPropertiesWithinGroups?: boolean;
    [key: string]: any;
}

/**
 * Custom error for configuration-related errors
 */
export class ConfigurationError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'ConfigurationError';
    }
}

/**
 * Error codes for configuration errors
 */
export enum ConfigErrorCode {
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    INVALID_JSON = 'INVALID_JSON',
    NO_PLUGIN = 'NO_PLUGIN',
    INVALID_CONFIG = 'INVALID_CONFIG'
}

/**
 * Default stylelint configuration file names
 */
const CONFIG_FILE_NAMES = [
    '.stylelintrc',
    '.stylelintrc.json',
    '.stylelintrc.yml',
    '.stylelintrc.yaml',
    '.stylelintrc.js',
    'stylelint.config.js',
    'package.json' // Will check for stylelint property inside
];

/**
 * Find the nearest stylelint configuration file
 * 
 * @param startDir - The directory to start searching from
 * @returns Details about the found configuration file or null
 */
export function findStylelintConfig(startDir: string): ConfigFileDetails | null {
    if (!startDir || typeof startDir !== 'string') {
        console.error('Invalid directory path provided to findStylelintConfig');
        return null;
    }

    try {
        let currentDir = startDir;

        // Check for config files in current directory and walk up
        while (currentDir) {
            for (const fileName of CONFIG_FILE_NAMES) {
                const filePath = path.join(currentDir, fileName);

                if (fs.existsSync(filePath)) {
                    // For package.json, check if it contains a stylelint property
                    if (fileName === 'package.json') {
                        try {
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            if (!fileContent) {
                                continue;
                            }

                            const packageJson = JSON.parse(fileContent) as PackageJsonWithStylelint;
                            if (packageJson.stylelint) {
                                return { path: filePath, exists: true };
                            }
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            console.error(`Error reading package.json at ${filePath}: ${errorMessage}`);

                            // Continue checking other files instead of failing completely
                            continue;
                        }
                    } else {
                        return { path: filePath, exists: true };
                    }
                }
            }

            // Stop if we've reached the filesystem root
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                break;
            }
            currentDir = parentDir;
        }

        return null;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error finding stylelint config: ${errorMessage}`);
        return null;
    }
}

/**
 * Check if a stylelint configuration includes oldfashioned-order plugin
 * 
 * @param configPath - Path to the stylelint configuration file
 * @returns True if the configuration includes oldfashioned-order plugin
 */
export function hasOldfashionedOrderPlugin(configPath: string): boolean {
    try {
        // Validate configPath before using it
        if (!configPath || typeof configPath !== 'string') {
            console.error('Invalid configuration path provided to hasOldfashionedOrderPlugin');
            return false;
        }

        if (!fs.existsSync(configPath)) {
            throw new ConfigurationError(`Configuration file not found: ${configPath}`, ConfigErrorCode.FILE_NOT_FOUND);
        }

        if (configPath.endsWith('.js')) {
            // We can't directly require JS files in VS Code extension
            // This would need a more complex solution involving worker processes
            // For now, assume it might contain the plugin
            return true;
        }

        // For JSON/YAML files or package.json
        const content = fs.readFileSync(configPath, 'utf8');
        let config: StylelintConfig | undefined;

        try {
            if (configPath.endsWith('package.json')) {
                const packageJson = JSON.parse(content) as PackageJsonWithStylelint;
                config = packageJson.stylelint;
            } else if (configPath.endsWith('.json') || configPath.endsWith('.stylelintrc')) {
                config = JSON.parse(content) as StylelintConfig;
            } else {
                // YAML parsing would need a dependency - for now assume it might have the plugin
                return true;
            }
        } catch (parseError) {
            throw new ConfigurationError(
                `Failed to parse configuration file: ${configPath}. ${parseError instanceof Error ? parseError.message : ''}`,
                ConfigErrorCode.INVALID_JSON
            );
        }

        if (!config) {
            return false;
        }

        // Check for the plugin in the config
        return (
            Array.isArray(config.plugins) &&
            config.plugins.some((plugin) =>
                typeof plugin === 'string' && (
                    plugin.includes('oldfashioned') ||
                    plugin.includes('oldschool-order') ||
                    plugin.includes('stylelint-oldfashioned-order')
                )
            )
        );

    } catch (error) {
        // Log the error with detailed information
        if (error instanceof ConfigurationError) {
            console.error(`${error.name} (${error.code}): ${error.message}`);
        } else {
            console.error('Error checking for oldfashioned-order plugin:', error);
        }
        return false;
    }
}

/**
 * Safely parse a JSON file with type checking
 * 
 * @param filePath - Path to the JSON file
 * @returns Parsed content with specified type or null on error
 */
function parseJsonFile<T>(filePath: string): T | null {
    try {
        // Validate filePath before using it
        if (!filePath || typeof filePath !== 'string') {
            console.error('Invalid file path provided to parseJsonFile');
            return null;
        }

        if (!fs.existsSync(filePath)) {
            throw new ConfigurationError(`File not found: ${filePath}`, ConfigErrorCode.FILE_NOT_FOUND);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        if (!content) {
            return null;
        }

        try {
            return JSON.parse(content) as T;
        } catch (parseError) {
            throw new ConfigurationError(
                `Invalid JSON in ${filePath}: ${parseError instanceof Error ? parseError.message : ''}`,
                ConfigErrorCode.INVALID_JSON
            );
        }
    } catch (error) {
        if (error instanceof ConfigurationError) {
            console.error(`${error.name} (${error.code}): ${error.message}`);
        } else {
            console.error(`Error parsing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
        return null;
    }
}

/**
 * Validate and convert a string to a valid SortingStrategy
 * 
 * @param strategy - The strategy string to validate
 * @returns A valid SortingStrategy
 */
function validateSortingStrategy(strategy: string | unknown): SortingStrategy {
    const validStrategies: SortingStrategy[] = ['alphabetical', 'grouped', 'concentric', 'idiomatic', 'custom'];

    if (typeof strategy === 'string' && validStrategies.includes(strategy as SortingStrategy)) {
        return strategy as SortingStrategy;
    }

    // Default to 'grouped' if invalid
    return 'grouped';
}

/**
 * Interface for VS Code settings
 */
interface OldFashionedSettings {
    'sorting.strategy': SortingStrategy;
    'sorting.emptyLinesBetweenGroups': boolean;
    'sorting.sortPropertiesWithinGroups': boolean;
}

/**
 * Get VS Code extension settings with type safety
 * 
 * @param section - The settings section to get
 * @param defaultValue - Default value if setting not found
 * @returns The setting value or default
 */
function getSetting<T>(
    section: string,
    defaultValue: T
): T {
    const settings = vscode.workspace.getConfiguration('oldFashioned');
    if (!settings || typeof settings.get !== 'function') {
        return defaultValue;
    }

    const value = settings.get<T>(section, defaultValue);
    return value;
}

/**
 * Get the sorting options for the given document, considering project configurations
 * 
 * @param document - The document to get configuration for
 * @returns The sorting options with information about their source
 */
export function getDocumentSortingOptions(document: vscode.TextDocument): ConfigWithSource {
    // Get settings using our type-safe utility
    const strategy = getSetting<string>('sorting.strategy', 'grouped');
    const emptyLinesBetweenGroups = getSetting<boolean>('sorting.emptyLinesBetweenGroups', true);
    const sortPropertiesWithinGroups = getSetting<boolean>('sorting.sortPropertiesWithinGroups', true);

    const defaultOptions: SortingOptions = {
        strategy: validateSortingStrategy(strategy),
        emptyLinesBetweenGroups,
        sortPropertiesWithinGroups
    };

    // If no document or not a file, return default settings
    if (!document || document.uri.scheme !== 'file') {
        return {
            options: defaultOptions,
            source: ConfigSource.VSCODE
        };
    }

    // Try to find project configuration
    const docDir = path.dirname(document.uri.fsPath);
    const configDetails = findStylelintConfig(docDir);

    if (configDetails && configDetails.exists && configDetails.path) {
        const hasPlugin = hasOldfashionedOrderPlugin(configDetails.path);

        // If project config has the plugin, it takes precedence over VS Code settings
        if (hasPlugin) {
            console.log(`Project configuration found at ${configDetails.path} with oldfashioned-order plugin`);            // Parse the stylelint config and extract oldfashioned-order options
            try {
                const content = fs.readFileSync(configDetails.path, 'utf8');
                let projectOptions = { ...defaultOptions };

                // Parse the configuration content based on file type
                let config: StylelintConfig | undefined;
                let oldfashionedRuleConfig: OldfashionedOrderRule | undefined;

                if (configDetails.path.endsWith('package.json')) {
                    try {
                        const packageJson = JSON.parse(content) as PackageJsonWithStylelint;
                        config = packageJson.stylelint;
                    } catch (parseError) {
                        console.error(`Error parsing package.json: ${parseError instanceof Error ? parseError.message : ''}`);
                    }
                } else if (configDetails.path.endsWith('.json') || configDetails.path.endsWith('.stylelintrc')) {
                    try {
                        config = JSON.parse(content) as StylelintConfig;
                    } catch (parseError) {
                        console.error(`Error parsing .stylelintrc: ${parseError instanceof Error ? parseError.message : ''}`);
                    }
                }

                // Extract rule configuration if available
                if (config?.rules) {
                    // Check for oldfashioned/order rule
                    const oldfashionedRule = config.rules['oldfashioned/order'];
                    if (Array.isArray(oldfashionedRule) && oldfashionedRule.length >= 2) {
                        // Extract configuration object from rule
                        oldfashionedRuleConfig = oldfashionedRule[1] as OldfashionedOrderRule;
                    }
                }

                // Apply configuration if found
                if (oldfashionedRuleConfig) {
                    if (oldfashionedRuleConfig.strategy) {
                        projectOptions.strategy = validateSortingStrategy(oldfashionedRuleConfig.strategy);
                    }

                    if (typeof oldfashionedRuleConfig.emptyLinesBetweenGroups === 'boolean') {
                        projectOptions.emptyLinesBetweenGroups = oldfashionedRuleConfig.emptyLinesBetweenGroups;
                    }

                    if (typeof oldfashionedRuleConfig.sortPropertiesWithinGroups === 'boolean') {
                        projectOptions.sortPropertiesWithinGroups = oldfashionedRuleConfig.sortPropertiesWithinGroups;
                    }
                }
                // Fallback to simple string matching if parsing fails
                else if (content.includes('"strategy"') || content.includes("'strategy'")) {
                    if (content.includes('"alphabetical"') || content.includes("'alphabetical'")) {
                        projectOptions.strategy = 'alphabetical';
                    } else if (content.includes('"concentric"') || content.includes("'concentric'")) {
                        projectOptions.strategy = 'concentric';
                    } else if (content.includes('"grouped"') || content.includes("'grouped'")) {
                        projectOptions.strategy = 'grouped';
                    }

                    // Extract other options if present
                    if (content.includes('"emptyLinesBetweenGroups"') || content.includes("'emptyLinesBetweenGroups'")) {
                        projectOptions.emptyLinesBetweenGroups = !content.includes('false');
                    }

                    if (content.includes('"sortPropertiesWithinGroups"') || content.includes("'sortPropertiesWithinGroups'")) {
                        projectOptions.sortPropertiesWithinGroups = !content.includes('false');
                    }
                }

                return {
                    options: projectOptions,
                    source: ConfigSource.PROJECT,
                    configPath: configDetails.path
                };
            } catch (error) {
                console.error('Error parsing project configuration:', error);
                // Fallback to VS Code settings on error
                return {
                    options: defaultOptions,
                    source: ConfigSource.VSCODE
                };
            }
        }
    }

    // No project config with the plugin found, use VS Code settings
    return {
        options: defaultOptions,
        source: ConfigSource.VSCODE
    };
}

// Example fix for a file loading function:
function loadConfigFile(filePath: string | undefined): string | null {
    if (!filePath) {
        // Handle undefined path gracefully
        console.error('Config file path is undefined');
        return null;
    }

    // Validate path exists before trying to use it
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    } else {
        console.warn(`Config file not found: ${filePath}`);
        return null;
    }
}

// Look for patterns like:
// - Loading configuration without checking if paths are defined
// - Using path.resolve or path.join with potentially undefined arguments
// - Reading files using fs.readFileSync without validation
