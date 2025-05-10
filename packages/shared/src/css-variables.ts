/**
 * CSS Variables specific handling
 */

/**
 * Extract and sort CSS variables from properties list
 * @param properties - The list of all CSS properties
 * @returns Object containing sorted CSS variables and non-variable properties
 */
export function extractAndSortCssVariables(
    properties: string[]
): { cssVariables: string[], nonVariableProps: string[] } {
    // Extract CSS variables (properties starting with --)
    const cssVariables = properties.filter(prop => prop.trim().startsWith('--'));
    const nonVariableProps = properties.filter(prop => !prop.trim().startsWith('--'));

    // Sort CSS variables alphabetically
    const sortedCssVariables = [...cssVariables].sort((a, b) => a.localeCompare(b));

    return {
        cssVariables: sortedCssVariables,
        nonVariableProps
    };
}

/**
 * Add CSS variables to the beginning of sorted properties
 * @param sortedCssVariables - The sorted CSS variables
 * @param sortedProperties - The sorted non-variable properties
 * @returns The combined list with CSS variables at the beginning
 */
export function mergeCssVariablesWithProperties(
    sortedCssVariables: string[],
    sortedProperties: string[]
): string[] {
    if (sortedCssVariables.length === 0) {
        return sortedProperties;
    }

    // If there's already an empty line at the start of sorted properties, remove it
    let properties = sortedProperties;
    if (properties.length > 0 && properties[0] === '') {
        properties = properties.slice(1);
    }

    // Always add an empty line after CSS variables if there are other properties
    const emptyLineAfterVars = (properties.length > 0) ? [''] : [];

    return [...sortedCssVariables, ...emptyLineAfterVars, ...properties];
}
