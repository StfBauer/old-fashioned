import { SortingOptions, SortingResult } from './types';
import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER } from './property-groups';

/**
 * LRU Cache for frequently sorted property sets
 */
class LRUCache<K, V> {
    private capacity: number;
    private map: Map<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined;
        const value = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            const oldestKey = this.map.keys().next().value;
            if (oldestKey !== undefined) {
                this.map.delete(oldestKey);
            }
        }
        this.map.set(key, value);
    }
}

// Instantiate a cache for sorted property sets
const propertyCache = new LRUCache<string, SortingResult>(100);

/**
 * Main sorting function that accepts various strategies
 * - alphabetical: sorts properties alphabetically
 * - grouped: sorts by logical groups (position, layout, visual, etc.)
 * - concentric: sorts from outside in (position → margin → padding → etc.)
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
    try {
        const sortedResult = (() => {
            switch (options.strategy) {
                case 'alphabetical':
                    return sortAlphabetically(properties);
                case 'grouped':
                    return sortByGroups(properties, DEFAULT_PROPERTY_GROUPS, options);
                case 'concentric':
                    return sortByConcentricOrder(properties);
                case 'custom':
                    if (!options.propertyGroups) {
                        return {
                            success: false,
                            error: 'Custom strategy requires propertyGroups option'
                        };
                    }
                    return sortByGroups(properties, options.propertyGroups, options);
                default:
                    return {
                        success: false,
                        error: `Unknown strategy: ${options.strategy}`
                    };
            }
        })();

        // Process nested rules if applicable
        const context = { nestingLevel: 0, parentType: 'root', isAtRule: false };
        const sortedProperties = processNestedRules(sortedResult.sortedProperties || [], options, context);

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

function debugLog(message: string, data: any) {
    console.log(`[DEBUG] ${message}:`, JSON.stringify(data, null, 2));
}

/**
 * Process nested CSS rules recursively
 * @param properties - The properties to sort
 * @param options - Sorting options
 * @param context - Context about the nesting level and parent rule
 * @returns The sorted properties
 */
function processNestedRules(
    properties: string[],
    options: SortingOptions,
    context: { nestingLevel: number; parentType: string; isAtRule: boolean }
): string[] {
    debugLog('Processing nested rules', { properties, options, context });

    const sortedProperties: string[] = [];

    properties.forEach(property => {
        if (context.isAtRule && property.startsWith('@')) {
            const nestedContext = {
                ...context,
                nestingLevel: context.nestingLevel + 1
            };
            const nestedSorted = processNestedRules([property], options, nestedContext);
            sortedProperties.push(...nestedSorted);
        } else {
            sortedProperties.push(property);
        }
    });

    if (options.emptyLinesBetweenGroups) {
        // Insert an empty line between groups
        // Ensure empty strings are inserted correctly between groups in nested rules
        const groupedProperties: string[] = [];
        let previousGroupIndex = -1;

        properties.forEach((prop) => {
            const currentGroupIndex = DEFAULT_PROPERTY_GROUPS.findIndex(group => group.includes(prop));

            if (previousGroupIndex !== -1 && currentGroupIndex !== previousGroupIndex) {
                groupedProperties.push(''); // Add empty line between groups
            }

            groupedProperties.push(prop);
            previousGroupIndex = currentGroupIndex;
        });

        // Ensure empty strings are preserved in the final output
        const finalGroupedProperties = groupedProperties.filter((prop, idx) => {
            return prop !== '' || (idx > 0 && groupedProperties[idx - 1] !== '');
        });

        debugLog('Debugging nested rules with empty lines', finalGroupedProperties);
        return finalGroupedProperties;
    }

    debugLog('Final sorted properties', sortedProperties);
    return sortedProperties;
}

/**
 * Sort properties alphabetically
 */
export function sortAlphabetically(properties: string[]): SortingResult {
    return {
        success: true,
        originalProperties: properties,
        sortedProperties: [...properties].sort()
    };
}

/**
 * Sort properties by concentric order
 */
export function sortByConcentricOrder(properties: string[]): SortingResult {
    debugLog('Sorting by concentric order', properties);

    const orderMap = new Map<string, number>();
    CONCENTRIC_PROPERTY_ORDER.forEach((prop, index) => {
        orderMap.set(prop, index);
    });

    const sortedProps = [...properties].sort((a, b) => {
        const indexA = orderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
        const indexB = orderMap.get(b) ?? Number.MAX_SAFE_INTEGER;

        if (indexA === indexB) {
            return a.localeCompare(b);
        }

        return indexA - indexB;
    });

    debugLog('Sorted properties by concentric order', sortedProps);

    // Refine concentric sorting logic to strictly enforce outside-to-inside order
    const finalSortedProps = CONCENTRIC_PROPERTY_ORDER.filter(prop => prop === '' || sortedProps.includes(prop));
    const remainingProps = sortedProps.filter(prop => prop === '' || !finalSortedProps.includes(prop));

    // Adjust placement of `border` between `margin` and `padding`
    const marginIndex = finalSortedProps.indexOf('margin');
    const paddingIndex = finalSortedProps.indexOf('padding');
    const borderIndex = finalSortedProps.indexOf('border');

    if (borderIndex === -1 && marginIndex !== -1 && paddingIndex !== -1) {
        finalSortedProps.splice(marginIndex + 1, 0, 'border');
    } else if (borderIndex !== -1 && (borderIndex < marginIndex || borderIndex > paddingIndex)) {
        finalSortedProps.splice(borderIndex, 1);
        finalSortedProps.splice(marginIndex + 1, 0, 'border');
    }

    // Ensure `padding` always follows `border`
    const updatedPaddingIndex = finalSortedProps.indexOf('padding');
    const updatedBorderIndex = finalSortedProps.indexOf('border');
    if (updatedPaddingIndex < updatedBorderIndex) {
        finalSortedProps.splice(updatedPaddingIndex, 1);
        finalSortedProps.splice(updatedBorderIndex + 1, 0, 'padding');
    }

    debugLog('Final concentric sorted properties', finalSortedProps);

    // Sort unknown properties alphabetically
    const knownProps = finalSortedProps;
    const unknownProps = remainingProps.sort();

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: [...knownProps, ...unknownProps]
    };
}

