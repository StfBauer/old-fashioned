/**
 * Default CSS property groups for Old Fashioned sorting
 */

/**
 * Default property grouping similar to CSSComb
 */
export const DEFAULT_PROPERTY_GROUPS: string[][] = [
    // Positioning
    ['position', 'top', 'right', 'bottom', 'left', 'z-index'],

    // Box Model
    ['display', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-flow', 'flex-direction', 'flex-wrap',
        'justify-content', 'align-items', 'align-content', 'align-self', 'order'],

    // Dimensions
    ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],

    // Margins
    ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],

    // Padding
    ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

    // Border
    ['border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color'],

    // Visual Properties
    ['background', 'background-color', 'background-image', 'background-position', 'background-size',
        'background-repeat', 'color', 'opacity', 'box-shadow', 'text-shadow'],

    // Typography
    ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
        'text-align', 'text-decoration', 'text-transform', 'white-space'],

    // Other
    ['overflow', 'cursor', 'transition', 'transform', 'animation']
];

/**
 * Property order for concentric layout (from outside to inside)
 */
export const CONCENTRIC_PROPERTY_ORDER: string[] = [
    // Content
    'content',

    // Position
    'position', 'top', 'right', 'bottom', 'left', 'z-index',

    // Display & Box Model
    'display', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content', 'align-items', 'align-content',
    'float', 'clear', 'box-sizing',

    // Dimensions
    'width', 'min-width', 'max-width',
    'height', 'min-height', 'max-height',

    // Margin
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',

    // Border
    'border', 'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',

    // Padding
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',

    // Background & Colors
    'background', 'background-color', 'background-image', 'background-position', 'background-size', 'background-repeat',
    'color', 'opacity',

    // Typography
    'font', 'font-family', 'font-size', 'font-weight', 'line-height',
    'text-align', 'text-decoration', 'text-transform', 'white-space',

    // Other visual effects
    'box-shadow', 'text-shadow',
    'transform', 'transition', 'animation'
];

/**
 * Convert CSSComb config format to Old Fashioned property groups
 */
export function convertCssCombConfig(cssCombConfig: any): string[][] | null {
    if (!cssCombConfig || !cssCombConfig['sort-order']) {
        return null;
    }

    try {
        // CSSComb config can be an array of arrays or a single array
        const sortOrder = cssCombConfig['sort-order'];

        if (Array.isArray(sortOrder[0])) {
            // It's already in the format we need
            return sortOrder;
        } else if (Array.isArray(sortOrder)) {
            // It's a flat array, convert to a single group
            return [sortOrder];
        }

        return null;
    } catch (error) {
        return null;
    }
}
