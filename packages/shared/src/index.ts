/**
 * Shared utilities for Old Fashioned CSS sorting tools
 */

// Export types
export * from './types';

// Export property groups
export * from './property-groups';

// Export sorting functions - only export what's actually available
export {
    SortingOptions,
    SortingResult,
    SortingStrategy,
    sortProperties,
    adaptiveSortProperties,
    sortPropertiesWithCache
} from './sorting';

// We don't have these functions in utils yet, so let's not export them
// export {
//     shuffleArray,
//     formatNumber,
//     isCSSProperty,
//     validatePropertyArray
// } from './utils';

// Don't export css-parser if it doesn't exist yet
// export * from './css-parser';

/**
 * Concentric CSS property groups
 * Based on https://github.com/brandon-rhodes/Concentric-CSS/blob/master/style3.css
 */
export const CONCENTRIC_PROPERTY_GROUPS: string[][] = [
    // Position From Outside
    ['position', 'z-index', 'top', 'right', 'bottom', 'left'],

    // Display & Flow
    ['display', 'flex-direction', 'flex-order', 'flex-pack', 'flex-align', 'float', 'clear'],

    // Dimension
    ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],

    // Margin
    ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],

    // Border
    ['border', 'border-width', 'border-style', 'border-color', 'border-top', 'border-top-width', 'border-top-style', 'border-top-color', 'border-right', 'border-right-width', 'border-right-style', 'border-right-color', 'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color', 'border-left', 'border-left-width', 'border-left-style', 'border-left-color', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],

    // Padding
    ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

    // Background
    ['background', 'background-color', 'background-image', 'background-repeat', 'background-attachment', 'background-position', 'background-size', 'background-origin', 'background-clip'],

    // Text & Font
    ['color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'line-height', 'text-align', 'text-transform', 'text-decoration', 'text-indent', 'text-shadow', 'text-overflow', 'letter-spacing', 'word-spacing', 'white-space', 'vertical-align'],

    // Other
    ['list-style', 'list-style-type', 'list-style-position', 'list-style-image', 'table-layout', 'empty-cells', 'caption-side', 'border-spacing', 'border-collapse', 'content', 'quotes', 'counter-reset', 'counter-increment', 'resize', 'cursor', 'user-select', 'nav-index', 'nav-up', 'nav-right', 'nav-down', 'nav-left', 'transition', 'transition-delay', 'transition-timing-function', 'transition-duration', 'transition-property', 'transform', 'transform-origin', 'animation', 'animation-name', 'animation-duration', 'animation-play-state', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'opacity', 'box-shadow', 'box-sizing']
];

/**
 * Idiomatic CSS property groups
 * Based on https://github.com/necolas/idiomatic-css/blob/master/README.md
 */
export const IDIOMATIC_PROPERTY_GROUPS: string[][] = [
    // Positioning
    ['position', 'z-index', 'top', 'right', 'bottom', 'left'],

    // Box model
    ['display', 'float', 'width', 'height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

    // Borders
    ['border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],

    // Background
    ['background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'background-origin', 'background-clip', 'background-attachment'],

    // Typography
    ['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'font-size-adjust', 'font-stretch', 'line-height', 'color', 'text-align', 'text-decoration', 'text-indent', 'text-overflow', 'text-rendering', 'text-size-adjust', 'text-shadow', 'text-transform', 'letter-spacing', 'word-spacing', 'white-space', 'vertical-align'],

    // Visual
    ['list-style', 'list-style-type', 'list-style-position', 'list-style-image', 'pointer-events', 'cursor', 'opacity', 'box-shadow', 'visibility'],

    // Animation
    ['transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state', 'transform', 'transform-origin'],

    // Other
    ['content', 'quotes', 'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset', 'appearance', 'user-select']
];