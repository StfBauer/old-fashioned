import { SortingOptions, SortingResult } from './types';
import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER, IDIOMATIC_PROPERTY_GROUPS } from './property-groups';

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
 * - idiomatic: sorts using Nicolas Gallagher's Idiomatic CSS principles
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
                case 'idiomatic':
                    return sortByGroups(properties, IDIOMATIC_PROPERTY_GROUPS, options);
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
    properties: string[], // This is the already sorted list, possibly with '' markers
    options: SortingOptions,
    context: { nestingLevel: number; parentType: string; isAtRule: boolean }
): string[] {
    // For non-nested CSS (like the current test case), or if not an @-rule context,
    // this function should be largely a pass-through for top-level properties,
    // preserving existing '' markers.
    // The original logic for adding empty lines here is removed to avoid conflicts
    // with the main sorting function (sortByGroups or optimizedGroupedSort)
    // which should now be solely responsible for '' markers.

    if (!context.isAtRule && context.nestingLevel === 0) { // Simplification for top-level CSS rules
        return properties; // Pass through the already sorted list with its '' markers
    }

    // Original logic for handling actual nested structures (e.g., SCSS @media, @nest)
    // would remain here, but it should also respect and pass through '' markers
    // if they are part of a flat list of declarations within a nested block.
    // For now, focusing on the pass-through for the current issue.
    // A more complete refactor of this function for complex nesting + empty lines
    // would be needed if SCSS with empty lines between groups inside nested rules
    // becomes a requirement.

    // Fallback to returning properties as is if complex nesting logic is not fully implemented here
    // to handle '' markers correctly within truly nested structures.
    return properties;
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

    // Define the concentric property groups for empty line insertion
    const concentricGroups = [
        // Positioning
        ['position', 'top', 'right', 'bottom', 'left', 'z-index'],

        // Display & Box Model
        ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
            'flex-shrink', 'flex-basis', 'justify-content', 'align-items', 'align-content',
            'order', 'float', 'clear', 'box-sizing'],

        // Dimensions
        ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],

        // Margin
        ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],

        // Padding
        ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

        // Border
        ['border', 'border-width', 'border-style', 'border-color', 'border-top',
            'border-right', 'border-bottom', 'border-left', 'border-radius'],

        // Background
        ['background', 'background-color', 'background-image', 'background-repeat',
            'background-position', 'background-size'],

        // Typography
        ['color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height',
            'text-align', 'text-decoration', 'text-transform', 'letter-spacing'],

        // Other Visual
        ['opacity', 'visibility', 'overflow', 'box-shadow', 'text-shadow',
            'transform', 'transition', 'animation'],

        // Miscellaneous
        ['cursor', 'pointer-events', 'user-select', 'content']
    ];

    const orderMap = new Map<string, number>();
    CONCENTRIC_PROPERTY_ORDER.forEach((prop, index) => {
        orderMap.set(prop, index);
    });

    // First sort all properties by the concentric order
    const sortedProps = [...properties].sort((a, b) => {
        const indexA = orderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
        const indexB = orderMap.get(b) ?? Number.MAX_SAFE_INTEGER;

        if (indexA === indexB) {
            return a.localeCompare(b);
        }

        return indexA - indexB;
    });

    // Map each property to its group
    const propToGroupIndex = new Map<string, number>();
    concentricGroups.forEach((group, groupIndex) => {
        group.forEach(prop => {
            propToGroupIndex.set(prop, groupIndex);
        });
    });

    // Create groups with the actually used properties
    const usedGroups: string[][] = concentricGroups.map(() => []);
    const ungrouped: string[] = [];

    // Place each property in its group
    sortedProps.forEach(prop => {
        const groupIndex = propToGroupIndex.get(prop);
        if (groupIndex !== undefined) {
            usedGroups[groupIndex].push(prop);
        } else {
            ungrouped.push(prop);
        }
    });

    // Now build the final result with empty lines between groups
    const result: string[] = [];
    let firstGroupAdded = false;

    usedGroups.forEach(group => {
        if (group.length > 0) {
            if (firstGroupAdded) {
                result.push(''); // Add empty line between groups
            }
            result.push(...group);
            firstGroupAdded = true;
        }
    });

    // Add ungrouped properties at the end
    if (ungrouped.length > 0 && firstGroupAdded) {
        result.push('');
        result.push(...ungrouped.sort());
    } else if (ungrouped.length > 0) {
        result.push(...ungrouped.sort());
    }

    debugLog('Final concentric sorted properties with groups', result);

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}

