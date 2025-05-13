import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('CSS Property Sorting - Advanced Edge Cases', () => {
    // Test case for properties with conflicting categorization
    describe('Properties with ambiguous categorization', () => {
        it('should consistently sort properties that could fit multiple categories', () => {
            const properties = [
                'container',
                'container-type',
                'container-name',
                'content',
                'counter-increment',
                'counter-reset',
                'will-change',
                'all',
                'transition',
                'animation'
            ];

            // Test different strategies for consistency
            const groupedResult = sortProperties(properties, { strategy: 'grouped' });
            const concentricResult = sortProperties(properties, { strategy: 'concentric' });
            const idiomaticResult = sortProperties(properties, { strategy: 'idiomatic' });

            expect(groupedResult.success).toBe(true);
            expect(concentricResult.success).toBe(true);
            expect(idiomaticResult.success).toBe(true);

            // Container properties should be grouped together across all strategies
            const containerProps = ['container', 'container-type', 'container-name'];

            // Test they're grouped in each strategy
            for (const result of [groupedResult, concentricResult, idiomaticResult]) {
                const indices = containerProps.map(p => result.sortedProperties!.indexOf(p));
                const range = Math.max(...indices) - Math.min(...indices);
                expect(range).toBeLessThanOrEqual(containerProps.length);
            }
        });

        it('should handle both physical and logical properties appropriately', () => {
            const properties = [
                // Physical properties
                'margin-top',
                'margin-right',
                'margin-bottom',
                'margin-left',
                'padding-top',
                'padding-right',
                'padding-bottom',
                'padding-left',
                'border-top',
                'border-right',
                'border-bottom',
                'border-left',

                // Logical properties
                'margin-block-start',
                'margin-block-end',
                'margin-inline-start',
                'margin-inline-end',
                'padding-block-start',
                'padding-block-end',
                'padding-inline-start',
                'padding-inline-end',
                'border-block-start',
                'border-block-end',
                'border-inline-start',
                'border-inline-end'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // Margin properties (both physical and logical) should be grouped together
            const marginProps = properties.filter(p => p.startsWith('margin'));
            const marginIndices = marginProps.map(p => result.sortedProperties!.indexOf(p));
            const marginRange = Math.max(...marginIndices) - Math.min(...marginIndices);

            // Padding properties should be grouped together
            const paddingProps = properties.filter(p => p.startsWith('padding'));
            const paddingIndices = paddingProps.map(p => result.sortedProperties!.indexOf(p));
            const paddingRange = Math.max(...paddingIndices) - Math.min(...paddingIndices);

            // Border properties should be grouped together
            const borderProps = properties.filter(p => p.startsWith('border'));
            const borderIndices = borderProps.map(p => result.sortedProperties!.indexOf(p));
            const borderRange = Math.max(...borderIndices) - Math.min(...borderIndices);

            // The range should be reasonable given the number of properties
            expect(marginRange).toBeLessThanOrEqual(marginProps.length + 5);
            expect(paddingRange).toBeLessThanOrEqual(paddingProps.length + 5);
            expect(borderRange).toBeLessThanOrEqual(borderProps.length + 5);
        });
    });

    // Test handling of extremely mixed property types
    describe('Extremely mixed property types', () => {
        it('should sort a mix of standard, vendor-prefixed, logical, and custom properties', () => {
            const properties = [
                // Standard properties
                'position',
                'display',
                'width',
                'height',
                'margin',
                'padding',
                'color',
                'background',

                // Vendor-prefixed properties
                '-webkit-transform',
                '-moz-transform',
                '-webkit-box-shadow',
                '-moz-box-shadow',

                // Logical properties
                'inset-block-start',
                'margin-inline',
                'padding-block',
                'border-inline-end',

                // Custom properties
                '--primary-color',
                '--spacing-unit',
                '--border-radius',

                // New/experimental properties
                'text-wrap',
                'accent-color',
                'aspect-ratio',
                'text-decoration-skip-ink',

                // CSS Grid properties
                'grid-template-columns',
                'gap',

                // Animation properties
                'transition',
                'animation-duration'
            ];

            // Test each sorting strategy
            const strategies: SortingOptions['strategy'][] = [
                'alphabetical', 'grouped', 'concentric', 'idiomatic'
            ];

            for (const strategy of strategies) {
                const result = sortProperties(properties, { strategy });

                expect(result.success).toBe(true);

                // The length of the output may be different from the input if empty lines are added
                // Extract all non-empty output properties and compare with input
                const actualProperties = result.sortedProperties!.filter(p => p !== '');

                // Now check that all properties are present and the actual properties count matches
                expect(actualProperties.length).toEqual(properties.length);
                properties.forEach(prop => {
                    expect(actualProperties.includes(prop)).toBe(true);
                });
            }
        });
    });

    // Test boundary conditions
    describe('Boundary conditions', () => {
        it('should handle extremely long property names', () => {
            const longPropertyName = 'this-is-an-extremely-long-property-name-that-might-cause-issues-with-some-implementations-of-css-property-sorting';

            const properties = [
                'position',
                'display',
                longPropertyName,
                'color',
                'margin'
            ];

            const result = sortProperties(properties, { strategy: 'alphabetical' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.includes(longPropertyName)).toBe(true);
        });

        it('should handle empty properties list', () => {
            const result = sortProperties([], { strategy: 'grouped' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual([]);
        });

        it('should handle single property', () => {
            const result = sortProperties(['color'], { strategy: 'grouped' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual(['color']);
        });

        it('should handle duplicate properties', () => {
            const properties = [
                'color',
                'margin',
                'color', // duplicate
                'padding',
                'margin' // duplicate
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // Should contain the same number of each property
            expect(result.sortedProperties!.filter(p => p === 'color').length).toBe(2);
            expect(result.sortedProperties!.filter(p => p === 'margin').length).toBe(2);
        });
    });

    // Test special character handling
    describe('Special character handling', () => {
        it('should handle properties with special characters', () => {
            const properties = [
                '--color:primary', // Unusual naming with colon
                '--10px-margin',   // Starts with number
                '--$variable',     // Dollar sign
                '--_underscore',   // Underscore
                '--100%',          // Percentage sign
                '--#selector',     // Hash
                '--@media',        // At symbol
                '--font/size',     // Forward slash
                '--*wildcard'      // Asterisk
            ];

            const result = sortProperties(properties, { strategy: 'alphabetical' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.length).toEqual(properties.length);

            // All special character properties should be present
            properties.forEach(prop => {
                expect(result.sortedProperties!.includes(prop)).toBe(true);
            });
        });
    });

    // Test emerging CSS features
    describe('Emerging CSS features', () => {
        it('should handle newer CSS properties properly', () => {
            const properties = [
                // Container queries
                'container-type',
                'container-name',
                'container',

                // Scroll-driven animations
                'scroll-timeline',
                'scroll-timeline-axis',
                'scroll-timeline-name',

                // Anchor positioning
                'anchor-name',
                'anchor-default',
                'position-anchor',
                'inset-area',

                // View transitions
                'view-transition-name',

                // Nesting related
                'nesting-rules',

                // CSS Houdini
                'paint-worklet',
                'animation-worklet',
                'layout-worklet'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.length).toEqual(properties.length);

            // Container properties should be grouped together
            const containerIndices = [
                result.sortedProperties!.indexOf('container'),
                result.sortedProperties!.indexOf('container-type'),
                result.sortedProperties!.indexOf('container-name')
            ];

            // Calculate the range (max - min index)
            const min = Math.min(...containerIndices);
            const max = Math.max(...containerIndices);
            expect(max - min).toBeLessThanOrEqual(2);
        });
    });

    // Test logical property ordering within groups
    describe('Logical property ordering', () => {
        it('should ensure consistent order of logical properties within groups', () => {
            const properties = [
                'inset',
                'inset-block',
                'inset-block-start',
                'inset-block-end',
                'inset-inline',
                'inset-inline-start',
                'inset-inline-end',
                'margin',
                'margin-block',
                'margin-block-start',
                'margin-block-end',
                'margin-inline',
                'margin-inline-start',
                'margin-inline-end'
            ];

            const result = sortProperties(properties, {
                strategy: 'grouped',
                sortPropertiesWithinGroups: true
            });

            expect(result.success).toBe(true);

            // Check that shorthand properties come before their longhand versions
            const insetIndex = result.sortedProperties!.indexOf('inset');
            const insetBlockIndex = result.sortedProperties!.indexOf('inset-block');
            const insetBlockStartIndex = result.sortedProperties!.indexOf('inset-block-start');

            expect(insetIndex).toBeLessThan(insetBlockIndex);
            expect(insetBlockIndex).toBeLessThan(insetBlockStartIndex);

            const marginIndex = result.sortedProperties!.indexOf('margin');
            const marginBlockIndex = result.sortedProperties!.indexOf('margin-block');
            const marginBlockStartIndex = result.sortedProperties!.indexOf('margin-block-start');

            expect(marginIndex).toBeLessThan(marginBlockIndex);
            expect(marginBlockIndex).toBeLessThan(marginBlockStartIndex);
        });
    });
});
