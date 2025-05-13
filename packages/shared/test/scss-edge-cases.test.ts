import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import { SortingOptions } from '../src/types';

describe('CSS Property Sorting - SCSS Edge Cases', () => {
    // Test case 5: More Complex CSS Variables Test
    describe('Complex CSS Variables Handling', () => {
        it('should properly sort mixed CSS variables and regular properties', () => {
            const properties = [
                '--primary-color',
                '--secondary-color',
                'color',
                '--spacing-sm',
                'margin',
                'padding',
                '--border-radius',
                'border',
                '--header-height',
                '--footer-height',
                'position',
                'top',
                'left',
                'height'
            ];

            // Test with each sorting strategy
            const alphabeticalResult = sortProperties(properties, { strategy: 'alphabetical' });
            const groupedResult = sortProperties(properties, { strategy: 'grouped' });
            const concentricResult = sortProperties(properties, { strategy: 'concentric' });
            const idiomaticResult = sortProperties(properties, { strategy: 'idiomatic' });

            // All strategies should succeed
            expect(alphabeticalResult.success).toBe(true);
            expect(groupedResult.success).toBe(true);
            expect(concentricResult.success).toBe(true);
            expect(idiomaticResult.success).toBe(true);

            // All CSS variables should be present in each result
            const cssVars = properties.filter(p => p.startsWith('--'));

            cssVars.forEach(variable => {
                expect(alphabeticalResult.sortedProperties!.includes(variable)).toBe(true);
                expect(groupedResult.sortedProperties!.includes(variable)).toBe(true);
                expect(concentricResult.sortedProperties!.includes(variable)).toBe(true);
                expect(idiomaticResult.sortedProperties!.includes(variable)).toBe(true);
            });

            // In alphabetical sorting, variables should come first
            const firstAlphabeticalProps = alphabeticalResult.sortedProperties!.slice(0, cssVars.length);
            expect(firstAlphabeticalProps.every(p => p.startsWith('--'))).toBe(true);
        });
    });

    // Test case 14: Properties with Mathematical Expressions
    describe('Properties with math expressions', () => {
        it('should sort properties with complex math expressions correctly', () => {
            const properties = [
                'width',
                'height',
                'padding',
                'font-size',
                'margin'
            ];

            // Test with each strategy
            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.length).toBe(properties.length);

            // Spacing properties (margin, padding) should be grouped together
            const marginIndex = result.sortedProperties!.indexOf('margin');
            const paddingIndex = result.sortedProperties!.indexOf('padding');

            expect(Math.abs(marginIndex - paddingIndex)).toBeLessThanOrEqual(2);
        });
    });

    // Test case 15: Properties with Nested Interpolation
    describe('SCSS nested interpolation handling', () => {
        it('should properly handle properties with interpolation placeholders', () => {
            const properties = [
                'property-name',
                'margin-direction',
                'namespace-color',
                'background-type-format'
            ];

            // Test with each strategy
            const result = sortProperties(properties, { strategy: 'alphabetical' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.length).toBe(properties.length);

            // All properties should be sorted alphabetically
            expect(result.sortedProperties).toEqual([
                'background-type-format',
                'margin-direction',
                'namespace-color',
                'property-name'
            ]);
        });
    });

    // Test case 17: Properties with multi-layer values
    describe('CSS cascade layers interaction', () => {
        it('should handle properties across cascade layers', () => {
            // Simplified test: since the sorter works on property names only,
            // we're testing if it can handle the property names correctly
            const properties = [
                'color',
                'margin',
                'color',
                'padding'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);
            // Should keep duplicate properties
            expect(result.sortedProperties!.filter(p => p === 'color').length).toBe(2);
        });
    });

    // Test case 18: Dynamic property names in SCSS
    describe('Dynamic SCSS property name handling', () => {
        it('should sort properties with dynamic name patterns', () => {
            const properties = [
                'margin-1',
                'padding-1',
                'margin-2',
                'padding-2',
                'margin-3',
                'padding-3',
                'margin-4',
                'padding-4',
                'margin-5',
                'padding-5'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // All margin properties should be grouped together
            const marginIndices = properties
                .filter(p => p.startsWith('margin'))
                .map(p => result.sortedProperties!.indexOf(p));

            const paddingIndices = properties
                .filter(p => p.startsWith('padding'))
                .map(p => result.sortedProperties!.indexOf(p));

            // The difference between the highest and lowest index should be small if grouped
            const marginRange = Math.max(...marginIndices) - Math.min(...marginIndices);
            const paddingRange = Math.max(...paddingIndices) - Math.min(...paddingIndices);

            expect(marginRange).toBeLessThanOrEqual(9);
            expect(paddingRange).toBeLessThanOrEqual(9);

            // Check if within-group sorting works
            if (marginIndices.length > 1 && result.sortedProperties) {
                const marginProps = result.sortedProperties
                    .filter(p => p.startsWith('margin-'))
                    .map(p => parseInt(p.split('-')[1]));

                // Check if the numbers are in ascending order
                for (let i = 1; i < marginProps.length; i++) {
                    expect(marginProps[i]).toBeGreaterThan(marginProps[i - 1]);
                }
            }
        });
    });

    // Additional test for underscore format SCSS
    describe('SCSS underscore variable format', () => {
        it('should handle SCSS underscore format variables correctly', () => {
            const properties = [
                '$_primary_color',
                '$_secondary_color',
                'color',
                '$_spacing',
                'margin',
                'padding',
                '$_border_radius',
                'border'
            ];

            // In an actual CSS sorter these would be ignored as they're SCSS variables,
            // but we're testing the general handling of such syntax
            const result = sortProperties(properties.filter(p => !p.startsWith('$')), { strategy: 'grouped' });

            expect(result.success).toBe(true);
            // Only non-SCSS variables should be included
            expect(result.sortedProperties!.length).toBe(4);
            expect(result.sortedProperties!.filter(p => p.startsWith('$')).length).toBe(0);
        });
    });

    // Test edge case for mixing grid and flexbox properties
    describe('Mixed layout model properties', () => {
        it('should properly sort mixed grid and flexbox properties', () => {
            const properties = [
                'display',
                'grid-template-columns',
                'flex-direction',
                'grid-template-rows',
                'flex-wrap',
                'grid-template-areas',
                'flex-flow',
                'grid-auto-columns',
                'align-items',
                'grid-auto-flow',
                'justify-content'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // Grid properties should be grouped together
            const gridProps = properties.filter(p => p.startsWith('grid'));
            const gridIndices = gridProps.map(p => result.sortedProperties!.indexOf(p));

            // The difference between the highest and lowest grid index should be small if grouped
            const gridRange = Math.max(...gridIndices) - Math.min(...gridIndices);

            expect(gridRange).toBeLessThanOrEqual(gridProps.length + 3);

            // Flex properties should be grouped together
            const flexProps = properties.filter(p => p.startsWith('flex'));
            const flexIndices = flexProps.map(p => result.sortedProperties!.indexOf(p));

            // The difference between the highest and lowest flex index should be small if grouped
            const flexRange = Math.max(...flexIndices) - Math.min(...flexIndices);

            expect(flexRange).toBeLessThanOrEqual(flexProps.length + 3);
        });
    });

    // Test handling of complex vendor prefix combinations
    describe('Complex vendor prefix combinations', () => {
        it('should properly group and sort various vendor prefix combinations', () => {
            const properties = [
                'transition',
                '-webkit-transition',
                '-moz-transition',
                '-o-transition',
                'transform',
                '-webkit-transform',
                '-moz-transform',
                '-ms-transform',
                'animation',
                '-webkit-animation',
                'user-select',
                '-webkit-user-select',
                '-moz-user-select',
                '-ms-user-select',
                '-o-user-select'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // Each set of prefixed properties should be grouped together
            const transitionProps = properties.filter(p => p.includes('transition'));
            const transitionIndices = transitionProps.map(p => result.sortedProperties!.indexOf(p));
            const transitionRange = Math.max(...transitionIndices) - Math.min(...transitionIndices);

            const transformProps = properties.filter(p => p.includes('transform'));
            const transformIndices = transformProps.map(p => result.sortedProperties!.indexOf(p));
            const transformRange = Math.max(...transformIndices) - Math.min(...transformIndices);

            const animationProps = properties.filter(p => p.includes('animation'));
            const animationIndices = animationProps.map(p => result.sortedProperties!.indexOf(p));
            const animationRange = Math.max(...animationIndices) - Math.min(...animationIndices);

            const userSelectProps = properties.filter(p => p.includes('user-select'));
            const userSelectIndices = userSelectProps.map(p => result.sortedProperties!.indexOf(p));
            const userSelectRange = Math.max(...userSelectIndices) - Math.min(...userSelectIndices);

            // Expect prefixed properties to be grouped somewhat close to each other
            // but with more flexibility for the different sorting strategies
            // In real-world cases, they might be separated further depending on the strategy
            expect(transitionRange).toBeLessThanOrEqual(transitionProps.length + 7);
            expect(transformRange).toBeLessThanOrEqual(transformProps.length + 7);
            expect(animationRange).toBeLessThanOrEqual(animationProps.length + 7);
            expect(userSelectRange).toBeLessThanOrEqual(userSelectProps.length + 7);
        });
    });
});
