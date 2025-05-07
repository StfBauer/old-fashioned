/**
 * Shared utility functions for Old Fashioned CSS property sorting
 */
import { SortingOptions, SortingResult, SortingStrategy } from './types';
import { DEFAULT_PROPERTY_GROUPS } from './property-groups';

/**
 * Sort properties alphabetically
 * 
 * @param properties - The properties to sort
 * @returns The sorted properties
 */
export function sortAlphabetically(properties: string[]): string[] {
  return [...properties].sort();
}

/**
 * Sort properties by group
 * 
 * @param properties - The properties to sort
 * @param options - Sorting options
 * @returns The sorted properties
 */
export function sortByGroups(
  properties: string[],
  options: SortingOptions
): string[] {
  const groups = options.propertyGroups || DEFAULT_PROPERTY_GROUPS;
  const result: string[] = [];
  const remainingProps = [...properties];

  // First, put properties in their respective groups in the order defined
  groups.forEach((group: string[]) => {
    const groupProps: string[] = [];

    // Find properties in this group
    group.forEach((groupProp: string) => {
      const index = remainingProps.findIndex(prop =>
        prop.toLowerCase() === groupProp.toLowerCase()
      );

      if (index !== -1) {
        groupProps.push(remainingProps[index]);
        remainingProps.splice(index, 1);
      }
    });

    // Sort properties within the group if requested
    if (options.sortPropertiesWithinGroups && groupProps.length > 0) {
      groupProps.sort();
    }

    // Add properties to result
    if (groupProps.length > 0) {
      result.push(...groupProps);

      // Add empty line between groups if requested
      if (options.emptyLinesBetweenGroups && result.length > 0 && remainingProps.length > 0) {
        result.push('');
      }
    }
  });

  // Add remaining properties at the end
  if (remainingProps.length > 0) {
    if (options.sortPropertiesWithinGroups) {
      remainingProps.sort();
    }
    result.push(...remainingProps);
  }

  // Remove any trailing empty lines
  while (result.length > 0 && result[result.length - 1] === '') {
    result.pop();
  }

  return result;
}

/**
 * Sort properties using concentric CSS pattern
 * (from outside to inside: position, display, colors, typography, etc.)
 * 
 * @param properties - The properties to sort
 * @param options - Sorting options
 * @returns The sorted properties
 */
export function sortConcentric(
  properties: string[],
  options: SortingOptions
): string[] {
  // Create a map for quick lookup of property indices
  const orderMap = new Map<string, number>();

  // Import the CONCENTRIC_PROPERTY_ORDER from the property-groups
  const { CONCENTRIC_PROPERTY_ORDER } = require('./property-groups');

  CONCENTRIC_PROPERTY_ORDER.forEach((prop: string, index: number) => {
    orderMap.set(prop, index);
  });

  // Sort properties based on their position in the concentric order
  return [...properties].sort((a, b) => {
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
}

/**
 * Sort CSS properties based on sorting options
 */
export function sortProperties(properties: string[], options: SortingOptions): SortingResult {
  try {
    // If we made it here, apply the chosen sorting strategy
    let sortedProperties: string[];

    switch (options.strategy) {
      case 'alphabetical':
        sortedProperties = sortAlphabetically(properties);
        break;
      case 'grouped':
        sortedProperties = sortByGroups(properties, options);
        break;
      case 'custom':
        if (!options.propertyGroups) {
          return {
            success: false,
            originalProperties: properties,
            sortedProperties: properties,
            error: 'Custom sorting strategy requires propertyGroups option'
          };
        }
        sortedProperties = sortByGroups(properties, options);
        break;
      default:
        return {
          success: false,
          originalProperties: properties,
          sortedProperties: properties,
          error: `Unknown sorting strategy: ${options.strategy}`
        };
    }

    return {
      success: true,
      originalProperties: properties,
      sortedProperties
    };
  } catch (error) {
    return {
      success: false,
      originalProperties: properties,
      sortedProperties: properties,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Detects if a given string looks like a CSS property name
 * 
 * @param str - The string to check
 * @returns True if the string looks like a CSS property
 */
export function isCSSProperty(str: string): boolean {
  // Simple check for now - CSS properties don't have spaces and usually contain hyphens
  return Boolean(
    str &&
    typeof str === 'string' &&
    !str.includes(' ') &&
    /^[a-zA-Z0-9-]+$/.test(str)
  );
}

/**
 * Validates that all items in an array are CSS property names
 * 
 * @param arr - The array to check
 * @returns True if all items are valid CSS properties
 */
export function validatePropertyArray(arr: string[]): boolean {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.every(item => isCSSProperty(item));
}

/**
 * Shuffle the elements of an array randomly
 * 
 * @param array - The array to shuffle
 * @returns A new array with the elements shuffled
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Format a number as a string with comma separators
 * 
 * @param num - The number to format
 * @returns The formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}