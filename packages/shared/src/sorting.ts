// Import property group definitions - only import what's needed
import { DEFAULT_PROPERTY_GROUPS } from './index';

// Sorting strategy types
export type SortingStrategy = 'alphabetical' | 'concentric' | 'idiomatic' | 'grouped' | 'custom';

/**
 * Interface for sorting options
 */
export interface SortingOptions {
    strategy: SortingStrategy;
    emptyLinesBetweenGroups?: boolean;
    sortPropertiesWithinGroups?: boolean;
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
                // For alphabetical sorting, handle CSS variables specially and use case-insensitive sort
                const cssVariables = properties.filter(prop => prop.startsWith('--')).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                const regularProperties = properties.filter(prop => !prop.startsWith('--')).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

                if (cssVariables.length > 0 && regularProperties.length > 0) {
                    // Place CSS variables at the beginning, then empty line, then regular properties
                    sortedProperties = [...cssVariables, '', ...regularProperties];
                } else if (cssVariables.length > 0) {
                    // Only CSS variables, no empty line needed
                    sortedProperties = cssVariables;
                } else {
                    // No CSS variables, just sort alphabetically
                    sortedProperties = regularProperties;
                }
                console.log('Alphabetical sorting applied with CSS variables handling');
                break;
            case 'concentric':
                sortedProperties = sortByGroups(properties, CONCENTRIC_PROPERTY_GROUPS, !!options.sortPropertiesWithinGroups, !!options.emptyLinesBetweenGroups);
                break;
            case 'idiomatic':
                sortedProperties = sortByGroups(properties, IDIOMATIC_PROPERTY_GROUPS, !!options.sortPropertiesWithinGroups, !!options.emptyLinesBetweenGroups);
                break;
            case 'grouped':
                sortedProperties = sortByGroups(properties, DEFAULT_PROPERTY_GROUPS, !!options.sortPropertiesWithinGroups, !!options.emptyLinesBetweenGroups);
                break;
            case 'custom':
                // Custom strategy requires propertyGroups to be provided
                if (!options.propertyGroups || !Array.isArray(options.propertyGroups)) {
                    return {
                        success: false,
                        error: 'Custom strategy requires propertyGroups option'
                    };
                }
                sortedProperties = sortByGroups(properties, options.propertyGroups, !!options.sortPropertiesWithinGroups, !!options.emptyLinesBetweenGroups);
                break;
            default:
                return {
                    success: false,
                    error: `Unknown strategy: ${strategy}`
                };
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
 * @param emptyLinesBetweenGroups - Whether to add empty lines between groups
 * @returns Sorted properties with empty line markers
 */
function sortByGroups(properties: string[], groups: string[][], sortWithinGroups: boolean, emptyLinesBetweenGroups: boolean = false): string[] {
    // First, extract CSS variables to be placed at the top
    const cssVariables = properties.filter(prop => prop.startsWith('--')).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Filter out CSS variables from the properties to be sorted by groups
    const remainingProps = properties.filter(prop => !prop.startsWith('--'));

    const sorted: string[] = [];

    // Start with CSS variables if there are any
    if (cssVariables.length > 0) {
        sorted.push(...cssVariables);
        // Only add empty line if there are regular properties to follow
        if (remainingProps.length > 0) {
            sorted.push('');
        }
    }

    // Then process the remaining properties by groups
    let lastNonEmptyGroupIndex = -1;

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const groupProperties = remainingProps.filter(prop => group.includes(prop));

        // Skip empty groups
        if (groupProperties.length === 0) continue;

        // Add empty line between groups if configured and not the first group
        if (emptyLinesBetweenGroups && lastNonEmptyGroupIndex !== -1) {
            sorted.push('');
        }

        if (sortWithinGroups) {
            sorted.push(...sortAlphabetically(groupProperties));
        } else {
            sorted.push(...groupProperties);
        }

        lastNonEmptyGroupIndex = i;
    }

    // Process unknown properties alphabetically at the end
    const knownProps = new Set();
    groups.forEach(group => group.forEach(prop => knownProps.add(prop)));
    const unknownProps = remainingProps.filter(prop => !knownProps.has(prop)).sort();

    if (unknownProps.length > 0 && lastNonEmptyGroupIndex !== -1 && emptyLinesBetweenGroups) {
        sorted.push('');
    }
    sorted.push(...unknownProps);

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