/**
 * Default CSS property groups for Old Fashioned sorting
 */

/**
 * Default property grouping similar to CSSComb
 */
export const DEFAULT_PROPERTY_GROUPS: string[][] = [
    // Positioning
    ['position', 'inset', 'inset-block', 'inset-block-start', 'inset-block-end', 'inset-inline',
        'inset-inline-start', 'inset-inline-end', 'top', 'right', 'bottom', 'left', 'z-index'],

    // Container
    ['container', 'container-type', 'container-name'],

    // Box Model
    ['display', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-flow', 'flex-direction', 'flex-wrap',
        'justify-content', 'align-items', 'align-content', 'align-self', 'order', 'gap', 'row-gap', 'column-gap'],

    // Grid
    ['grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
        'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow', 'grid-column', 'grid-column-start',
        'grid-column-end', 'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area'],

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

    // Border
    ['border', 'border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
        'border-block', 'border-block-width', 'border-block-style', 'border-block-color',
        'border-block-start', 'border-block-start-width', 'border-block-start-style', 'border-block-start-color',
        'border-block-end', 'border-block-end-width', 'border-block-end-style', 'border-block-end-color',
        'border-inline', 'border-inline-width', 'border-inline-style', 'border-inline-color',
        'border-inline-start', 'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color',
        'border-inline-end', 'border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color',
        'border-start-start-radius', 'border-start-end-radius', 'border-end-start-radius', 'border-end-end-radius'],

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
 * Concentric CSS property order
 * Going from outside (position) to inside (content and visuals)
 */
export const CONCENTRIC_PROPERTY_ORDER = [
    // Positioning
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'z-index',
    'inset',
    'inset-block',
    'inset-block-start',
    'inset-block-end',
    'inset-inline',
    'inset-inline-start',
    'inset-inline-end',

    // Position in the document flow
    'container',
    'container-type',
    'container-name',

    // Display & Box Model
    'display',
    'flex',
    'flex-direction',
    'flex-wrap',
    'flex-flow',
    'flex-grow',
    'flex-shrink',
    'flex-basis',
    'justify-content',
    'align-items',
    'align-content',
    'order',
    'gap',
    'row-gap',
    'column-gap',
    'float',
    'clear',
    'box-sizing',

    // Grid
    'grid',
    'grid-template',
    'grid-template-columns',
    'grid-template-rows',
    'grid-template-areas',
    'grid-auto-columns',
    'grid-auto-rows',
    'grid-auto-flow',
    'grid-column',
    'grid-column-start',
    'grid-column-end',
    'grid-row',
    'grid-row-start',
    'grid-row-end',
    'grid-area',

    // Dimensions
    'width',
    'min-width',
    'max-width',
    'height',
    'min-height',
    'max-height',
    'aspect-ratio', // Ensure aspect-ratio is right after the height properties

    // Margin
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'margin-block',
    'margin-block-start',
    'margin-block-end',
    'margin-inline',
    'margin-inline-start',
    'margin-inline-end',



    // Padding
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'padding-block',
    'padding-block-start',
    'padding-block-end',
    'padding-inline',
    'padding-inline-start',
    'padding-inline-end',
    'border',
    'border-width',
    'border-style',
    'border-color',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-block',
    'border-block-width',
    'border-block-style',
    'border-block-color',
    'border-block-start',
    'border-block-start-width',
    'border-block-start-style',
    'border-block-start-color',
    'border-block-end',
    'border-block-end-width',
    'border-block-end-style',
    'border-block-end-color',
    'border-inline',
    'border-inline-width',
    'border-inline-style',
    'border-inline-color',
    'border-inline-start',
    'border-inline-start-width',
    'border-inline-start-style',
    'border-inline-start-color',
    'border-inline-end',
    'border-inline-end-width',
    'border-inline-end-style',
    'border-inline-end-color',
    'border-radius',
    'border-start-start-radius',
    'border-start-end-radius',
    'border-end-start-radius',
    'border-end-end-radius',

    // Background
    'background',
    'background-color',
    'background-image',
    'background-repeat',
    'background-position',
    'background-size',

    // Typography
    'color',
    'font',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'text-align',
    'text-decoration',
    'text-transform',
    'letter-spacing',

    // Other Visual
    'opacity',
    'visibility',
    'overflow',
    'box-shadow',
    'text-shadow',
    'transform',
    'transition',
    'animation',

    // Miscellaneous
    'cursor',
    'pointer-events',
    'user-select',
    'content'
];

/**
 * Idiomatic CSS ordering groups
 * Based on Nicolas Gallagher's Idiomatic CSS principles
 * @see https://github.com/necolas/idiomatic-css
 */
export const IDIOMATIC_PROPERTY_GROUPS: string[][] = [
    // Positioning
    [
        "position", "top", "right", "bottom", "left", "z-index",
        "inset", "inset-block", "inset-block-start", "inset-block-end",
        "inset-inline", "inset-inline-start", "inset-inline-end"
    ],

    // Container queries
    [
        "container", "container-type", "container-name"
    ],

    // Display & Box Model
    [
        "display", "visibility", "float", "clear", "overflow", "overflow-x", "overflow-y",
        "clip", "zoom", "flex", "flex-direction", "flex-order", "flex-pack", "flex-align",
        "flex-basis", "flex-grow", "flex-shrink", "flex-wrap", "justify-content", "align-items",
        "align-content", "order", "gap", "row-gap", "column-gap"
    ],

    // Grid
    [
        "grid", "grid-template", "grid-template-columns", "grid-template-rows", "grid-template-areas",
        "grid-auto-columns", "grid-auto-rows", "grid-auto-flow", "grid-column", "grid-column-start",
        "grid-column-end", "grid-row", "grid-row-start", "grid-row-end", "grid-area"
    ],

    // Box sizing (ensure aspect-ratio stays very close to width/height)
    [
        "box-sizing", "width", "min-width", "max-width", "height", "min-height", "max-height", "aspect-ratio"
    ],

    // Spacing (margin, padding, border)
    [
        "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
        "margin-block", "margin-block-start", "margin-block-end",
        "margin-inline", "margin-inline-start", "margin-inline-end",

        "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
        "padding-block", "padding-block-start", "padding-block-end",
        "padding-inline", "padding-inline-start", "padding-inline-end",

        "border", "border-width", "border-style", "border-color", "border-top", "border-top-width",
        "border-top-style", "border-top-color", "border-right", "border-right-width",
        "border-right-style", "border-right-color", "border-bottom", "border-bottom-width",
        "border-bottom-style", "border-bottom-color", "border-left", "border-left-width",
        "border-left-style", "border-left-color",

        "border-block", "border-block-width", "border-block-style", "border-block-color",
        "border-block-start", "border-block-start-width", "border-block-start-style", "border-block-start-color",
        "border-block-end", "border-block-end-width", "border-block-end-style", "border-block-end-color",
        "border-inline", "border-inline-width", "border-inline-style", "border-inline-color",
        "border-inline-start", "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
        "border-inline-end", "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",

        "border-radius", "border-top-left-radius", "border-top-right-radius",
        "border-bottom-right-radius", "border-bottom-left-radius",
        "border-start-start-radius", "border-start-end-radius", "border-end-start-radius", "border-end-end-radius",

        "border-image", "border-image-source", "border-image-slice", "border-image-width",
        "border-image-outset", "border-image-repeat"
    ],

    // Background
    [
        "background", "background-color", "background-image", "background-repeat",
        "background-attachment", "background-position", "background-position-x",
        "background-position-y", "background-clip", "background-origin",
        "background-size", "background-blend-mode"
    ],

    // Text & Typography
    [
        "color", "font", "font-family", "font-size", "font-style",
        "font-variant", "font-weight", "font-stretch", "line-height", "letter-spacing",
        "text-align", "text-align-last", "text-decoration", "text-indent", "text-justify",
        "text-overflow", "text-rendering", "text-shadow", "text-transform", "text-wrap", "white-space",
        "word-break", "word-spacing", "word-wrap", "vertical-align"
    ],

    // Visual styling
    [
        "list-style", "list-style-position", "list-style-type", "list-style-image",
        "table-layout", "empty-cells", "caption-side", "border-spacing", "border-collapse",
        "content", "quotes", "counter-reset", "counter-increment", "resize", "cursor",
        "user-select", "nav-index", "nav-up", "nav-right", "nav-down", "nav-left",
        "box-shadow", "opacity", "filter", "backdrop-filter"
    ],

    // Animation and interactivity
    [
        "transition", "transition-delay", "transition-timing-function", "transition-duration",
        "transition-property", "transform", "transform-origin", "animation", "animation-name",
        "animation-duration", "animation-play-state", "animation-timing-function",
        "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode",
        "pointer-events"
    ]
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
