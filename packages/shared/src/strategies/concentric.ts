/**
 * Concentric sorting strategy
 */
import { SortingResult } from '../types';
import { CONCENTRIC_PROPERTY_ORDER } from '../property-groups';

/**
 * Sort properties by concentric order
 * @param properties - The properties to sort
 * @returns The sorting result
 */
export function sortByConcentricOrder(properties: string[]): SortingResult {
    // Define the concentric property groups for empty line insertion
    const concentricGroups = [
        // Positioning
        ['position', 'top', 'right', 'bottom', 'left', 'z-index',
            'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
            'inset-inline', 'inset-inline-start', 'inset-inline-end'],

        // Container queries
        ['container', 'container-type', 'container-name'],

        // Display & Box Model
        ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
            'flex-shrink', 'flex-basis', 'justify-content', 'align-items', 'align-content',
            'align-self', 'order', 'gap', 'row-gap', 'column-gap', 'float', 'clear', 'box-sizing'],

        // Grid
        ['grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
            'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow', 'grid-column', 'grid-column-start',
            'grid-column-end', 'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area'],

        // Dimensions
        ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'aspect-ratio'],

        // Margin - physical and logical
        ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'margin-block', 'margin-block-start', 'margin-block-end',
            'margin-inline', 'margin-inline-start', 'margin-inline-end'],

        // Padding - physical and logical
        ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'padding-block', 'padding-block-start', 'padding-block-end',
            'padding-inline', 'padding-inline-start', 'padding-inline-end'],

        // Border - physical
        ['border', 'border-width', 'border-style', 'border-color',
            'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
            'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
            'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
            'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
            'border-radius', 'border-top-left-radius', 'border-top-right-radius',
            'border-bottom-right-radius', 'border-bottom-left-radius'],

        // Border - logical
        ['border-block', 'border-block-width', 'border-block-style', 'border-block-color',
            'border-block-start', 'border-block-start-width', 'border-block-start-style', 'border-block-start-color',
            'border-block-end', 'border-block-end-width', 'border-block-end-style', 'border-block-end-color',
            'border-inline', 'border-inline-width', 'border-inline-style', 'border-inline-color',
            'border-inline-start', 'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color',
            'border-inline-end', 'border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color',
            'border-start-start-radius', 'border-start-end-radius', 'border-end-start-radius', 'border-end-end-radius'],

        // Background
        ['background', 'background-color', 'background-image', 'background-repeat',
            'background-position', 'background-size'],

        // Typography
        ['color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
            'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'white-space'],

        // Other Visual
        ['opacity', 'visibility', 'overflow', 'box-shadow', 'text-shadow',
            'transform', '-webkit-transform', '-moz-transform', 'transition', 'animation',
            'filter', 'backdrop-filter'],

        // Miscellaneous
        ['cursor', 'pointer-events', 'user-select', 'content', '--custom-property']
    ];

    // Create a detailed order map that includes all properties from the concentricGroups
    // for better positioning of modern CSS properties
    const detailedOrderMap = new Map<string, number>();
    let orderIndex = 0;

    concentricGroups.forEach(group => {
        group.forEach(prop => {
            detailedOrderMap.set(prop, orderIndex++);
        });
    });

    // Fallback to the CONCENTRIC_PROPERTY_ORDER for any properties not in the detailed map
    CONCENTRIC_PROPERTY_ORDER.forEach((prop, index) => {
        if (!detailedOrderMap.has(prop)) {
            detailedOrderMap.set(prop, 1000 + index); // Offset to ensure they come after the detailed ones
        }
    });

    // First sort all properties by the concentric order
    const sortedProps = [...properties].sort((a, b) => {
        const indexA = detailedOrderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
        const indexB = detailedOrderMap.get(b) ?? Number.MAX_SAFE_INTEGER;

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

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}

/**
 * Optimized Concentric Sorting using Counting Sort with better group handling
 * @param properties - The properties to sort
 * @param orderMap - The order map
 * @returns The sorting result
 */
export function optimizedConcentricSort(
    properties: string[],
    orderMap: Map<string, number>
): SortingResult {
    // Define property groups for concentric ordering (similar to the detailed groups in sortByConcentricOrder)
    const concentricGroups = [
        // Positioning
        ['position', 'top', 'right', 'bottom', 'left', 'z-index',
            'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
            'inset-inline', 'inset-inline-start', 'inset-inline-end'],

        // Container queries
        ['container', 'container-type', 'container-name'],

        // Display & Box Model
        ['display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
            'flex-shrink', 'flex-basis', 'justify-content', 'align-items', 'align-content',
            'order', 'gap', 'row-gap', 'column-gap'],

        // Grid
        ['grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
            'grid-template-areas', 'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow',
            'grid-column', 'grid-column-start', 'grid-column-end', 'grid-row', 'grid-row-start',
            'grid-row-end', 'grid-area'],

        // Dimensions
        ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'aspect-ratio'],

        // Margins
        ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'margin-block', 'margin-block-start', 'margin-block-end',
            'margin-inline', 'margin-inline-start', 'margin-inline-end'],

        // Padding
        ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'padding-block', 'padding-block-start', 'padding-block-end',
            'padding-inline', 'padding-inline-start', 'padding-inline-end'],

        // Physical borders
        ['border', 'border-width', 'border-style', 'border-color', 'border-radius'],

        // Logical borders
        ['border-block', 'border-inline', 'border-start-start-radius', 'border-start-end-radius',
            'border-end-start-radius', 'border-end-end-radius'],

        // Background
        ['background', 'background-color', 'background-image', 'background-position', 'background-size'],

        // Typography
        ['color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height'],

        // Other visual properties
        ['transform', '-webkit-transform', '-moz-transform', 'filter', 'backdrop-filter'],

        // Miscellaneous
        ['cursor', '--custom-property']
    ];

    const maxIndex = Math.max(...Array.from(orderMap.values()));
    const buckets: string[][] = Array.from({ length: maxIndex + 1 }, () => []);
    const ungrouped: string[] = [];

    // Create a detailed order map for modern CSS properties
    const detailedOrderMap = new Map<string, number>();
    let orderIndex = 0;

    concentricGroups.forEach(group => {
        group.forEach(prop => {
            detailedOrderMap.set(prop, orderIndex++);
        });
    });

    // Now merge with the provided orderMap, favoring the detailed mappings
    // Create a new map from both maps (avoiding spread operator for compatibility)
    const finalOrderMap = new Map<string, number>();
    // Copy entries from orderMap
    orderMap.forEach((value, key) => {
        finalOrderMap.set(key, value);
    });
    // Add entries from detailedOrderMap (these will overwrite any duplicates)
    detailedOrderMap.forEach((value, key) => {
        finalOrderMap.set(key, value);
    });

    // Sort properties using the enhanced map
    properties.forEach(property => {
        const index = finalOrderMap.get(property);
        if (index !== undefined) {
            buckets[index].push(property);
        } else {
            ungrouped.push(property);
        }
    });

    // Group similar properties
    const result: string[] = [];
    let lastIndex = -100; // A value that won't match any initial index

    for (let i = 0; i < buckets.length; i++) {
        if (buckets[i].length > 0) {
            // Add spacing between logical groups
            if (i > 0 && i - lastIndex > 5) { // Arbitrary threshold to detect group changes
                result.push('');
            }
            result.push(...buckets[i].sort()); // Sort properties within same position
            lastIndex = i;
        }
    }

    // Add ungrouped properties at the end with a blank line if there are other properties
    if (ungrouped.length > 0 && result.length > 0) {
        result.push('');
        result.push(...ungrouped.sort());
    } else if (ungrouped.length > 0) {
        result.push(...ungrouped.sort());
    }

    return {
        success: true,
        originalProperties: properties,
        sortedProperties: result
    };
}
