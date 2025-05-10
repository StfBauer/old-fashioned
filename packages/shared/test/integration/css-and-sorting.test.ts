/**
 * Integration test for CSS variables and sorting strategies working together
 */
import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';
import { verifyCssVariables } from '../css-variables/verification';

describe('Integration: CSS Variables and Sorting Strategies', () => {
    // Test sets with mixed CSS variables and properties
    const testSets = [
        {
            name: 'Mixed properties with CSS variables',
            properties: [
                'color',
                '--theme-color',
                'padding',
                '--spacing-unit',
                'margin',
                'width',
                '--border-radius'
            ]
        },
        {
            name: 'Real-world component example',
            properties: [
                'position',
                'display',
                'width',
                'height',
                '--component-padding',
                '--component-margin',
                'margin',
                'padding',
                'background-color',
                'color',
                '--text-color',
                'font-size',
                'border-radius',
                '--animation-speed',
                'transition'
            ]
        }
    ];

    // Test common strategies
    const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];

    // Run comprehensive integration test
    it('should correctly handle CSS variables with all strategies', () => {
        testSets.forEach(testSet => {
            strategies.forEach(strategy => {
                // Test with both empty line settings
                [true, false].forEach(emptyLines => {
                    const result = sortProperties(testSet.properties, {
                        strategy: strategy as SortingOptions['strategy'],
                        emptyLinesBetweenGroups: emptyLines,
                        sortPropertiesWithinGroups: true
                    });

                    // Ensure sortedProperties exists
                    expect(result.success).toBe(true);
                    const sortedProps = result.sortedProperties || [];

                    // CSS variables should be at the top
                    const cssVars = sortedProps.filter(p => p.startsWith('--'));
                    const firstNonVarIndex = sortedProps.findIndex(p => p !== '' && !p.startsWith('--'));

                    // All CSS vars should be before the first non-var property
                    cssVars.forEach(cssVar => {
                        const cssVarIndex = sortedProps.indexOf(cssVar);
                        expect(cssVarIndex).toBeLessThan(firstNonVarIndex);
                    });

                    // Empty line should be added after CSS variables
                    if (cssVars.length > 0) {
                        const lastVarIndex = sortedProps.lastIndexOf(cssVars[cssVars.length - 1]);
                        const nextIndex = lastVarIndex + 1;

                        if (nextIndex < sortedProps.length) {
                            expect(sortedProps[nextIndex]).toBe('');
                        }
                    }
                });
            });
        });
    });

    it('should sort properties according to strategy after CSS variables', () => {
        // This test verifies that after CSS variables are moved to the top,
        // the remaining properties are still sorted according to the strategy
        const testProperties = [
            'color',
            '--theme-color',
            'padding',
            '--spacing-unit',
            'position',
            'display',
            'margin'
        ];

        // Test with grouped strategy
        const groupedResult = sortProperties(testProperties, { strategy: 'grouped' });
        expect(groupedResult.success).toBe(true);
        const groupedProps = groupedResult.sortedProperties || [];
        const firstNonVar = groupedProps.find(p => p !== '' && !p.startsWith('--'));

        // In grouped strategy, position should be before display, and both before margin/padding
        const positionIndex = groupedProps.indexOf('position');
        const displayIndex = groupedProps.indexOf('display');
        const marginIndex = groupedProps.indexOf('margin');

        expect(positionIndex).toBeLessThan(displayIndex);
        expect(displayIndex).toBeLessThan(marginIndex);

        // Test with alphabetical strategy
        const alphaResult = sortProperties(testProperties, { strategy: 'alphabetical' });
        expect(alphaResult.success).toBe(true);
        const alphaProps = alphaResult.sortedProperties || [];
        const nonVarProps = alphaProps.filter(p => p !== '' && !p.startsWith('--'));

        // In alphabetical, properties should be in alphabetical order
        expect(nonVarProps).toEqual([...nonVarProps].sort());
    });
});
