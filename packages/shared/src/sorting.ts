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
    // Placeholder for handling nested rules
    // This function will recursively process nested rules if needed
    return properties.map(property => {
        // Example: Add logic to handle nested rules here
        return property;
    });
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

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: sortedProps
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
