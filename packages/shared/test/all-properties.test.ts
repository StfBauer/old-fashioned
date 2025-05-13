import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import { SortingOptions } from '../src/types';

describe('Comprehensive property sorting across all strategies', () => {
    // Create a comprehensive list of CSS properties including modern features
    const allProperties = [
        // Modern container properties
        'container', 'container-type', 'container-name',

        // Position properties
        'position', 'top', 'right', 'bottom', 'left', 'z-index',

        // Logical position properties
        'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
        'inset-inline', 'inset-inline-start', 'inset-inline-end',

        // Display and box model
        'display', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
        'flex-flow', 'flex-direction', 'flex-wrap', 'justify-content',
        'align-items', 'align-content', 'align-self', 'order',

        // Gap properties
        'gap', 'row-gap', 'column-gap',

        // Grid properties
        'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
        'grid-template-areas', 'grid-auto-columns', 'grid-auto-rows',
        'grid-auto-flow', 'grid-column', 'grid-column-start', 'grid-column-end',
        'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area',

        // Dimensions
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'aspect-ratio',

        // Margin properties - physical
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',

        // Margin properties - logical
        'margin-block', 'margin-block-start', 'margin-block-end',
        'margin-inline', 'margin-inline-start', 'margin-inline-end',

        // Border properties - physical
        'border', 'border-width', 'border-style', 'border-color',
        'border-top', 'border-top-width', 'border-top-style', 'border-top-color',
        'border-right', 'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left', 'border-left-width', 'border-left-style', 'border-left-color',
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-right-radius', 'border-bottom-left-radius',

        // Border properties - logical
        'border-block', 'border-block-width', 'border-block-style', 'border-block-color',
        'border-block-start', 'border-block-start-width', 'border-block-start-style', 'border-block-start-color',
        'border-block-end', 'border-block-end-width', 'border-block-end-style', 'border-block-end-color',
        'border-inline', 'border-inline-width', 'border-inline-style', 'border-inline-color',
        'border-inline-start', 'border-inline-start-width', 'border-inline-start-style', 'border-inline-start-color',
        'border-inline-end', 'border-inline-end-width', 'border-inline-end-style', 'border-inline-end-color',
        'border-start-start-radius', 'border-start-end-radius', 'border-end-start-radius', 'border-end-end-radius',

        // Padding properties - physical
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',

        // Padding properties - logical
        'padding-block', 'padding-block-start', 'padding-block-end',
        'padding-inline', 'padding-inline-start', 'padding-inline-end',

        // Visual properties
        'background', 'background-color', 'background-image', 'background-position',
        'background-size', 'background-repeat', 'color', 'opacity',
        'box-shadow', 'text-shadow', 'backdrop-filter', 'filter',

        // Typography properties
        'font', 'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'text-align', 'text-decoration', 'text-transform',
        'white-space', 'letter-spacing',

        // Other properties
        'overflow', 'cursor', 'transition', 'transform', 'animation',

        // Custom property
        '--custom-property',

        // Vendor prefixed properties
        '-webkit-transform', '-moz-transform'
    ];

    it('should correctly sort all properties using grouped strategy', () => {
        // Shuffle the properties to ensure they're not already sorted
        const shuffledProps = [...allProperties].sort(() => Math.random() - 0.5);

        const result = sortProperties(shuffledProps, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false,
            sortPropertiesWithinGroups: true // Add the missing property
        });

        expect(result.success).toBe(true);

        // Verify key property relationships in grouped strategy
        const positionIndex = result.sortedProperties!.indexOf('position');
        const insetIndex = result.sortedProperties!.indexOf('inset');
        const containerIndex = result.sortedProperties!.indexOf('container');
        const displayIndex = result.sortedProperties!.indexOf('display');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const borderIndex = result.sortedProperties!.indexOf('border');
        const colorIndex = result.sortedProperties!.indexOf('color');

        // Positioning properties should be grouped together
        expect(Math.abs(positionIndex - insetIndex)).toBeLessThanOrEqual(15);

        // Container properties should be in their own group
        expect(Math.abs(containerIndex - result.sortedProperties!.indexOf('container-type'))).toBeLessThanOrEqual(2);

        // Box model properties should be grouped
        expect(Math.abs(displayIndex - result.sortedProperties!.indexOf('flex'))).toBeLessThanOrEqual(15);
        expect(Math.abs(displayIndex - result.sortedProperties!.indexOf('gap'))).toBeLessThanOrEqual(15);            // Logical properties should be grouped with their physical counterparts
        expect(Math.abs(
            result.sortedProperties!.indexOf('margin') -
            result.sortedProperties!.indexOf('margin-block')
        )).toBeLessThanOrEqual(10);

        // Check the resulting array contains all the original properties
        // (excluding the empty line that's always added after CSS variables)
        expect(result.sortedProperties!.filter(p => p !== '').length).toBe(allProperties.length);
    });

    it('should correctly sort all properties using alphabetical strategy', () => {
        const shuffledProps = [...allProperties].sort(() => Math.random() - 0.5);

        const result = sortProperties(shuffledProps, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // In alphabetical sorting, properties should be in alphabetical order
        const sortedProps = [...shuffledProps].sort();

        // Check a few key pairs to ensure alphabetical order
        expect(result.sortedProperties!.indexOf('display'))
            .toBeLessThan(result.sortedProperties!.indexOf('position'));

        expect(result.sortedProperties!.indexOf('aspect-ratio'))
            .toBeLessThan(result.sortedProperties!.indexOf('border'));

        expect(result.sortedProperties!.indexOf('color'))
            .toBeLessThan(result.sortedProperties!.indexOf('z-index'));

        // Vendor prefixed properties should sort by their base name
        // Update test expectations to match our new algorithm
        // All properties with the same base name should be grouped, with vendor-prefixed versions first

        // For transform properties:
        const transformIndex = result.sortedProperties!.indexOf('transform');
        const webkitTransformIndex = result.sortedProperties!.indexOf('-webkit-transform');
        const mozTransformIndex = result.sortedProperties!.indexOf('-moz-transform');

        // Verify they're all in correct indices relative to each other
        if (webkitTransformIndex !== -1 && transformIndex !== -1) {
            // Update to match our new algorithm's behavior
            // Allow indexes to be adjacent with maximum distance of 2
            expect(Math.abs(webkitTransformIndex - transformIndex)).toBeLessThanOrEqual(2);
        }
        if (mozTransformIndex !== -1 && transformIndex !== -1) {
            // Update to match our new algorithm's behavior
            expect(Math.abs(mozTransformIndex - transformIndex)).toBeLessThanOrEqual(2);
        }

        // Check the resulting array contains all the original properties
        // plus one empty line after CSS variables (which we always add now)
        const hasCssVariables = allProperties.some(p => p.startsWith('--'));
        expect(result.sortedProperties!.length).toBe(allProperties.length + (hasCssVariables ? 1 : 0));
    });

    it('should correctly sort all properties using concentric strategy', () => {
        const shuffledProps = [...allProperties].sort(() => Math.random() - 0.5);

        const result = sortProperties(shuffledProps, { strategy: 'concentric' });

        expect(result.success).toBe(true);

        // In concentric sorting, position comes first, then dimensions, then spacing, then visual properties
        const positionIndex = result.sortedProperties!.indexOf('position');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const paddingIndex = result.sortedProperties!.indexOf('padding');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const fontIndex = result.sortedProperties!.indexOf('font');

        // Position should come before color
        expect(positionIndex).toBeLessThan(colorIndex);

        // Margin should come before color
        expect(marginIndex).toBeLessThan(colorIndex);

        // Padding should come before color
        expect(paddingIndex).toBeLessThan(colorIndex);

        // Color should be near other visual properties
        expect(Math.abs(colorIndex - result.sortedProperties!.indexOf('background-color'))).toBeLessThanOrEqual(15);

        // Aspect ratio should be with dimensions
        const widthIndex = result.sortedProperties!.indexOf('width');
        const aspectRatioIndex = result.sortedProperties!.indexOf('aspect-ratio');
        if (widthIndex >= 0 && aspectRatioIndex >= 0) {
            expect(Math.abs(widthIndex - aspectRatioIndex)).toBeLessThanOrEqual(15);
        }            // Check the resulting array contains all the original properties (excluding empty lines)
        // (including the empty line after CSS variables if present)
        expect(result.sortedProperties!.filter(p => p !== '').length).toBe(allProperties.length);
    });

    it('should correctly sort all properties using idiomatic strategy', () => {
        const shuffledProps = [...allProperties].sort(() => Math.random() - 0.5);

        const result = sortProperties(shuffledProps, { strategy: 'idiomatic' });

        expect(result.success).toBe(true);

        // In idiomatic sorting, position comes first, then box model, dimensions, spacing, visuals
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');

        // Position should come before color
        expect(positionIndex).toBeLessThan(colorIndex);

        // Width should be in box sizing section, before color
        const widthIndex = result.sortedProperties!.indexOf('width');
        expect(widthIndex).toBeLessThan(colorIndex);

        // Container properties should be near the top
        const containerIndex = result.sortedProperties!.indexOf('container');
        if (containerIndex >= 0) {
            expect(containerIndex).toBeLessThan(colorIndex);
        }

        // Check the resulting array contains all the original properties
        expect(result.sortedProperties!.filter(p => p !== '').length).toBe(allProperties.length);
    });
});
