/**
 * Stylelint Configuration Loader
 * 
 * This module handles loading stylelint configurations from various sources
 * and merging them with the VS Code extension settings.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SortingOptions } from '@old-fashioned/shared';

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
interface ConfigFileDetails {
    path: string;
    exists: boolean;
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
                            const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                            if (packageJson.stylelint) {
                                return { path: filePath, exists: true };
                            }
                        } catch (error) {
                            console.error('Error reading package.json:', error);
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
        console.error('Error finding stylelint config:', error);
        return null;
    }
}

/**
 * Check if a stylelint configuration includes oldschool-order plugin
 * 
 * @param configPath - Path to the stylelint configuration file
 * @returns True if the configuration includes oldschool-order plugin
 */
export function hasOldschoolOrderPlugin(configPath: string): boolean {
    try {
        if (configPath.endsWith('.js')) {
            // We can't directly require JS files in VS Code extension
            // This would need a more complex solution involving worker processes
            // For now, assume it might contain the plugin
            return true;
        }

        // For JSON/YAML files or package.json
        let config;
        const content = fs.readFileSync(configPath, 'utf8');

        if (configPath.endsWith('package.json')) {
            const packageJson = JSON.parse(content);
            config = packageJson.stylelint;
        } else if (configPath.endsWith('.json') || configPath.endsWith('.stylelintrc')) {
            config = JSON.parse(content);
        } else {
            // YAML parsing would need a dependency - for now assume it might have the plugin
            return true;
        }

        if (!config) {
            return false;
        }

        // Check for the plugin in the config
        return (
            Array.isArray(config.plugins) &&
            (
                config.plugins.includes('stylelint-oldschool-order') ||
                config.plugins.some((p: string) => p.includes('oldschool'))
            )
        );

    } catch (error) {
        console.error('Error checking for oldschool-order plugin:', error);
        return false;
    }
}

/**
 * Get the sorting options for the given document, considering project configurations
 * 
 * @param document - The document to get configuration for
 * @returns The sorting options with information about their source
 */
export function getDocumentSortingOptions(document: vscode.TextDocument): ConfigWithSource {
    // Get the VS Code extension settings first as default
    const vscodeSettings = vscode.workspace.getConfiguration('oldFashioned');

    // Safely access configuration settings with fallbacks
    const strategy = vscodeSettings && typeof vscodeSettings.get === 'function'
        ? vscodeSettings.get('sortingStrategy', 'grouped')
        : 'grouped';

    const emptyLinesBetweenGroups = vscodeSettings && typeof vscodeSettings.get === 'function'
        ? vscodeSettings.get('emptyLinesBetweenGroups', true)
        : true;

    const sortPropertiesWithinGroups = vscodeSettings && typeof vscodeSettings.get === 'function'
        ? vscodeSettings.get('sortPropertiesWithinGroups', true)
        : true;

    const defaultOptions: SortingOptions = {
        strategy: strategy as any,
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

    if (configDetails && configDetails.exists) {
        const hasPlugin = hasOldschoolOrderPlugin(configDetails.path);

        // If project config has the plugin, it takes precedence over VS Code settings
        if (hasPlugin) {
            console.log(`Project configuration found at ${configDetails.path} with oldschool-order plugin`);

            // In a real implementation, we would parse the stylelint config
            // For now, we'll simulate extracting the strategy and options
            // by reading the file and checking for strategy settings
            try {
                const content = fs.readFileSync(configDetails.path, 'utf8');
                let projectOptions = { ...defaultOptions };

                // Attempt to extract plugin configuration
                if (content.includes('"strategy"') || content.includes("'strategy'")) {
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