/**
 * Sort properties by groups
 */
export function sortByGroups(properties: string[], groups: string[][], options: SortingOptions): SortingResult {
    const groupedProps: Array<string[]> = groups.map(() => []);
    const ungrouped: string[] = [];

    properties.forEach(prop => {
        let found = false;

        for (let i = 0; i < groups.length; i++) {
            if (groups[i].includes(prop)) {
                groupedProps[i].push(prop);
                found = true;
                break;
            }
        }

        if (!found) {
            ungrouped.push(prop);
        }
    });

    if (options.sortPropertiesWithinGroups) {
        groupedProps.forEach(group => group.sort());
        ungrouped.sort();
    }

    const result: string[] = [];

    groupedProps.forEach((group, index) => {
        if (group.length > 0) {
            result.push(...group);

            if (options.emptyLinesBetweenGroups && index < groupedProps.length - 1) {
                result.push('');
            }
        }
    });

    if (ungrouped.length > 0) {
        if (options.sortPropertiesWithinGroups !== null) {
            ungrouped.sort();
        }
        if (result.length > 0 && options.emptyLinesBetweenGroups) {
            result.push('');
        }
        result.push(...ungrouped);
    }

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}

/**
 * Optimized Grouped Sorting using Bucket Sort
 */
function optimizedGroupedSort(properties: string[], groups: string[][], options: SortingOptions): SortingResult {
    const groupMap = new Map<string, number>();
    groups.forEach((group, index) => {
        group.forEach(property => groupMap.set(property, index));
    });

    const buckets: string[][] = Array.from({ length: groups.length }, () => []);
    const ungrouped: string[] = [];

    properties.forEach(property => {
        const groupIndex = groupMap.get(property);
        if (groupIndex !== undefined) {
            buckets[groupIndex].push(property);
        } else {
            ungrouped.push(property);
        }
    });

    if (options.sortPropertiesWithinGroups) {
        buckets.forEach(bucket => bucket.sort());
        ungrouped.sort();
    }

    const result: string[] = [];
    buckets.forEach((bucket, index) => {
        if (bucket.length > 0) {
            result.push(...bucket);
            if (options.emptyLinesBetweenGroups && index < buckets.length - 1) {
                result.push('');
            }
        }
    });

    if (ungrouped.length > 0) {
        if (result.length > 0 && options.emptyLinesBetweenGroups) {
            result.push('');
        }
        result.push(...ungrouped);
    }

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}

/**
 * Optimized Concentric Sorting using Counting Sort
 */
function optimizedConcentricSort(properties: string[], orderMap: Map<string, number>): SortingResult {
    const maxIndex = Math.max(...Array.from(orderMap.values()));
    const buckets: string[][] = Array.from({ length: maxIndex + 1 }, () => []);
    const ungrouped: string[] = [];

    properties.forEach(property => {
        const index = orderMap.get(property);
        if (index !== undefined) {
            buckets[index].push(property);
        } else {
            ungrouped.push(property);
        }
    });

    const result: string[] = [];
    buckets.forEach(bucket => {
        if (bucket.length > 0) {
            result.push(...bucket);
        }
    });

    result.push(...ungrouped.sort());

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}

/**
 * Optimized Alphabetical Sorting using Intl.Collator
 */
function optimizedAlphabeticalSort(properties: string[]): SortingResult {
    const collator = new Intl.Collator('en', { sensitivity: 'base' });
    return {
        success: true,
        originalProperties: properties,
        sortedProperties: [...properties].sort(collator.compare)
    };
}

/**
 * Enhanced sortProperties function with caching
 */
export function sortPropertiesWithCache(properties: string[], options: SortingOptions): SortingResult {
    const cacheKey = `${options.strategy}|${JSON.stringify(options)}|${properties.join(',')}`;
    const cachedResult = propertyCache.get(cacheKey);

    if (cachedResult) {
        return cachedResult;
    }

    const result = sortProperties(properties, options);
    propertyCache.set(cacheKey, result);

    return result;
}

/**
 * Adaptive Sorting Function
 */
export function adaptiveSortProperties(properties: string[], options: SortingOptions): SortingResult {
    switch (options.strategy) {
        case 'alphabetical':
            return optimizedAlphabeticalSort(properties);
        case 'grouped':
            return optimizedGroupedSort(properties, DEFAULT_PROPERTY_GROUPS, options);
        case 'concentric':
            const orderMap = new Map<string, number>();
            CONCENTRIC_PROPERTY_ORDER.forEach((prop, index) => orderMap.set(prop, index));
            return optimizedConcentricSort(properties, orderMap);
        case 'custom':
            if (!options.propertyGroups) {
                return {
                    success: false,
                    error: 'Custom strategy requires propertyGroups option'
                };
            }
            return optimizedGroupedSort(properties, options.propertyGroups, options);
        default:
            return {
                success: false,
                error: `Unknown strategy: ${options.strategy}`
            };
    }
}
