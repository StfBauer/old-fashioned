import { SortingOptions, SortingResult } from './types';
import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER } from './property-groups';

/**
 * Main sorting function that accepts various strategies
 * - alphabetical: sorts properties alphabetically
 * - grouped: sorts by logical groups (position, layout, visual, etc.)
 * - concentric: sorts from outside in (position → margin → padding → etc.)
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
    try {
        // Select algorithm based on property count and specified algorithm
        const algorithm = selectAlgorithm(properties.length, options.algorithm);

        switch (options.strategy) {
            case 'alphabetical':
                return sortAlphabetically(properties, algorithm);
            case 'grouped':
                return sortByGroups(properties, DEFAULT_PROPERTY_GROUPS, options, algorithm);
            case 'concentric':
                return sortByConcentricOrder(properties, algorithm);
            case 'custom':
                if (!options.propertyGroups) {
                    return {
                        success: false,
                        error: 'Custom strategy requires propertyGroups option'
                    };
                }
                return sortByGroups(properties, options.propertyGroups, options, algorithm);
            default:
                return {
                    success: false,
                    error: `Unknown strategy: ${options.strategy}`
                };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during sorting'
        };
    }
}

/**
 * Select the optimal sorting algorithm based on property count and user preference
 */
function selectAlgorithm(propertyCount: number, requestedAlgorithm?: string): 'standard' | 'hashmap' | 'radix' {
    // If an algorithm is explicitly requested, use it
    if (requestedAlgorithm === 'hashmap' || requestedAlgorithm === 'radix') {
        return requestedAlgorithm;
    }

    // Otherwise, select based on property count
    if (propertyCount > 500) {
        return 'hashmap'; // Most efficient for large lists
    } else if (propertyCount <= 10) {
        return 'standard'; // Standard JS sort is fine for very small lists
    } else {
        return 'hashmap'; // Good balance for medium lists
    }
}

/**
 * Sort properties alphabetically
 * This signature now matches what sorting-engine.ts expects
 */
export function sortAlphabetically(
    properties: string[],
    algorithm: 'standard' | 'hashmap' | 'radix' = 'standard'
): SortingResult {
    let sortedProperties: string[];

    switch (algorithm) {
        case 'radix':
            sortedProperties = radixSortProperties(properties);
            break;
        case 'hashmap':
            // For alphabetical sort with hashmap, create artificial single-letter groups
            const alphabeticalGroups: string[][] = [];
            for (let i = 0; i < 26; i++) {
                const letter = String.fromCharCode(97 + i); // 'a' to 'z'
                alphabeticalGroups.push(
                    properties.filter(p => p.toLowerCase().startsWith(letter))
                );
            }
            // Add group for properties starting with non-letters
            alphabeticalGroups.push(
                properties.filter(p => !/^[a-z]/i.test(p))
            );
            sortedProperties = hashMapSort(properties, [alphabeticalGroups.flat()]);
            break;
        default:
            // Standard JavaScript sort
            sortedProperties = [...properties].sort();
    }

    return {
        success: true,
        originalProperties: properties,
        sortedProperties
    };
}

/**
 * Sort properties by concentric order
 */
