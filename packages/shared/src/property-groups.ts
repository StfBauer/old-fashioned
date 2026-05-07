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
    [
        'display', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'flex-flow', 'flex-direction', 'flex-wrap',
        'justify-content', 'justify-items', 'justify-self',
        'align-items', 'align-content', 'align-self',
        'place-content', 'place-items', 'place-self',
        'order', 'gap', 'row-gap', 'column-gap',
    ],

    // Grid
    ['grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
        'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow', 'grid-column', 'grid-column-start',
        'grid-column-end', 'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area'],

    // Dimensions
    [
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'aspect-ratio',
        'block-size', 'min-block-size', 'max-block-size',
        'inline-size', 'min-inline-size', 'max-inline-size',
    ],

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
    [
        'background', 'background-color', 'background-image', 'background-position',
        'background-position-x', 'background-position-y', 'background-size',
        'background-repeat', 'background-attachment', 'background-origin', 'background-clip',
        'background-blend-mode',
        'color', 'opacity', 'box-shadow', 'text-shadow',
        'filter', 'backdrop-filter',
        'clip-path',
        'mask', 'mask-image', 'mask-size', 'mask-repeat', 'mask-position', 'mask-origin', 'mask-clip',
        'mix-blend-mode', 'isolation',
        'object-fit', 'object-position',
        'will-change', 'contain', 'content-visibility',
        'color-scheme', 'accent-color', 'caret-color',
    ],

    // Typography
    [
        'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant',
        'font-stretch', 'font-feature-settings', 'font-variation-settings', 'font-optical-sizing',
        'line-height', 'letter-spacing',
        'text-align', 'text-align-last', 'text-decoration', 'text-decoration-color',
        'text-decoration-style', 'text-decoration-thickness',
        'text-indent', 'text-overflow', 'text-rendering', 'text-transform', 'text-wrap',
        'text-underline-offset', 'white-space',
        'word-break', 'word-spacing', 'word-wrap', 'vertical-align',
        'writing-mode', 'text-orientation', 'direction', 'unicode-bidi',
    ],

    // Columns
    [
        'columns', 'column-count', 'column-width',
        'column-rule', 'column-rule-width', 'column-rule-style', 'column-rule-color',
        'column-fill', 'column-span',
    ],

    // Scroll & Overflow
    [
        'overflow', 'overflow-x', 'overflow-y',
        'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y',
        'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align', 'scroll-snap-stop',
        'scroll-margin', 'scroll-margin-top', 'scroll-margin-right',
        'scroll-margin-bottom', 'scroll-margin-left',
        'scroll-padding', 'scroll-padding-top', 'scroll-padding-right',
        'scroll-padding-bottom', 'scroll-padding-left',
        'scrollbar-color', 'scrollbar-width',
    ],

    // Other
    [
        'cursor', 'pointer-events', 'touch-action', 'user-select', 'resize',
        'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
        'list-style', 'list-style-type', 'list-style-position', 'list-style-image',
        'table-layout', 'empty-cells', 'caption-side', 'border-spacing', 'border-collapse',
        'content', 'quotes', 'counter-reset', 'counter-increment',
        'transition', 'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay',
        'transform', 'transform-origin', 'transform-style', 'transform-box',
        'translate', 'rotate', 'scale',
        'perspective', 'perspective-origin',
        'offset', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor',
        'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
        'animation-delay', 'animation-iteration-count', 'animation-direction',
        'animation-fill-mode', 'animation-play-state', 'animation-timeline',
        'view-transition-name',
        'appearance',
    ],
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
 * Concentric CSS property groups (grouped form of CONCENTRIC_PROPERTY_ORDER)
 * Used by sortByGroups — mirrors the flat order but organised into logical groups.
 */
