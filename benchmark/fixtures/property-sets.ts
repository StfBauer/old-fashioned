/**
 * Test fixtures for CSS property sorting benchmarks
 */

/**
 * Small set of CSS properties (10 properties)
 */
export const smallPropertySet = [
    'color',
    'margin',
    'padding',
    'width',
    'height',
    'display',
    'position',
    'background',
    'font-size',
    'z-index'
];

/**
 * Medium set of CSS properties (30 properties)
 */
export const mediumPropertySet = [
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'z-index',
    'display',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'width',
    'max-width',
    'height',
    'min-height',
    'margin',
    'margin-top',
    'margin-right',
    'padding',
    'padding-bottom',
    'border',
    'border-radius',
    'background',
    'background-color',
    'background-image',
    'color',
    'font-size',
    'font-weight',
    'text-align',
    'line-height'
];

/**
 * Large set of CSS properties (75+ properties)
 */
export const largePropertySet = [
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'z-index',
    'display',
    'visibility',
    'flex',
    'flex-basis',
    'flex-direction',
    'flex-flow',
    'flex-grow',
    'flex-shrink',
    'flex-wrap',
    'grid',
    'grid-area',
    'grid-template',
    'grid-template-areas',
    'grid-template-columns',
    'grid-template-rows',
    'justify-content',
    'align-items',
    'align-content',
    'order',
    'float',
    'clear',
    'box-sizing',
    'width',
    'min-width',
    'max-width',
    'height',
    'min-height',
    'max-height',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border',
    'border-width',
    'border-style',
    'border-color',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'background',
    'background-color',
    'background-image',
    'background-repeat',
    'background-position',
    'background-size',
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
    'word-spacing',
    'white-space',
    'vertical-align',
    'list-style',
    'table-layout',
    'caption-side',
    'opacity',
    'box-shadow',
    'text-shadow',
    'transform',
    'transform-origin',
    'transition',
    'transition-property',
    'transition-duration',
    'animation',
    'cursor',
    'pointer-events',
    'user-select',
    'content',
    'outline',
    'overflow',
    'overflow-x',
    'overflow-y'
];

/**
 * Random order variations of the property sets
 */
export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export const smallPropertySetRandom = shuffleArray(smallPropertySet);
export const mediumPropertySetRandom = shuffleArray(mediumPropertySet);
export const largePropertySetRandom = shuffleArray(largePropertySet);

/**
 * Property set with vendor prefixes mixed in
 */
export const propertySetWithVendorPrefixes = [
    'position',
    '-webkit-transform',
    'display',
    '-moz-transform',
    'width',
    'transform',
    '-ms-transform',
    'margin',
    '-webkit-transition',
    'color',
    'transition',
    '-moz-transition',
    'padding',
    '-webkit-box-shadow',
    'box-shadow'
];

/**
 * Property set with custom properties
 */
export const propertySetWithCustomProperties = [
    'position',
    'display',
    '--custom-color',
    'width',
    '--custom-spacing',
    'margin',
    'color',
    '--brand-primary',
    'padding',
    '--grid-column-gap'
];

/**
 * Real-world CSS examples from popular frameworks
 */
export const bootstrapPropertySet = [
    'display',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'margin-bottom',
    'background-color',
    'border-radius',
    'padding',
    'box-shadow',
    'transition',
    'color',
    'font-weight',
    'line-height',
    'text-align',
    'text-decoration',
    'cursor',
    'user-select'
];

export const materialUiPropertySet = [
    'position',
    'display',
    'flex-direction',
    'align-items',
    'justify-content',
    'box-sizing',
    'width',
    'max-width',
    'height',
    'margin',
    'padding',
    'border-radius',
    'background-color',
    'color',
    'font-family',
    'font-size',
    'font-weight',
    'letter-spacing',
    'line-height',
    'text-transform',
    'transition',
    'box-shadow',
    'outline',
    'overflow',
    'z-index'
];

