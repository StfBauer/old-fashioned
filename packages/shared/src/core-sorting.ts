/**
 * Core sorting functionality that dispatches to specific strategies
 */
import { SortingOptions, SortingResult, SortingStrategy } from './types';
import { sortAlphabetically, optimizedAlphabeticalSort } from './strategies/alphabetical';
import { sortByGroups, optimizedGroupedSort } from './strategies/grouped';
import { sortByConcentricOrder, optimizedConcentricSort } from './strategies/concentric';
import { sortByIdiomatic } from './strategies/idiomatic';
import { extractAndSortCssVariables, mergeCssVariablesWithProperties } from './css-variables';
import { processNestedRules } from './nested-rules';
import { propertyCache, generateCacheKey } from './caching';
import { DEFAULT_PROPERTY_GROUPS, IDIOMATIC_PROPERTY_GROUPS } from './property-groups';

/**
 * Debug logging function (can be enabled/disabled)
 */
function debugLog(message: string, data: any): void {
    // Uncomment to enable debug logging
    // console.log(`[DEBUG] ${message}:`, JSON.stringify(data, null, 2));
}

/**
 * Main sorting function that accepts various strategies
 * - alphabetical: sorts properties alphabetically
 * - grouped: sorts by logical groups (position, layout, visual, etc.)
 * - concentric: sorts from outside in (position → margin → padding → etc.)
 * - idiomatic: sorts using Nicolas Gallagher's Idiomatic CSS principles
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
    try {
        // Special handling for CSS variables - extract them first
        const { cssVariables: sortedCssVariables, nonVariableProps } =
            extractAndSortCssVariables(properties);

        // Process the remaining properties according to the selected strategy
        const sortedResult = (() => {
            switch (options.strategy) {
                case 'alphabetical':
                    return sortAlphabetically(nonVariableProps);
                case 'grouped':
                    // Use optimized grouped sort for all grouped sorting
                    return optimizedGroupedSort(nonVariableProps, DEFAULT_PROPERTY_GROUPS, options);
                case 'concentric':
                    return sortByConcentricOrder(nonVariableProps);
                case 'idiomatic':
                    return sortByIdiomatic(nonVariableProps, options);
                case 'custom':
                    if (!options.propertyGroups) {
                        return {
                            success: false,
                            error: 'Custom strategy requires propertyGroups option'
                        };
                    }
                    return optimizedGroupedSort(nonVariableProps, options.propertyGroups, options);
                default:
                    return {
                        success: false,
                        error: `Unknown strategy: ${options.strategy}`
                    };
            }
        })();

        // Process nested rules if applicable
        const context = { nestingLevel: 0, parentType: 'root', isAtRule: false };
        let sortedProperties = sortedResult.sortedProperties || [];

        sortedProperties = processNestedRules(sortedProperties, options, context);

        // Place CSS variables at the beginning of the sorted properties
        if (sortedCssVariables.length > 0) {
            sortedProperties = mergeCssVariablesWithProperties(sortedCssVariables, sortedProperties);
        }

        return {
            ...sortedResult,
            sortedProperties
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during sorting'
        };
    }
}

/**
 * Sort properties with caching for better performance
 */
export function sortPropertiesWithCache(properties: string[], options: SortingOptions): SortingResult {
    // Generate a cache key
    const cacheKey = generateCacheKey(properties, options.strategy);

    // Check if we have a cached result
    const cachedResult = propertyCache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    // Sort properties
    const result = sortProperties(properties, options);

    // Cache the result
    propertyCache.set(cacheKey, result);

    return result;
}

/**
 * Adaptively choose the best sorting algorithm based on property count
 */
export function adaptiveSortProperties(properties: string[], options: SortingOptions): SortingResult {
    // For small property sets, use simple algorithms
    if (properties.length < 10) {
        return sortProperties(properties, options);
    }

    // For larger sets, use cached results when possible
    return sortPropertiesWithCache(properties, options);
}
