/**
 * CSS Formatting utilities
 * 
 * This module handles the formatting of CSS code with proper spacing
 * between property groups according to the chosen sorting strategy.
 */

import * as vscode from 'vscode';
import { SortingStrategy } from '@old-fashioned/shared';

/**
 * Add empty lines between groups of CSS properties based on the chosen strategy
 * 
 * This formatter processes the sorted CSS text and inserts empty lines between
 * different logical groups of properties to improve readability.
 * 
 * @param cssText - The CSS text to format after property sorting
 * @param strategy - The sorting strategy used (alphabetical, concentric, idiomatic)
 * @param options - Additional formatting options
 * @returns The formatted CSS text with empty lines between property groups
 */
export function addEmptyLinesBetweenGroups(cssText: string, strategy: string, options?: { showDebugComments?: boolean }): string {
    console.log(`Formatting with strategy: ${strategy}`);

    // Remove any GROUP_BOUNDARY comments from the input
    cssText = cssText.replace(/\/\*\s*GROUP_BOUNDARY\s*\*\//g, '');

    // Remove debug comments
    cssText = cssText.replace(/\/\*\s*DEBUG:.*?\*\/\n/g, '');

    // First, parse the CSS into lines and remove duplicate blank lines
    const lines = cssText.split('\n');
    const cleanedLines: string[] = [];

    // Remove consecutive blank lines
    for (const line of lines) {
        if (line.trim() !== '' || cleanedLines.length === 0 || cleanedLines[cleanedLines.length - 1].trim() !== '') {
            cleanedLines.push(line);
        }
    }

    // Process the cleaned lines to add exactly one blank line between property groups
    const result: string[] = [];
    let inCustomProps = false;
    let inScssVars = false;
    let currentGroup = -1;
    let lastProperty = '';

    for (let i = 0; i < cleanedLines.length; i++) {
        const line = cleanedLines[i];
        const trimmed = line.trim();

        // Check for property type
        const isCustomProp = trimmed.match(/^\s*--[a-zA-Z0-9-_]+\s*:/);
        const isScssVar = trimmed.match(/^\s*\$[a-zA-Z0-9-_]+\s*:/);

        // Detect property groups - this is what was missing!
        const propertyMatch = trimmed.match(/^\s*([a-zA-Z-]+)\s*:/);
        if (propertyMatch && !isCustomProp && !isScssVar) {
            const property = propertyMatch[1];
            const newGroup = getPropertyGroup(property, strategy);

            // If we're changing groups and we're not at the beginning, add an empty line
            if (newGroup !== -1 && currentGroup !== -1 && newGroup !== currentGroup) {
                // Only add a line break if the last line wasn't already a blank line
                if (result.length > 0 && result[result.length - 1].trim() !== '') {
                    result.push('');
                }
            }

            if (newGroup !== -1) {
                currentGroup = newGroup;
            }

            lastProperty = property;
        }

        // Handle transitions between special property types
        if (inCustomProps && !isCustomProp && trimmed !== '' && !trimmed.startsWith('/*')) {
            // We're leaving custom props
            result.push('');
            inCustomProps = false;
        }

        if (!inScssVars && isScssVar) {
            // We're entering SCSS vars
            if (result.length > 0 && result[result.length - 1].trim() !== '') {
                result.push('');
            }
            inScssVars = true;
        } else if (inScssVars && !isScssVar && trimmed !== '' && !trimmed.startsWith('/*')) {
            // We're leaving SCSS vars
            result.push('');
            inScssVars = false;
        }

        // Update state based on current line
        if (isCustomProp) {
            inCustomProps = true;
        }

        // Add the current line
        result.push(line);
    }

    // Get the final formatted result
    const formattedResult = result.join('\n');

    // Add debug marker only if showDebugComments is true
    const showDebugComments = options?.showDebugComments === true;
    if (showDebugComments) {
        return `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${strategy}) */\n${formattedResult}`;
    }

    return formattedResult;
}

/**
 * Get the group index for a CSS property based on the selected strategy
 * 
 * This helper function determines which logical group a CSS property belongs to
 * according to the selected sorting strategy. The group index is used to decide
 * where to insert empty lines in the formatted output.
 * 
 * @param property - The CSS property name
 * @param strategy - The sorting strategy (alphabetical, concentric, idiomatic)
 * @returns The group index or -1 if not found
 */
function getPropertyGroup(property: string, strategy: string): number {
    // If we're using alphabetical sorting, there are no groups
    if (strategy === 'alphabetical') {
        return -1;
    }

    const propertyLower = property.toLowerCase();

    // Import the appropriate property groups based on strategy
    let groups: string[][];

    switch (strategy) {
        case 'concentric':
            groups = [
                // Position
                ['position', 'z-index', 'top', 'right', 'bottom', 'left'],
                // Display
                ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 'align-items', 'float', 'clear'],
                // Dimensions
                ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],
                // Margin
                ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
                // Border
                ['border', 'border-width', 'border-style', 'border-color', 'border-radius'],
                // Padding
                ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
                // Background
                ['background', 'background-color', 'background-image', 'background-position', 'background-size'],
                // Text
                ['color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align']
            ];
            break;
        case 'idiomatic':
            groups = [
                // Positioning
                ['position', 'z-index', 'top', 'right', 'bottom', 'left'],
                // Box model
                ['display', 'float', 'width', 'height', 'margin', 'padding'],
                // Borders
                ['border', 'border-width', 'border-style', 'border-color', 'border-radius'],
                // Background
                ['background', 'background-color', 'background-image', 'background-position'],
                // Typography
                ['color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align']
            ];
            break;
        default: // grouped or alphabetical
            groups = [
                // Layout
                ['display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear'],
                // Dimensions
                ['width', 'height', 'margin', 'padding'],
                // Visual
                ['background', 'border', 'color'],
                // Typography
                ['font', 'text-align', 'text-decoration', 'line-height']
            ];
    }

    // Find the group that contains this property
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].some(p => p === propertyLower || propertyLower.startsWith(p + '-'))) {
            return i;
        }
    }

    return -1;
}

/**
 * Normalize the strategy name for display
 * 
 * @param strategy - Raw strategy name from options
 * @returns Normalized strategy name
 */
function normalizeStrategyName(strategy: string): string {
    // Convert to lowercase for case-insensitive comparison
    const lowercaseStrategy = (strategy || '').toLowerCase();

    // Map to proper case/names
    switch (lowercaseStrategy) {
        case 'alphabetical':
            return 'alphabetical';
        case 'concentric':
            return 'concentric';
        case 'grouped':
            return 'grouped';
        case 'idiomatic':
            return 'idiomatic';
        case 'custom':
            return 'custom';
        default:
            return 'grouped'; // Default fallback
    }
}

/**
 * Check if a line is a custom property (CSS variable)
 * 
 * @param line - The line to check
 * @returns True if the line is a custom property declaration
 */
function isCustomProperty(line: string): boolean {
    return line.trim().match(/^\s*--[a-zA-Z0-9-_]+\s*:/) !== null;
}

/**
 * Check if a line is an SCSS variable
 * 
 * @param line - The line to check
 * @returns True if the line is an SCSS variable declaration
 */
function isScssVariable(line: string): boolean {
    return line.trim().match(/^\s*\$[a-zA-Z0-9-_]+\s*:/) !== null;
}