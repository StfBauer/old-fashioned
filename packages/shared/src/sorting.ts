// Import types from the existing types file instead of redefining them
import { SortingOptions, SortingResult } from './types';
// Import property group definitions
import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER, IDIOMATIC_PROPERTY_GROUPS } from './property-groups';

// Re-export property groups for external use
export { DEFAULT_PROPERTY_GROUPS };

// Common vendor prefixes
const VENDOR_PREFIXES = ['-webkit-', '-moz-', '-ms-', '-o-'];

// Cache for previously sorted property lists
const sortingCache = new Map<string, string[]>();

/**
 * Main sorting function that accepts various strategies
 * @param properties Array of CSS property names to sort
 * @param options Sorting configuration options
 * @returns SortingResult with sorted properties
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
    try {
        // Apply default values for optional properties
        const completeOptions = {
            ...options,
            emptyLinesBetweenGroups: options.emptyLinesBetweenGroups ?? false, // Default to false
            sortPropertiesWithinGroups: options.sortPropertiesWithinGroups ?? true // Default to true
        };

        // Special handling for CSS variables and SASS variables - extract them first
        const cssVariables = properties.filter(prop => prop.trim().startsWith('--'));
        const sassVariables = properties.filter(prop => prop.trim().startsWith('$'));
        const regularProps = properties.filter(prop => !prop.trim().startsWith('--') && !prop.trim().startsWith('$'));

        // Sort variables alphabetically
        const sortedCssVariables = [...cssVariables].sort((a, b) => a.localeCompare(b));
        const sortedSassVariables = [...sassVariables].sort((a, b) => a.localeCompare(b));

        let sortedResult: SortingResult = {
            success: true,
            sortedProperties: regularProps
        };

        // Apply the requested sorting strategy for regular properties
        switch (completeOptions.strategy) {
            case 'alphabetical':
                sortedResult.sortedProperties = regularProps.sort((a, b) => a.localeCompare(b));
                break;
            case 'grouped':
                sortedResult = sortByGroups(regularProps, completeOptions, DEFAULT_PROPERTY_GROUPS);
                break;
            case 'concentric':
                sortedResult = sortByConcentric(regularProps);
                break;
            case 'idiomatic':
                sortedResult = sortByGroups(regularProps, completeOptions, IDIOMATIC_PROPERTY_GROUPS);
                break;
            case 'custom':
                // Custom strategy requires propertyGroups to be provided
                if (!completeOptions.propertyGroups || !Array.isArray(completeOptions.propertyGroups)) {
                    return {
                        success: false,
                        error: 'Custom strategy requires propertyGroups option'
                    };
                }
                sortedResult = sortByGroups(regularProps, completeOptions, completeOptions.propertyGroups);
                break;
            default:
                // Unknown strategy
                return {
                    success: false,
                    error: `Unknown strategy: ${completeOptions.strategy}`
                };
        }

        if (!sortedResult.success) {
            return sortedResult;
        }

        // Process nested rules if applicable
        const context = { nestingLevel: 0, parentType: 'root', isAtRule: false };
        let sortedProperties = processNestedRules(sortedResult.sortedProperties || [], completeOptions, context);

        // Build the final variable section
        const allVariables = [];

        // Add CSS custom properties first if present
        if (sortedCssVariables.length > 0) {
            allVariables.push(...sortedCssVariables);

            // Add empty line between CSS and SASS variables if both exist
            if (sortedSassVariables.length > 0) {
                allVariables.push('');
            }
        }

        // Add SASS variables next if present
        if (sortedSassVariables.length > 0) {
            allVariables.push(...sortedSassVariables);
        }

        // Determine if we need an empty line after the entire variables block
        // We need it if there are any variables and any regular properties
        const needsEmptyLine = (allVariables.length > 0 && sortedProperties.length > 0);

        // Remove any empty line at the start of sorted properties to avoid double empty lines
        if (sortedProperties.length > 0 && sortedProperties[0] === '') {
            sortedProperties = sortedProperties.slice(1);
        }

        // Combine all sections with variables at the top
        if (needsEmptyLine) {
            sortedProperties = [...allVariables, '', ...sortedProperties];
        } else {
            sortedProperties = [...allVariables, ...sortedProperties];
        }

        return {
            success: true,
            sortedProperties
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
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
    try {
        // Default context if not provided
        const adaptiveContext = context || { parentType: 'rule', isNested: false };

        // Apply any context-specific adaptations
        const adaptedOptions = { ...options };

        // Special handling for nested rules or specific parent types
        if (adaptiveContext.isNested) {
            // For nested rules, we might want to apply different strategies
            // This is a basic implementation - expand as needed
        }

        // Delegate to main sorting function with adapted options
        return sortProperties(properties, adaptedOptions);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
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
            return {
                success: true,
                sortedProperties: sortingCache.get(cacheKey)
            };
        }

        // If not in cache, sort using standard function
        const result = sortProperties(properties, options);

        // Cache successful results
        if (result.success && result.sortedProperties) {
            sortingCache.set(cacheKey, result.sortedProperties);
        }

        return result;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Process nested rules for special cases (like @media)
 */
