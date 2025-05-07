/**
 * Main exports for the shared library
 */

// Import specific components we want to re-export
import { SortingOptions, SortingResult } from './types';
import {
    DEFAULT_PROPERTY_GROUPS,
    RATIONAL_ORDER_GROUPS,
    IDIOMATIC_ORDER_GROUPS,
    CONCENTRIC_PROPERTY_ORDER
} from './property-groups';
import { sortProperties, sortAlphabetically, sortByGroups } from './sorting';
import { sortCssProperties } from './sorting-engine';

// Export types
export * from './types';

// Export specific functions and constants
export {
    // Sorting functions
    sortProperties,
    sortAlphabetically,
    sortByGroups,
    sortCssProperties,

    // Property groups
    DEFAULT_PROPERTY_GROUPS,
    RATIONAL_ORDER_GROUPS,
    IDIOMATIC_ORDER_GROUPS,
    CONCENTRIC_PROPERTY_ORDER
};

/**
 * Convert concentric order array into groups for more efficient processing
 */
export function formatConcentric(): string[][] {
    // Group properties by category (e.g., position, display, etc.)
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    let lastCategory = '';

    for (const prop of CONCENTRIC_PROPERTY_ORDER) {
        // Extract category from property name (e.g., "position" from "position-top")
        const category = prop.split('-')[0];

        if (category !== lastCategory && currentGroup.length > 0) {
            groups.push([...currentGroup]);
            currentGroup = [];
        }

        currentGroup.push(prop);
        lastCategory = category;
    }

    // Add the last group
    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}