function sortByConcentricOrder(
    properties: string[],
    algorithm: 'standard' | 'hashmap' | 'radix'
): SortingResult {
    if (algorithm === 'hashmap') {
        // Convert concentric order to groups for hashmap sorting
        // Break the flat array into groups based on functionality
        const groups: string[][] = [];
        let currentGroup: string[] = [];
        let lastCategory = '';

        // Group properties by their position in CONCENTRIC_PROPERTY_ORDER
        for (const prop of CONCENTRIC_PROPERTY_ORDER) {
            // Use first segment before hyphen as category (e.g., "positioning-position" -> "positioning")
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

        // Use hashmap sort with concentric groups
        const sortedProps = hashMapSort(properties, groups);

        return {
            success: true,
            originalProperties: properties,
            sortedProperties: sortedProps
        };
    } else {
        // Fallback to standard concentric sorting for other algorithms
        // Create a map for quick lookup of property indices
        const orderMap = new Map<string, number>();
        CONCENTRIC_PROPERTY_ORDER.forEach((prop: string, index: number) => {
            orderMap.set(prop, index);
        });

        // Sort properties based on their position in CONCENTRIC_PROPERTY_ORDER
        const sortedProps = [...properties].sort((a, b) => {
            const indexA = orderMap.has(a) ? orderMap.get(a)! : Number.MAX_SAFE_INTEGER;
            const indexB = orderMap.has(b) ? orderMap.get(b)! : Number.MAX_SAFE_INTEGER;

            if (indexA === indexB) {
                // If both properties are not in the order list, sort them alphabetically
                if (indexA === Number.MAX_SAFE_INTEGER) {
                    return a.localeCompare(b);
                }
                return 0;
            }

            return indexA - indexB;
        });

        return {
            success: true,
            originalProperties: properties,
            sortedProperties: sortedProps
        };
    }
}

/**
 * Sort properties by groups
 * with proper signature matching sorting-engine.ts
 */
export function sortByGroups(
    properties: string[],
    groups: string[][],
    options: SortingOptions,
    algorithm: 'standard' | 'hashmap' | 'radix' = 'standard'
): SortingResult {
    if (algorithm === 'hashmap' && !options.emptyLinesBetweenGroups) {
        // For hashmap without empty lines, we can use the more efficient implementation
        const sortedProps = hashMapSort(properties, groups);

        return {
            success: true,
            originalProperties: properties,
            sortedProperties: sortedProps
        };
    }

    // Otherwise use the original implementation which supports empty lines
    const groupedProps: Array<string[]> = groups.map(() => []);
    const ungrouped: string[] = [];

    // Assign each property to its group
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

    // Sort properties within groups
    if (options.sortPropertiesWithinGroups) {
        // Use the appropriate sorting algorithm for within-group sorting
        if (algorithm === 'radix') {
            groupedProps.forEach(group => {
                const sorted = radixSortProperties(group);
                group.splice(0, group.length, ...sorted);
            });
            const sortedUngrouped = radixSortProperties(ungrouped);
            ungrouped.splice(0, ungrouped.length, ...sortedUngrouped);
        } else {
            groupedProps.forEach(group => group.sort());
            ungrouped.sort();
        }
    } else {
        // Preserve original order within groups
        groupedProps.forEach(group => {
            group.sort((a, b) => {
                const indexA = properties.indexOf(a);
                const indexB = properties.indexOf(b);
                return indexA - indexB;
            });
        });
    }

    // Combine all groups
    const result: string[] = [];

    groupedProps.forEach((group, index) => {
        if (group.length > 0) {
            result.push(...group);

            // Add empty line between groups if requested and if it's not the last group
            if (options.emptyLinesBetweenGroups && index < groupedProps.length - 1) {
                const nextGroupWithProps = groupedProps.slice(index + 1).findIndex(g => g.length > 0);
                if (nextGroupWithProps !== -1) {
                    result.push('');  // Empty string represents an empty line
                }
            }
        }
    });

    // Add ungrouped properties at the end
    if (ungrouped.length > 0) {
        if (result.length > 0 && options.emptyLinesBetweenGroups) {
            result.push('');  // Empty line before ungrouped properties
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
 * Creates a lookup map for faster property sorting
 */
function createPropertyOrderMap(propertyGroups: string[][]): Map<string, number> {
    const orderMap = new Map<string, number>();
    let index = 0;

    for (const group of propertyGroups) {
        for (const property of group) {
            orderMap.set(property, index++);
        }
    }

    return orderMap;
}

/**
 * Sort properties using hash map lookup (O(n) complexity)
 */
export function hashMapSort(
    properties: string[],
    propertyGroups: string[][]
): string[] {
    const orderMap = createPropertyOrderMap(propertyGroups);

    return [...properties].sort((a, b) => {
        const orderA = orderMap.has(a) ? orderMap.get(a)! : Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.has(b) ? orderMap.get(b)! : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });
}

/**
 * Radix sort implementation for CSS property names
 * Potentially faster than comparison-based sorting for large lists
 */
export function radixSortProperties(properties: string[]): string[] {
    if (properties.length <= 1) return [...properties];

    // Find max length
    const maxLength = properties.reduce((max, str) => Math.max(max, str.length), 0);

    let sortedArray = [...properties];

    // Iterate through each character position, from right to left
    for (let i = maxLength - 1; i >= 0; i--) {
        // ASCII has 128 basic characters, plus we need one bucket for empty
        const buckets: string[][] = Array(129).fill(null).map(() => []);

        // Place each string in appropriate bucket based on char at position i
        for (const prop of sortedArray) {
            const char = i < prop.length ? prop.charCodeAt(i) : 0;
            buckets[char].push(prop);
        }

        // Reconstruct the array
        sortedArray = buckets.flat();
    }

    return sortedArray;
}