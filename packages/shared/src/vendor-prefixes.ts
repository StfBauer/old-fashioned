/**
 * Handler for vendor-prefixed properties
 */

/**
 * List of common vendor prefixes
 */
export const VENDOR_PREFIXES = ['-webkit-', '-moz-', '-ms-', '-o-'];

/**
 * Extract the base property name from a potentially vendor-prefixed property
 * @param property - The CSS property name
 * @returns Object with base property name and prefix if found
 */
export function extractBaseProperty(property: string): {
    baseProp: string;
    prefix: string | null;
} {
    const normalizedProp = property.toLowerCase().trim();

    for (const prefix of VENDOR_PREFIXES) {
        if (normalizedProp.startsWith(prefix)) {
            return {
                baseProp: normalizedProp.slice(prefix.length),
                prefix
            };
        }
    }

    return {
        baseProp: normalizedProp,
        prefix: null
    };
}

/**
 * Group properties by their base name (without vendor prefixes)
 * @param properties - List of CSS properties
 * @returns Map of base property name to array of full property names
 */
export function groupPropertiesByBase(properties: string[]): Map<string, string[]> {
    const prefixMap = new Map<string, string[]>();

    for (const prop of properties) {
        const { baseProp } = extractBaseProperty(prop);

        if (!prefixMap.has(baseProp)) {
            prefixMap.set(baseProp, []);
        }
        prefixMap.get(baseProp)!.push(prop);
    }

    return prefixMap;
}

/**
 * Property families to ensure even non-prefixed but related properties sort together
 */
export const PROPERTY_FAMILIES: Record<string, string[]> = {
    'transform': ['transform-origin', 'transform-style', 'transform-box'],
    'transition': ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
    'animation': ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay',
        'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'],
    'background': ['background-color', 'background-image', 'background-position', 'background-size',
        'background-repeat', 'background-origin', 'background-clip', 'background-attachment'],
    'border': ['border-width', 'border-style', 'border-color', 'border-radius',
        'border-top', 'border-right', 'border-bottom', 'border-left'],
    'margin': ['margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'margin-inline', 'margin-block'],
    'padding': ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'padding-inline', 'padding-block'],
    'text': ['text-align', 'text-decoration', 'text-transform', 'text-shadow', 'text-overflow']
};