export const tailwindClassesPropertySet = [
    'position',
    'inset',
    'z-index',
    'display',
    'flex',
    'flex-direction',
    'justify-content',
    'align-items',
    'gap',
    'margin',
    'mt',
    'mr',
    'mb',
    'ml',
    'padding',
    'pt',
    'pr',
    'pb',
    'pl',
    'w',
    'h',
    'max-w',
    'rounded',
    'border',
    'bg-color',
    'text-color',
    'font-size',
    'font-weight',
    'shadow'
];

/**
 * Random CSS generator function
 */
export function generateRandomCSS(propertyCount: number): string[] {
    const allAvailableProperties = [
        // Positioning
        'position', 'top', 'right', 'bottom', 'left', 'z-index',

        // Display & Box Model
        'display', 'overflow', 'overflow-x', 'overflow-y', 'float', 'clear',
        'box-sizing', 'visibility', 'opacity',

        // Flexbox
        'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
        'align-items', 'align-content', 'flex-grow', 'flex-shrink', 'flex-basis',
        'align-self', 'order',

        // Grid
        'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
        'grid-column-gap', 'grid-row-gap', 'grid-gap', 'grid-auto-columns',
        'grid-auto-rows', 'grid-auto-flow', 'grid-column', 'grid-row',

        // Dimensions
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',

        // Margin & Padding
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',

        // Border
        'border', 'border-width', 'border-style', 'border-color',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-right-radius', 'border-bottom-left-radius',

        // Background
        'background', 'background-color', 'background-image', 'background-repeat',
        'background-position', 'background-size', 'background-attachment',

        // Typography
        'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
        'text-align', 'text-decoration', 'text-transform', 'letter-spacing',
        'line-height', 'white-space', 'word-break', 'word-spacing', 'word-wrap',

        // Tables
        'table-layout', 'border-collapse', 'border-spacing', 'caption-side',
        'empty-cells',

        // Transforms
        'transform', 'transform-origin', 'transform-style', 'perspective',

        // Transitions & Animations
        'transition', 'transition-property', 'transition-duration',
        'transition-timing-function', 'transition-delay',
        'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
        'animation-delay', 'animation-iteration-count', 'animation-direction',

        // Misc
        'cursor', 'pointer-events', 'user-select', 'content', 'outline',
        'outline-width', 'outline-style', 'outline-color', 'outline-offset',
        'box-shadow', 'text-shadow', 'filter', 'backdrop-filter',

        // Custom properties
        '--custom-color', '--primary-color', '--secondary-color',
        '--spacing-unit', '--max-container-width', '--border-radius'
    ];

    // Add some vendor prefixes
    const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
    const vendorPrefixedProperties = ['transform', 'transition', 'animation', 'filter', 'user-select', 'box-shadow'];

    vendorPrefixedProperties.forEach(prop => {
        vendorPrefixes.forEach(prefix => {
            allAvailableProperties.push(`${prefix}${prop}`);
        });
    });

    // Select random properties
    const selectedProperties: string[] = [];
    while (selectedProperties.length < propertyCount && allAvailableProperties.length > 0) {
        const randomIndex = Math.floor(Math.random() * allAvailableProperties.length);
        const prop = allAvailableProperties[randomIndex];
        selectedProperties.push(prop);
        allAvailableProperties.splice(randomIndex, 1);
    }

    return selectedProperties;
}

/**
 * Get all property sets for comprehensive testing
 */
export function getAllPropertySets() {
    return {
        small: smallPropertySetRandom,
        medium: mediumPropertySetRandom,
        large: largePropertySetRandom,
        bootstrap: shuffleArray(bootstrapPropertySet),
        materialUi: shuffleArray(materialUiPropertySet),
        tailwind: shuffleArray(tailwindClassesPropertySet),
        random25: generateRandomCSS(25),
        random50: generateRandomCSS(50),
        random100: generateRandomCSS(100),
        vendorPrefixes: propertySetWithVendorPrefixes,
        customProperties: propertySetWithCustomProperties
    };
}
