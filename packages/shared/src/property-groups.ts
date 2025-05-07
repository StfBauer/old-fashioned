/**
 * Default CSS property groups for Old Fashioned sorting
 */

/**
 * Default property grouping similar to CSSComb
 */
export const DEFAULT_PROPERTY_GROUPS: string[][] = [
    // Positioning
    [
        'position', 'top', 'right', 'bottom', 'left', 'z-index',
        'inset', 'inset-block', 'inset-inline', 'inset-block-start', 'inset-block-end',
        'inset-inline-start', 'inset-inline-end'
    ],

    // Box Model & Display
    [
        'display', 'visibility', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
        'overflow-wrap', 'clip', 'zoom', 'isolation',
        'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-flow', 'flex-direction', 'flex-wrap',
        'place-content', 'place-items', 'place-self',
        'grid', 'grid-area', 'grid-template', 'grid-template-columns', 'grid-template-rows',
        'grid-template-areas', 'grid-column', 'grid-column-start', 'grid-column-end',
        'grid-row', 'grid-row-start', 'grid-row-end', 'grid-auto-flow', 'grid-auto-columns',
        'grid-auto-rows', 'subgrid',
        'gap', 'row-gap', 'column-gap',
        'justify-content', 'align-items', 'align-content', 'align-self', 'justify-items',
        'justify-self', 'order',
        'columns', 'column-width', 'column-count', 'column-gap', 'column-rule',
        'contain', 'contain-intrinsic-size', 'container', 'container-type', 'container-name'
    ],

    // Box sizing & dimensions
    [
        'box-sizing',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'aspect-ratio'
    ],

    // Margin - regular and logical
    [
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'margin-block', 'margin-block-start', 'margin-block-end',
        'margin-inline', 'margin-inline-start', 'margin-inline-end'
    ],

    // Padding - regular and logical
    [
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'padding-block', 'padding-block-start', 'padding-block-end',
        'padding-inline', 'padding-inline-start', 'padding-inline-end'
    ],

    // Border - regular and logical
    [
        'border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
        'border-block', 'border-block-width', 'border-block-style', 'border-block-color',
        'border-block-start', 'border-block-start-width', 'border-block-start-style', 'border-block-start-color',
        'border-block-end', 'border-block-end-width', 'border-block-end-style', 'border-block-end-color',
        'border-inline', 'border-inline-width', 'border-inline-style', 'border-inline-color',
        'border-inline-start', 'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color',
        'border-inline-end', 'border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color'
    ],

    // Background & Colors
    [
        'background', 'background-color', 'background-image', 'background-position', 'background-size',
        'background-repeat', 'background-origin', 'background-clip', 'background-attachment', 'background-blend-mode',
        'color', 'color-scheme', 'accent-color',
        'opacity', 'backdrop-filter', 'filter'
    ],

    // Box Effects
    [
        'box-shadow', 'text-shadow',
        'mask', 'mask-image', 'mask-position', 'mask-size', 'mask-repeat', 'mask-origin'
    ],

    // Typography
    [
        'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
        'font-feature-settings', 'font-variation-settings', 'font-display', 'font-optical-sizing',
        'line-height', 'letter-spacing', 'word-spacing',
        'text-align', 'text-decoration', 'text-decoration-line', 'text-decoration-style',
        'text-decoration-color', 'text-decoration-thickness', 'text-underline-offset',
        'text-transform', 'text-indent', 'text-overflow', 'text-rendering', 'text-size-adjust',
        'text-wrap', 'white-space', 'white-space-collapse', 'overflow-wrap', 'word-break',
        'hyphens', 'writing-mode', 'direction'
    ],

    // Scrolling & Interaction
    [
        'scroll-behavior', 'overscroll-behavior', 'scroll-snap-type', 'scroll-snap-align',
        'touch-action', 'pointer-events', 'user-select', 'resize', 'cursor'
    ],

    // Transforms & Transitions
    [
        'transform', 'transform-origin', 'transform-style', 'perspective', 'perspective-origin',
        'backface-visibility', 'rotate', 'scale', 'translate',
        'transition', 'transition-property', 'transition-duration', 'transition-timing-function',
        'transition-delay'
    ],

    // Animations
    [
        'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
        'animation-delay', 'animation-iteration-count', 'animation-direction',
        'animation-fill-mode', 'animation-play-state', 'animation-composition', 'animation-timeline'
    ]
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

/**
 * Rational Order property groups - based on stylelint-config-rational-order
 * Performance: Fastest for medium to large files (0.048ms median for 1000 properties)
 */
export const RATIONAL_ORDER_GROUPS: string[][] = [
    // Positioning
    [
        'position', 'top', 'right', 'bottom', 'left', 'z-index',
    ],
    // Display & Box Model
    [
        'display', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-direction',
        'flex-flow', 'flex-wrap', 'grid', 'grid-area', 'grid-template', 'grid-template-columns',
        'grid-template-rows', 'grid-column', 'grid-row', 'align-content', 'align-items',
        'align-self', 'justify-content', 'order', 'float', 'clear', 'box-sizing',
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    ],
    // Border
    [
        'border', 'border-color', 'border-style', 'border-width', 'border-top',
        'border-right', 'border-bottom', 'border-left', 'border-radius',
    ],
    // Background
    [
        'background', 'background-attachment', 'background-clip', 'background-color',
        'background-image', 'background-position', 'background-repeat', 'background-size',
        'color',
    ],
    // Typography
    [
        'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight',
        'letter-spacing', 'line-height', 'list-style', 'text-align', 'text-decoration',
        'text-indent', 'text-overflow', 'text-shadow', 'text-transform', 'white-space',
        'word-spacing',
    ],
    // Visual
    [
        'opacity', 'visibility', 'cursor', 'pointer-events', 'user-select',
    ],
    // Animation
    [
        'transition', 'transition-delay', 'transition-duration', 'transition-property',
        'transition-timing-function', 'transform', 'animation',
    ],
];

/**
 * Idiomatic Order property groups - based on stylelint-config-idiomatic-order
 * Performance: Most consistent across all file sizes (0.048ms median for 1000 properties)
 */
export const IDIOMATIC_ORDER_GROUPS: string[][] = [
    // Content
    [
        'content', 'quotes',
    ],
    // Display & Position
    [
        'display', 'visibility', 'position', 'top', 'right', 'bottom', 'left',
        'z-index', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
        'clip', 'zoom', 'flex-direction', 'flex-order', 'flex-pack', 'flex-align',
    ],
    // Box model
    [
        'box-sizing', 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    ],
    // Typography
    [
        'font', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant',
        'font-size-adjust', 'font-stretch', 'line-height', 'letter-spacing', 'text-align',
        'text-transform', 'text-decoration', 'text-indent', 'text-overflow', 'word-spacing',
    ],
    // Visual
    [
        'color', 'background', 'background-color', 'background-image', 'background-repeat',
        'background-attachment', 'background-position', 'background-size',
        'border', 'border-width', 'border-style', 'border-color', 'border-radius',
    ],
    // Interaction & Animation
    [
        'opacity', 'filter', 'list-style', 'outline', 'outline-width', 'outline-style',
        'outline-color', 'cursor', 'transition', 'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay', 'transform', 'animation',
    ],
];

/**
 * Utility function to check if property groups include a specific CSS property
 */
export function hasProperty(property: string): boolean {
    return DEFAULT_PROPERTY_GROUPS.some(group =>
        group.some(prop => prop === property)
    );
}
