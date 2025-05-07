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
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during sorting'
        };
    }
}

/**
 * Sort properties alphabetically
 */
function sortAlphabetically(properties: string[]): SortingResult {
    return {
        success: true,
        originalProperties: properties,
        sortedProperties: [...properties].sort()
    };
}

/**
 * Sort properties by concentric order
 */
function sortByConcentricOrder(properties: string[]): SortingResult {
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

/**
 * Sort properties by groups
 */
function sortByGroups(properties: string[], groups: string[][], options: SortingOptions): SortingResult {
    // Group properties based on their position in the groups array
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

    // Sort properties within groups if requested
    if (options.sortPropertiesWithinGroups) {
        groupedProps.forEach(group => group.sort());
        ungrouped.sort();
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
        sortedProperties: result
    };
}
