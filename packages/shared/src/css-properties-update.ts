import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_PROPERTY_GROUPS, RATIONAL_ORDER_GROUPS, IDIOMATIC_ORDER_GROUPS } from './property-groups';

// Import from known-css-properties or fetch from CDN
async function getLatestCssProperties(): Promise<string[]> {
    try {
        // Try to load from the package
        const knownCssProperties = require('known-css-properties');
        return knownCssProperties.all;
    } catch (error) {
        // Fallback to fetch from CDN or cached file
        console.log('Falling back to local property list');
        return MODERN_CSS_PROPERTIES;
    }
}

/**
 * Find CSS properties that aren't in any group
 */
export async function findMissingProperties(): Promise<string[]> {
    const allKnownProperties = await getLatestCssProperties();
    const allGroupedProperties = new Set<string>();

    // Collect all properties from all existing groups
    [...DEFAULT_PROPERTY_GROUPS, ...RATIONAL_ORDER_GROUPS, ...IDIOMATIC_ORDER_GROUPS]
        .flat()
        .forEach(prop => allGroupedProperties.add(prop));

    // Find properties that exist in the known list but not in our groups
    return allKnownProperties.filter(prop => !allGroupedProperties.has(prop));
}

/**
 * Modern CSS properties that should be added to appropriate groups
 */
export const MODERN_CSS_PROPERTIES = [
    // Container queries
    'container', 'container-type', 'container-name',

    // Aspect ratio
    'aspect-ratio',

    // Scroll behavior
    'scroll-behavior', 'overscroll-behavior',
    'scroll-snap-type', 'scroll-snap-align',

    // Logical properties
    'margin-block', 'margin-block-start', 'margin-block-end',
    'margin-inline', 'margin-inline-start', 'margin-inline-end',
    'padding-block', 'padding-block-start', 'padding-block-end',
    'padding-inline', 'padding-inline-start', 'padding-inline-end',
    'border-block', 'border-block-start', 'border-block-end',
    'border-inline', 'border-inline-start', 'border-inline-end',
    'inset', 'inset-block', 'inset-inline',

    // Grid level 2
    'grid-template', 'subgrid',

    // Modern display values
    'display: contents', 'display: flow-root',

    // Modern color syntax
    'color-scheme', 'accent-color',

    // Typography
    'font-display', 'font-variation-settings',
    'text-underline-offset', 'text-decoration-thickness',
    'text-wrap', 'white-space-collapse',

    // Modern transforms
    'rotate', 'scale', 'translate',

    // Modern mask properties
    'mask', 'mask-image', 'mask-size',

    // Animation
    'animation-composition', 'animation-timeline',

    // Columns
    'columns', 'column-width', 'column-count',

    // Others
    'backdrop-filter', 'backface-visibility',
    'place-content', 'place-items', 'place-self',
    'gap', 'row-gap', 'column-gap',
    'contain', 'contain-intrinsic-size',
    'text-size-adjust', 'touch-action'
];
