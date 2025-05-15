// Import property group definitions - only import what's needed
import { DEFAULT_PROPERTY_GROUPS } from './index';

// Update SortingStrategy type to remove 'grouped' and 'custom'
export type SortingStrategy = 'alphabetical' | 'concentric' | 'idiomatic';

/**
 * Interface for sorting options
 */
export interface SortingOptions {
    strategy: SortingStrategy;
    emptyLinesBetweenGroups: boolean;
    sortPropertiesWithinGroups: boolean;
}

/**
 * Interface for sorting result
 */
export interface SortingResult {
    success: boolean;
    sortedProperties?: string[];
    error?: string;
}

// Define common vendor prefixes
const VENDOR_PREFIXES = [
    '-webkit-',
    '-moz-',
    '-ms-',
    '-o-'
];

// Create a cache for sorted results
const sortingCache = new Map<string, string[]>();

// Define concentric property order - use the one from index.ts
import { CONCENTRIC_PROPERTY_GROUPS, IDIOMATIC_PROPERTY_GROUPS } from './index';

/**
 * Sort properties based on the chosen strategy
 * 
 * @param properties - Array of properties to sort
 * @param options - Sorting options
 * @returns Object with success flag and sorted properties
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
    try {
        // Default to alphabetical now that grouped is removed
        const strategy = options.strategy || 'alphabetical';
        console.log(`Sorting with strategy: ${strategy}, properties count: ${properties.length}`);

        let sortedProperties: string[] = [];

        switch (strategy) {
            case 'alphabetical':
                // For alphabetical sorting, use direct array sort
                sortedProperties = [...properties].sort((a, b) => a.localeCompare(b));
                console.log('Alphabetical sorting applied, no groups');
                break;
            case 'concentric':
                sortedProperties = sortByGroups(properties, CONCENTRIC_PROPERTY_GROUPS, !!options.sortPropertiesWithinGroups);
                break;
            case 'idiomatic':
                sortedProperties = sortByGroups(properties, IDIOMATIC_PROPERTY_GROUPS, !!options.sortPropertiesWithinGroups);
                break;
            default:
                // Default to alphabetical if the strategy isn't recognized
                sortedProperties = [...properties].sort((a, b) => a.localeCompare(b));
        }

        return {
            success: true,
            sortedProperties
        };
    } catch (error) {
        console.error('Error sorting properties:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Sort properties alphabetically
 * 
 * @param properties - Array of properties to sort
 * @returns Sorted properties
 */
function sortAlphabetically(properties: string[]): string[] {
    return properties.slice().sort();
}

/**
 * Sort properties by predefined groups
 * 
 * @param properties - Array of properties to sort
 * @param groups - Property groups for sorting
 * @param sortWithinGroups - Whether to sort properties within groups
 * @returns Sorted properties with empty line markers
 */
function sortByGroups(properties: string[], groups: string[][], sortWithinGroups: boolean): string[] {
    const sorted: string[] = [];
    for (const group of groups) {
        const groupProperties = properties.filter(prop => group.includes(prop));
        if (sortWithinGroups) {
            sorted.push(...sortAlphabetically(groupProperties));
        } else {
            sorted.push(...groupProperties);
        }
    }
    return sorted;
}

/**
 * Enhanced sorting function that adapts to different property types
 * and provides additional flexibility in handling different CSS contexts
 * 
 * @param properties Array of CSS property names to sort
 * @param options Sorting configuration options
 * @param context Optional context information for adaptive sorting
 * @returns SortingResult with sorted properties
 */
export function adaptiveSortProperties(
    properties: string[],
    options: SortingOptions,
    context?: { parentType?: string; isNested?: boolean }
): SortingResult {
    // Adaptive sorting logic based on context
    if (context?.isNested) {
        options.strategy = 'idiomatic';
    } else if (context?.parentType === 'flex' || context?.parentType === 'grid') {
        options.strategy = 'concentric';
    } else {
        options.strategy = 'alphabetical';
    }

    return sortProperties(properties, options);
}

/**
 * Performance-optimized sorting function that uses caching
 * to avoid re-sorting identical property lists with the same options
 * 
 * @param properties Array of CSS property names to sort
 * @param options Sorting configuration options
 * @returns SortingResult with sorted properties
 */
export function sortPropertiesWithCache(properties: string[], options: SortingOptions): SortingResult {
    try {
        // Create cache key from properties and options
        const cacheKey = JSON.stringify({
            props: properties.slice().sort(), // Sort for consistent key regardless of input order
            opts: options
        });

        // Check if we have cached results
        if (sortingCache.has(cacheKey)) {
            const cachedResult = sortingCache.get(cacheKey);
            // Fix the potentially undefined value
            return {
                success: true,
                sortedProperties: cachedResult ? [...cachedResult] : []
            };
        }

        // If not in cache, sort using standard function
        const result = sortProperties(properties, options);

        // Cache successful results
        if (result.success && result.sortedProperties) {
            sortingCache.set(cacheKey, [...result.sortedProperties]);
        }

        return result;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}