/**
 * CSS Formatting utilities
 * 
 * This module contains functions to format CSS code
 */

import * as vscode from 'vscode';

/**
 * Add empty lines between groups of CSS properties
 * 
 * @param cssText - The CSS text to format
 * @param strategy - The sorting strategy used
 * @returns The formatted CSS text with appropriate spacing between groups
 */
export function addEmptyLinesBetweenGroups(cssText: string, strategy: string): string {
    // First, parse the CSS into lines and remove duplicate blank lines
    const lines = cssText.split('\n');
    const cleanedLines: string[] = [];

    // Remove all blank lines first
    for (const line of lines) {
        if (line.trim() !== '' || cleanedLines.length === 0 || cleanedLines[cleanedLines.length - 1].trim() !== '') {
            cleanedLines.push(line);
        }
    }

    // Process the cleaned lines to add exactly one blank line between groups
    const result: string[] = [];
    let inCustomProps = false;
    let inScssVars = false;

    for (let i = 0; i < cleanedLines.length; i++) {
        const line = cleanedLines[i];
        const trimmed = line.trim();

        // Check for property type
        const isCustomProp = trimmed.match(/^\s*--[a-zA-Z0-9-_]+\s*:/);
        const isScssVar = trimmed.match(/^\s*\$[a-zA-Z0-9-_]+\s*:/);

        // Check for transitions between groups
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

    // Add debug marker and return
    return `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${strategy}) */\n${result.join('\n')}`;
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