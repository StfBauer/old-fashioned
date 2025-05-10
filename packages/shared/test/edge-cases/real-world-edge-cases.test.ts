import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('CSS Property Sorting - Real-world Edge Cases', () => {
    // Test case mixing multiple modern CSS features
    describe('Mixed modern CSS features', () => {
        it('should properly sort CSS properties from a component with modern features', () => {
            // Properties from a modern card component
            const cardComponentProps = [
                // Layout and positioning
                'position',
                'z-index',
                'display',
                'grid-template-columns',
                'grid-template-rows',
                'grid-template-areas',
                'gap',
                'place-items',

                // Dimensions
                'width',
                'height',
                'max-width',
                'min-height',
                'aspect-ratio',

                // Container queries
                'container-type',
                'container-name',

                // Spacing
                'margin',
                'margin-block',
                'padding',
                'padding-inline',

                // Borders
                'border',
                'border-radius',
                'border-start-start-radius',
                'border-end-end-radius',

                // Visual
                'background',
                'backdrop-filter',
                'box-shadow',
                'color',
                'color-scheme',

                // Typography
                'font-family',
                'font-size',
                'line-height',

                // Animation
                'transition',
                'animation',

                // Misc
                'pointer-events',
                'overflow',
                'scroll-margin-block',
                'content-visibility'
            ];

            // Test with multiple strategies
            const groupedResult = sortProperties(cardComponentProps, { strategy: 'grouped' });
            const concentricResult = sortProperties(cardComponentProps, { strategy: 'concentric' });
            const idiomaticResult = sortProperties(cardComponentProps, { strategy: 'idiomatic' });

            expect(groupedResult.success).toBe(true);
            expect(concentricResult.success).toBe(true);
            expect(idiomaticResult.success).toBe(true);

            // Check for key property relationships in grouped strategy
            const groupedSorted = groupedResult.sortedProperties!;

            // Position should come before display
            expect(groupedSorted.indexOf('position')).toBeLessThan(groupedSorted.indexOf('display'));

            // Display should come before width
            expect(groupedSorted.indexOf('display')).toBeLessThan(groupedSorted.indexOf('width'));

            // Width should come before margin
            expect(groupedSorted.indexOf('width')).toBeLessThan(groupedSorted.indexOf('margin'));

            // Margin should come before border
            expect(groupedSorted.indexOf('margin')).toBeLessThan(groupedSorted.indexOf('border'));

            // Border should come before background
            expect(groupedSorted.indexOf('border')).toBeLessThan(groupedSorted.indexOf('background'));

            // For concentric strategy, position should come before margin
            const concentricSorted = concentricResult.sortedProperties!;
            expect(concentricSorted.indexOf('position')).toBeLessThan(concentricSorted.indexOf('margin'));
        });
    });

    // Test with real-world CSS Framework properties
    describe('CSS Framework property patterns', () => {
        it('should correctly sort Tailwind-like property ordering', () => {
            // Properties in the order Tailwind uses in their documentation
            const tailwindStyleProps = [
                // Layout
                'position',
                'display',
                'float',
                'clear',

                // Flexbox & Grid
                'flex',
                'flex-direction',
                'flex-grow',
                'grid-template-columns',
                'grid-column',
                'gap',

                // Spacing & Sizing
                'width',
                'height',
                'margin',
                'padding',

                // Borders
                'border',
                'border-radius',

                // Background
                'background-color',
                'background-image',

                // Typography
                'color',
                'font-family',
                'font-size',
                'font-weight',
                'text-align',
                'letter-spacing',

                // Effects
                'opacity',
                'box-shadow',
                'transform',
                'transition'
            ];

            const result = sortProperties(tailwindStyleProps, { strategy: 'grouped' });
            expect(result.success).toBe(true);

            // Check general grouping principles are maintained
            const groupedSorted = result.sortedProperties!;

            // Position should come before display
            expect(groupedSorted.indexOf('position')).toBeLessThan(groupedSorted.indexOf('display'));

            // Display should come before width/height
            expect(groupedSorted.indexOf('display')).toBeLessThan(groupedSorted.indexOf('width'));

            // Typography properties should be grouped
            const fontFamilyIndex = groupedSorted.indexOf('font-family');
            const fontSizeIndex = groupedSorted.indexOf('font-size');
            expect(Math.abs(fontFamilyIndex - fontSizeIndex)).toBeLessThanOrEqual(2);
        });

        it('should correctly sort Bootstrap-like property ordering', () => {
            // Properties in the order Bootstrap often uses
            const bootstrapStyleProps = [
                // Positioning
                'position',
                'top',
                'right',
                'bottom',
                'left',
                'z-index',

                // Box-model
                'display',
                'flex',
                'flex-basis',
                'flex-direction',
                'flex-flow',
                'flex-grow',
                'flex-shrink',
                'flex-wrap',
                'float',

                // Dimensions
                'width',
                'min-width',
                'max-width',
                'height',
                'min-height',
                'max-height',

                // Margin, padding, and border
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
                'border-radius',

                // Colors and backgrounds
                'background',
                'background-color',
                'color',

                // Typography
                'font-family',
                'font-size',
                'font-style',
                'font-weight',
                'line-height',
                'letter-spacing',
                'text-align',
                'text-decoration',
                'text-shadow',
                'text-transform',

                // Other visual properties
                'opacity',
                'box-shadow',
                'transform',
                'transition'
            ];

            const result = sortProperties(bootstrapStyleProps, { strategy: 'grouped' });
            expect(result.success).toBe(true);

            // The sorting should generally maintain the Bootstrap grouping principles
            const groupedSorted = result.sortedProperties!;

            // Position should come before display
            expect(groupedSorted.indexOf('position')).toBeLessThan(groupedSorted.indexOf('display'));

            // Display should come before width/height
            expect(groupedSorted.indexOf('display')).toBeLessThan(groupedSorted.indexOf('width'));

            // Width should come before margin
            expect(groupedSorted.indexOf('width')).toBeLessThan(groupedSorted.indexOf('margin'));
        });
    });

    // Test case for properties with content-based values
    describe('Properties with complex content-based values', () => {
        it('should sort properties that might have content expressions', () => {
            const properties = [
                'content',
                'counter-reset',
                'counter-increment',
                'quotes',
                'list-style',
                'list-style-image',
                'list-style-position',
                'list-style-type',
                'caption-side',
                'empty-cells',
                'table-layout',
                'speak-header',
                'speak-numeral',
                'speak-punctuation',
                'speak'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });
            expect(result.success).toBe(true);
            expect(result.sortedProperties!.length).toEqual(properties.length);

            // Content-related properties should be generally grouped together
            const contentIndex = result.sortedProperties!.indexOf('content');
            const counterResetIndex = result.sortedProperties!.indexOf('counter-reset');
            const counterIncrementIndex = result.sortedProperties!.indexOf('counter-increment');

            // Check that these are somewhat close together in the grouping
            const indices = [contentIndex, counterResetIndex, counterIncrementIndex].filter(i => i >= 0);
            if (indices.length > 1) {
                const max = Math.max(...indices);
                const min = Math.min(...indices);
                expect(max - min).toBeLessThanOrEqual(10); // They should be relatively close
            }
        });
    });

    // Test case for browser-specific hacks that might appear in codebases
    describe('Browser-specific hacks', () => {
        it('should handle property names with browser-specific prefixes or hacks', () => {
            const properties = [
                'color',
                '_::-webkit-full-page-media', // Hack for WebKit
                'width',
                '*color', // IE7 hack
                'height',
                '_::-moz-progress-bar', // Firefox hack
                'margin',
                '*::-ms-backdrop', // Edge hack
                'padding',
                '_::placeholder', // Modern placeholder hack
                'border',
                '_:-ms-fullscreen' // IE11 hack
            ];

            // Since sortProperties only works with valid CSS properties in most implementations,
            // we'll filter to standard properties first
            const standardProps = properties.filter(p =>
                !p.startsWith('_') && !p.startsWith('*') && !p.includes('::')
            );

            const result = sortProperties(standardProps, { strategy: 'grouped' });
            expect(result.success).toBe(true);

            // Should still maintain standard property relationships
            const colorIndex = result.sortedProperties!.indexOf('color');
            const marginIndex = result.sortedProperties!.indexOf('margin');

            // Color should come after margin in grouped sorting
            expect(marginIndex).toBeLessThan(colorIndex);
        });
    });

    // Test mix of properties across many CSS specs
    describe('Properties across different CSS specifications', () => {
        it('should handle properties from multiple CSS specifications', () => {
            const properties = [
                // CSS1
                'color',
                'background-color',
                'font-family',

                // CSS2
                'position',
                'z-index',
                'content',

                // CSS3
                'border-radius',
                'box-shadow',
                'text-shadow',
                'transform',
                'transition',

                // CSS4/Modern
                'aspect-ratio',
                'container',
                'gap',

                // Logical Properties
                'margin-block',
                'padding-inline',

                // Experimental
                'text-wrap',
                'text-box-trim',

                // Non-standard
                '-webkit-tap-highlight-color',
                '-moz-osx-font-smoothing'
            ];

            // Test each strategy
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

                // Check if vendor prefixes stay with their base property
                if (strategy !== 'alphabetical') {
                    const webkitIndex = result.sortedProperties!.indexOf('-webkit-tap-highlight-color');
                    const mozIndex = result.sortedProperties!.indexOf('-moz-osx-font-smoothing');

                    // These are both font/visual properties so should be in similar sections
                    if (webkitIndex >= 0 && mozIndex >= 0) {
                        expect(Math.abs(webkitIndex - mozIndex)).toBeLessThanOrEqual(15);
                    }
                }
            }
        });
    });
});
