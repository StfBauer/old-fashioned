/**
 * CSS Formatter to add empty lines between property groups
 */

import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER, IDIOMATIC_PROPERTY_GROUPS } from '@old-fashioned/shared';
import * as vscode from 'vscode';

// Create mapping from property name to group index for different strategies
const groupedPropertyMap = new Map<string, number>();
DEFAULT_PROPERTY_GROUPS.forEach((group, index) => {
    group.forEach(prop => {
        groupedPropertyMap.set(prop.toLowerCase().trim(), index);
    });
});

const idiomaticPropertyMap = new Map<string, number>();
IDIOMATIC_PROPERTY_GROUPS.forEach((group, index) => {
    group.forEach(prop => {
        idiomaticPropertyMap.set(prop.toLowerCase().trim(), index);
    });
});

// Define concentric property groups manually
// These groups follow the concentric CSS principles from outside to inside
const CONCENTRIC_GROUPED = [
    // Positioning Group
    ['position', 'top', 'right', 'bottom', 'left', 'z-index'],

    // Display & Box Model Group
    ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow', 'flex-shrink',
        'flex-basis', 'justify-content', 'align-items', 'align-content', 'order', 'float',
        'clear', 'box-sizing'],

    // Dimensions Group
    ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],

    // Margin Group
    ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],

    // Padding Group
    ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

    // Border Group
    ['border', 'border-width', 'border-style', 'border-color', 'border-top', 'border-right',
        'border-bottom', 'border-left', 'border-radius'],

    // Background Group
    ['background', 'background-color', 'background-image', 'background-repeat',
        'background-position', 'background-size'],

    // Typography Group
    ['color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height',
        'text-align', 'text-decoration', 'text-transform', 'letter-spacing'],

    // Other Visual Effects Group
    ['opacity', 'visibility', 'overflow', 'box-shadow', 'text-shadow', 'transform',
        'transition', 'animation', 'cursor', 'pointer-events', 'user-select', 'content']
];

const concentricPropertyMap = new Map<string, number>();
CONCENTRIC_GROUPED.forEach((group, index) => {
    group.forEach(prop => {
        concentricPropertyMap.set(prop.toLowerCase().trim(), index);
    });
});

// Debug logging function
const DEBUG = false;
function debugLog(message: string, ...args: any[]): void {
    if (DEBUG) {
        console.log(`[OLD-FASHIONED DEBUG] ${message}`, ...args);
    }
}

/**
 * Get the property group map based on the current sorting strategy
 */
function getPropertyGroupMap(strategy: string): Map<string, number> {
    switch (strategy) {
        case 'idiomatic':
            return idiomaticPropertyMap;
        case 'concentric':
            return concentricPropertyMap;
        case 'grouped':
        default:
            return groupedPropertyMap;
    }
}

/**
 * Adds empty lines between CSS property groups for better readability
 */
export function addEmptyLinesBetweenGroups(css: string, strategy = 'grouped'): string {
    debugLog('Adding empty lines between groups...');

    // Remove existing debug comments to prevent stacking them
    let cleanedCss = css.replace(/\/\* DEBUG: Old Fashioned formatter applied on.*?\*\/\n?/g, '');

    // Add a single debug marker comment to the top of the CSS
    const cssWithDebugMarker = `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${strategy}) */\n${cleanedCss}`;

    // Skip empty line insertion for alphabetical strategy
    if (strategy === 'alphabetical') {
        return cssWithDebugMarker;
    }

    // Get the property map based on the current sorting strategy
    const propertyGroupMap = getPropertyGroupMap(strategy);

    const lines = cssWithDebugMarker.split('\n');
    const result: string[] = [];

    let insideRule = false;
    let currentGroupIndex: number | null = null;
    let previousLineIsProperty = false;
    let emptyLineAlreadyAdded = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if entering a rule
        if (trimmed.endsWith('{')) {
            insideRule = true;
            currentGroupIndex = null;
            previousLineIsProperty = false;
            emptyLineAlreadyAdded = false;
            result.push(line);
            continue;
        }

        // Check if exiting a rule
        if (trimmed === '}') {
            insideRule = false;
            currentGroupIndex = null;
            previousLineIsProperty = false;
            emptyLineAlreadyAdded = false;
            result.push(line);
            continue;
        }

        // Handle non-property lines
        if (!insideRule || trimmed === '' || trimmed.startsWith('/*')) {
            if (trimmed === '') {
                emptyLineAlreadyAdded = true;
            } else {
                emptyLineAlreadyAdded = false;
            }

            result.push(line);
            if (trimmed !== '') {
                previousLineIsProperty = false;
            }
            continue;
        }

        // Process property declarations
        if (trimmed.includes(':')) {
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex < 0) {
                result.push(line);
                continue;
            }

            const propertyName = trimmed.substring(0, colonIndex).trim().toLowerCase();
            const groupIndex = propertyGroupMap.get(propertyName);

            // Only add an empty line when transitioning to a new property group
            // and we haven't already added an empty line
            if (previousLineIsProperty &&
                currentGroupIndex !== null &&
                groupIndex !== undefined &&
                groupIndex !== currentGroupIndex &&
                !emptyLineAlreadyAdded) {

                result.push(''); // Add only one empty line between different property groups
                emptyLineAlreadyAdded = true;
            } else {
                emptyLineAlreadyAdded = false;
            }

            // Update the current group index if this property belongs to a known group
            if (groupIndex !== undefined) {
                currentGroupIndex = groupIndex;
                previousLineIsProperty = true;
            } else {
                // For properties not in any defined group, don't change the group
                previousLineIsProperty = true;
            }
        } else {
            previousLineIsProperty = false;
            emptyLineAlreadyAdded = false;
        }

        result.push(line);
    }

    return result.join('\n');
}