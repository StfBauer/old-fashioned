import { SortingOptions, SortingResult } from './types';
import {
    DEFAULT_PROPERTY_GROUPS,
    CONCENTRIC_PROPERTY_ORDER,
    RATIONAL_ORDER_GROUPS,
    IDIOMATIC_ORDER_GROUPS
} from './property-groups';
import {
    sortAlphabetically as importedSortAlphabetically,
    hashMapSort as importedHashMapSort,
    sortByGroups as importedSortByGroups
} from './sorting';

/**
 * Optimized CSS property sorting implementation that adapts based on:
 * 1. Input size (property count)
 * 2. Strategy selected (grouped, alphabetical, concentric, etc.)
 * 3. Whether advanced features like empty lines are needed
 * 
 * Based on benchmark results, this optimizes for each use case.
 */
export function sortCssProperties(
    properties: string[],
    options: SortingOptions
): SortingResult {
    try {
        // Step 1: Select appropriate strategy groups based on user preference
        const propertyGroups = determinePropertyGroups(options);

        // Step 2: Select optimal algorithm based on property count and feature needs
        const algorithm = selectOptimalAlgorithm(
            properties.length,
            options.algorithm,
            !!options.emptyLinesBetweenGroups
        );

        // Step 3: Apply the sorting using the selected strategy and algorithm
        return applySorting(properties, propertyGroups, options, algorithm);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during sorting'
        };
    }
}

/**
 * Determine which property groups to use based on the strategy
 */
function determinePropertyGroups(options: SortingOptions): string[][] {
    switch (options.strategy) {
        case 'grouped':
            return DEFAULT_PROPERTY_GROUPS;
        case 'concentric':
            return formatForConcentric(CONCENTRIC_PROPERTY_ORDER);
        case 'rational-order':
            return RATIONAL_ORDER_GROUPS;
        case 'idiomatic-order':
            return IDIOMATIC_ORDER_GROUPS;
        case 'custom':
            return options.propertyGroups || DEFAULT_PROPERTY_GROUPS;
        default:
            // Alphabetical doesn't use groups, but we still need to return something
            return [];
    }
}

/**
 * Select the optimal algorithm based on benchmark insights
 * - HashMap is best for medium-large files (over 100 properties)
 * - Standard works well for tiny files (under 20 properties)
 * - If empty lines are needed, we must use standard approach
 */
function selectOptimalAlgorithm(
    propertyCount: number,
    requestedAlgorithm?: string,
    needsEmptyLines?: boolean
): 'standard' | 'hashmap' | 'radix' {
    // Explicit algorithm request overrides automatic selection
    if (requestedAlgorithm === 'standard' || requestedAlgorithm === 'radix') {
        return requestedAlgorithm;
    }

    // Empty lines require standard approach
    if (needsEmptyLines) {
        return 'standard';
    }

    // For very small files, standard sort has less overhead
    if (propertyCount <= 20) {
        return 'standard';
    }

    // For larger files, hashmap is significantly faster
    return 'hashmap';
}

/**
 * Apply the selected sorting approach
 */
function applySorting(
    properties: string[],
    propertyGroups: string[][],
    options: SortingOptions,
    algorithm: 'standard' | 'hashmap' | 'radix'
): SortingResult {
    // Handle special case for alphabetical sorting
    if (options.strategy === 'alphabetical') {
        return importedSortAlphabetically(properties, algorithm);
    }

    // For all other strategies with groups
    if (algorithm === 'hashmap' && !options.emptyLinesBetweenGroups) {
        // Fast path: Use the most efficient implementation for larger files
        const sortedProps = importedHashMapSort(properties, propertyGroups);

        return {
            success: true,
            originalProperties: properties,
            sortedProperties: sortedProps
        };
    } else {
        // Standard path: Supports all features including empty lines
        return importedSortByGroups(properties, propertyGroups, options);
    }
}

/**
 * Format the concentric order array into groups for more efficient hashmap processing
 */
function formatForConcentric(flatOrder: string[]): string[][] {
    // Group properties by category (e.g., position, display, etc.)
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    let lastCategory = '';

    for (const prop of flatOrder) {
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

// Include specialized implementations for each algorithm
// ... implementations of sortAlphabetically, sortByGroups, hashMapSort ...