/**
 * Sort properties by groups
 */
export function sortByGroups(properties: string[], groupsDefinition: string[][], options: SortingOptions): SortingResult {
    const groupedProps: Array<string[]> = groupsDefinition.map(() => []);
    const ungrouped: string[] = [];

    // Ensure group definitions are also normalized (lowercase, trim) for matching
    const normalizedGroups = groupsDefinition.map(group =>
        group.map(propDef => propDef.toLowerCase().trim())
    );

    properties.forEach(p => {
        const prop = p.toLowerCase().trim(); // Property name is already lowercased and trimmed by caller
        let found = false;
        for (let i = 0; i < normalizedGroups.length; i++) {
            if (normalizedGroups[i].includes(prop)) {
                groupedProps[i].push(p); // Push the original casing if needed, but for now, use the processed 'prop'
                // For consistency with stylelint-oldschool-order that sends lowercase, use 'prop'
                found = true;
                break;
            }
        }
        if (!found) {
            ungrouped.push(p); // Same as above, use 'prop' if caller sends lowercase
        }
    });

    if (options.sortPropertiesWithinGroups) {
        groupedProps.forEach(group => {
            if (Array.isArray(group)) {
                group.sort((a, b) => a.localeCompare(b)); // Explicit localeCompare
            }
        });
        if (Array.isArray(ungrouped)) {
            ungrouped.sort((a, b) => a.localeCompare(b)); // Explicit localeCompare
        }
    }

    const result: string[] = [];
    let firstBlockAdded = false;

    groupedProps.forEach((group) => {
        if (group.length > 0) {
            if (firstBlockAdded && options.emptyLinesBetweenGroups) {
                result.push('');
            }
            result.push(...group);
            firstBlockAdded = true;
        }
    });

    if (ungrouped.length > 0) {
        if (firstBlockAdded && options.emptyLinesBetweenGroups && result.length > 0 && result[result.length - 1] !== '') {
            result.push('');
        }
        result.push(...ungrouped);
        // firstBlockAdded = true; // Not essential here
    }

    return {
        success: true,
        originalProperties: properties, // These are the (lowercase) properties received
        sortedProperties: result
    };
}

/**
 * Optimized Grouped Sorting using Bucket Sort
 */
function optimizedGroupedSort(properties: string[], groupsDefinition: string[][], options: SortingOptions): SortingResult {
    const groupMap = new Map<string, number>();
    // Ensure group definitions are also normalized for map creation
    const normalizedGroups = groupsDefinition.map(group =>
        group.map(propDef => propDef.toLowerCase().trim())
    );

    normalizedGroups.forEach((group, index) => {
        group.forEach(propertyInGroupDefinition => {
            groupMap.set(propertyInGroupDefinition, index);
        });
    });

    const buckets: string[][] = Array.from({ length: normalizedGroups.length }, () => []);
    const ungrouped: string[] = [];

    properties.forEach(p => { // p is already lowercased and trimmed by caller
        const prop = p;
        const groupIndex = groupMap.get(prop);
        if (groupIndex !== undefined) {
            buckets[groupIndex].push(prop); // Use 'prop' (lowercase)
        } else {
            ungrouped.push(prop); // Use 'prop' (lowercase)
        }
    });

    if (options.sortPropertiesWithinGroups) {
        buckets.forEach(bucket => {
            if (Array.isArray(bucket)) {
                bucket.sort((a, b) => a.localeCompare(b)); // Explicit localeCompare
            }
        });
        if (Array.isArray(ungrouped)) {
            ungrouped.sort((a, b) => a.localeCompare(b)); // Explicit localeCompare
        }
    }

    const result: string[] = [];
    let firstBlockAdded = false;

    buckets.forEach((bucket) => {
        if (bucket.length > 0) {
            if (firstBlockAdded && options.emptyLinesBetweenGroups) {
                result.push('');
            }
            result.push(...bucket);
            firstBlockAdded = true;
        }
    });

    if (ungrouped.length > 0) {
        if (firstBlockAdded && options.emptyLinesBetweenGroups && result.length > 0 && result[result.length - 1] !== '') {
            result.push('');
        }
        result.push(...ungrouped);
    }

    return {
        success: true,
        originalProperties: properties, // Lowercase properties
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
        case 'idiomatic':
            return optimizedGroupedSort(properties, IDIOMATIC_PROPERTY_GROUPS, options);
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