function processNestedRules(properties: string[], options: SortingOptions, context: any): string[] {
    // Basic implementation - just return the properties for now
    // In a full implementation, this would handle nested rules and at-rules
    return properties;
}

/**
 * Sort properties by predefined groups
 */
function sortByGroups(properties: string[], options: SortingOptions, propertyGroups: string[][]): SortingResult {
    try {
        // Apply default values for optional properties for consistent behavior
        const completeOptions = {
            ...options,
            emptyLinesBetweenGroups: options.emptyLinesBetweenGroups ?? false,
            sortPropertiesWithinGroups: options.sortPropertiesWithinGroups ?? true
        };

        const groupMap = new Map<string, number>();

        // Build lookup map for property to group index
        propertyGroups.forEach((group, groupIndex) => {
            group.forEach(prop => {
                groupMap.set(prop.toLowerCase(), groupIndex);
            });
        });

        // Organize properties by group
        const groups: string[][] = Array(propertyGroups.length)
            .fill(null)
            .map(() => [] as string[]);

        const ungrouped: string[] = [];

        // Assign properties to groups
        properties.forEach(prop => {
            // Normalize property name (handle vendor prefixes)
            let normalizedProp = prop;

            // Remove vendor prefix if present
            for (const prefix of VENDOR_PREFIXES) {
                if (prop.startsWith(prefix)) {
                    normalizedProp = prop.slice(prefix.length);
                    break;
                }
            }

            const groupIndex = groupMap.get(normalizedProp.toLowerCase());

            if (groupIndex !== undefined) {
                groups[groupIndex].push(prop);
            } else {
                ungrouped.push(prop);
            }
        });

        // Sort properties within groups if requested
        if (completeOptions.sortPropertiesWithinGroups) {
            groups.forEach(group => group.sort((a, b) => a.localeCompare(b)));
            ungrouped.sort((a, b) => a.localeCompare(b));
        }

        // Build the final sorted list with optional empty lines between groups
        const result: string[] = [];
        let firstGroupAdded = false;

        groups.forEach((group, _) => {
            if (group.length === 0) return;

            if (firstGroupAdded && completeOptions.emptyLinesBetweenGroups) {
                result.push('');
            }

            result.push(...group);
            firstGroupAdded = true;
        });

        // Add ungrouped properties at the end
        if (ungrouped.length > 0) {
            if (firstGroupAdded && completeOptions.emptyLinesBetweenGroups) {
                result.push('');
            }
            result.push(...ungrouped);
        }

        return {
            success: true,
            sortedProperties: result
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Sort properties using concentric order pattern (outside-in approach)
 */
function sortByConcentric(properties: string[]): SortingResult {
    try {
        // Use the concentric property order from property-groups
        const propertyOrderMap = new Map<string, number>();

        CONCENTRIC_PROPERTY_ORDER.forEach((prop, index) => {
            propertyOrderMap.set(prop.toLowerCase(), index);
        });

        const sortedProperties = [...properties].sort((a, b) => {
            // Handle vendor prefixes by removing them for comparison
            let normalizedA = a;
            let normalizedB = b;

            for (const prefix of VENDOR_PREFIXES) {
                if (a.startsWith(prefix)) normalizedA = a.slice(prefix.length);
                if (b.startsWith(prefix)) normalizedB = b.slice(prefix.length);
            }

            const indexA = propertyOrderMap.get(normalizedA.toLowerCase()) ?? 999;
            const indexB = propertyOrderMap.get(normalizedB.toLowerCase()) ?? 999;

            if (indexA === indexB) {
                // If they're in the same position, sort alphabetically
                return normalizedA.localeCompare(normalizedB);
            }

            return indexA - indexB;
        });

        return {
            success: true,
            sortedProperties
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}