export const CONCENTRIC_PROPERTY_GROUPS: string[][] = [
    // Positioning
    [
        'position', 'top', 'right', 'bottom', 'left', 'z-index',
        'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
        'inset-inline', 'inset-inline-start', 'inset-inline-end',
    ],

    // Container
    ['container', 'container-type', 'container-name'],

    // Display & Flex
    [
        'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow',
        'flex-grow', 'flex-shrink', 'flex-basis',
        'justify-content', 'justify-items', 'justify-self',
        'align-items', 'align-content', 'align-self',
        'place-content', 'place-items', 'place-self',
        'order', 'gap', 'row-gap', 'column-gap', 'float', 'clear', 'box-sizing',
    ],

    // Grid
    [
        'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
        'grid-template-areas', 'grid-auto-columns', 'grid-auto-rows', 'grid-auto-flow',
        'grid-column', 'grid-column-start', 'grid-column-end',
        'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area',
    ],

    // Dimensions
    [
        'width', 'min-width', 'max-width',
        'height', 'min-height', 'max-height',
        'aspect-ratio',
        'block-size', 'min-block-size', 'max-block-size',
        'inline-size', 'min-inline-size', 'max-inline-size',
    ],

    // Margin
    [
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'margin-block', 'margin-block-start', 'margin-block-end',
        'margin-inline', 'margin-inline-start', 'margin-inline-end',
    ],

    // Padding
    [
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'padding-block', 'padding-block-start', 'padding-block-end',
        'padding-inline', 'padding-inline-start', 'padding-inline-end',
    ],

    // Border
    [
        'border', 'border-width', 'border-style', 'border-color',
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
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-right-radius', 'border-bottom-left-radius',
        'border-start-start-radius', 'border-start-end-radius',
        'border-end-start-radius', 'border-end-end-radius',
        'border-image', 'border-image-source', 'border-image-slice',
        'border-image-width', 'border-image-outset', 'border-image-repeat',
    ],

    // Columns
    [
        'columns', 'column-count', 'column-width',
        'column-rule', 'column-rule-width', 'column-rule-style', 'column-rule-color',
        'column-fill', 'column-span',
    ],

    // Background & Color
    [
        'background', 'background-color', 'background-image', 'background-repeat',
        'background-attachment', 'background-position', 'background-position-x',
        'background-position-y', 'background-clip', 'background-origin',
        'background-size', 'background-blend-mode',
        'color',
    ],

    // Typography
    [
        'font', 'font-family', 'font-size', 'font-weight', 'font-style',
        'font-variant', 'font-stretch', 'font-feature-settings', 'font-variation-settings',
        'font-optical-sizing', 'line-height', 'letter-spacing',
        'text-align', 'text-align-last', 'text-decoration', 'text-decoration-color',
        'text-decoration-style', 'text-decoration-thickness', 'text-indent', 'text-justify',
        'text-overflow', 'text-rendering', 'text-shadow', 'text-transform', 'text-wrap',
        'text-underline-offset', 'word-break', 'word-spacing', 'word-wrap', 'white-space',
        'vertical-align', 'writing-mode', 'text-orientation', 'direction', 'unicode-bidi',
    ],

    // Visual & Scroll
    [
        'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
        'overscroll-behavior', 'overscroll-behavior-x', 'overscroll-behavior-y',
        'list-style', 'list-style-position', 'list-style-type', 'list-style-image',
        'table-layout', 'empty-cells', 'caption-side', 'border-spacing', 'border-collapse',
        'clip-path', 'mask', 'mask-image', 'mask-size', 'mask-repeat',
        'mask-position', 'mask-origin', 'mask-clip',
        'filter', 'backdrop-filter', 'box-shadow',
        'mix-blend-mode', 'isolation',
        'object-fit', 'object-position',
        'will-change', 'contain', 'content-visibility',
        'color-scheme', 'accent-color', 'caret-color',
        'scrollbar-color', 'scrollbar-width',
        'scroll-behavior', 'scroll-snap-type', 'scroll-snap-align', 'scroll-snap-stop',
        'scroll-margin', 'scroll-margin-top', 'scroll-margin-right',
        'scroll-margin-bottom', 'scroll-margin-left',
        'scroll-padding', 'scroll-padding-top', 'scroll-padding-right',
        'scroll-padding-bottom', 'scroll-padding-left',
    ],

    // Transform & Animation
    [
        'transform', 'transform-origin', 'transform-style', 'transform-box',
        'translate', 'rotate', 'scale',
        'perspective', 'perspective-origin',
        'offset', 'offset-path', 'offset-distance', 'offset-rotate', 'offset-anchor',
        'transition', 'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay',
        'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
        'animation-delay', 'animation-iteration-count', 'animation-direction',
        'animation-fill-mode', 'animation-play-state', 'animation-timeline',
        'view-transition-name',
    ],

    // Interaction & Generated Content
    [
        'content', 'quotes', 'counter-reset', 'counter-increment',
        'resize', 'cursor', 'pointer-events', 'touch-action', 'user-select',
        'nav-index', 'nav-up', 'nav-right', 'nav-down', 'nav-left',
        'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
        'appearance',
    ],
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
        "flex-basis", "flex-grow", "flex-shrink", "flex-wrap", "justify-content", "justify-items",
        "justify-self", "align-items", "align-content", "align-self",
        "place-content", "place-items", "place-self",
        "order", "gap", "row-gap", "column-gap",
    ],

    // Grid
    [
        "grid", "grid-template", "grid-template-columns", "grid-template-rows", "grid-template-areas",
        "grid-auto-columns", "grid-auto-rows", "grid-auto-flow", "grid-column", "grid-column-start",
        "grid-column-end", "grid-row", "grid-row-start", "grid-row-end", "grid-area"
    ],

    // Box sizing (ensure aspect-ratio stays very close to width/height)
    [
        "box-sizing", "width", "min-width", "max-width", "height", "min-height", "max-height",
        "aspect-ratio",
        "block-size", "min-block-size", "max-block-size",
        "inline-size", "min-inline-size", "max-inline-size",
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
        "font-variant", "font-weight", "font-stretch",
        "font-feature-settings", "font-variation-settings", "font-optical-sizing",
        "line-height", "letter-spacing",
        "text-align", "text-align-last", "text-decoration", "text-decoration-color",
        "text-decoration-style", "text-decoration-thickness",
        "text-indent", "text-justify", "text-overflow", "text-rendering", "text-shadow",
        "text-transform", "text-wrap", "text-underline-offset", "white-space",
        "word-break", "word-spacing", "word-wrap", "vertical-align",
        "writing-mode", "text-orientation", "direction", "unicode-bidi",
    ],

    // Visual styling
    [
        "list-style", "list-style-position", "list-style-type", "list-style-image",
        "table-layout", "empty-cells", "caption-side", "border-spacing", "border-collapse",
        "content", "quotes", "counter-reset", "counter-increment", "resize", "cursor",
        "user-select", "touch-action", "pointer-events",
        "nav-index", "nav-up", "nav-right", "nav-down", "nav-left",
        "box-shadow", "opacity", "filter", "backdrop-filter",
        "clip-path",
        "mask", "mask-image", "mask-size", "mask-repeat", "mask-position", "mask-origin", "mask-clip",
        "mix-blend-mode", "isolation",
        "object-fit", "object-position",
        "will-change", "contain", "content-visibility",
        "color-scheme", "accent-color", "caret-color",
        "scrollbar-color", "scrollbar-width",
        "scroll-behavior", "scroll-snap-type", "scroll-snap-align", "scroll-snap-stop",
        "scroll-margin", "scroll-margin-top", "scroll-margin-right",
        "scroll-margin-bottom", "scroll-margin-left",
        "scroll-padding", "scroll-padding-top", "scroll-padding-right",
        "scroll-padding-bottom", "scroll-padding-left",
        "overscroll-behavior", "overscroll-behavior-x", "overscroll-behavior-y",
        "outline", "outline-width", "outline-style", "outline-color", "outline-offset",
    ],

    // Animation and interactivity
    [
        "transition", "transition-delay", "transition-timing-function", "transition-duration",
        "transition-property", "transform", "transform-origin", "transform-style", "transform-box",
        "translate", "rotate", "scale",
        "perspective", "perspective-origin",
        "offset", "offset-path", "offset-distance", "offset-rotate", "offset-anchor",
        "animation", "animation-name", "animation-duration", "animation-play-state",
        "animation-timing-function", "animation-delay", "animation-iteration-count",
        "animation-direction", "animation-fill-mode", "animation-timeline",
        "view-transition-name",
    ],

    // Columns
    [
        "columns", "column-count", "column-width",
        "column-rule", "column-rule-width", "column-rule-style", "column-rule-color",
        "column-fill", "column-span",
    ],
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
