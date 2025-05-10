// This test verifies that CSS variables always have an empty line after them
import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';

describe('CSS Variables Empty Line Requirement', () => {
    it('should always add an empty line after CSS variables regardless of sorting strategy', () => {
        // Mixed properties including CSS variables
        const props = [
            'width',
            '--color',
            'height',
            '--spacing',
            'margin',
            'padding',
            '--border',
            'color',
        ];

        // Test with different sorting strategies
        const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];

        // Test with both empty lines settings
        const emptyLinesSettings = [true, false];

        for (const strategy of strategies) {
            for (const emptyLinesBetweenGroups of emptyLinesSettings) {
                const result = sortProperties(props, {
                    strategy: strategy as any,
                    emptyLinesBetweenGroups,
                    sortPropertiesWithinGroups: true
                });

                // Verify the result was successful
                expect(result.success).toBe(true);

                // Find all CSS variables in the result
                const cssVars = result.sortedProperties!.filter(p => p.startsWith('--'));

                // There should be exactly 3 CSS variables in the result
                expect(cssVars.length).toBe(3);

                // The CSS variables should be at positions 0, 1, and 2
                expect(result.sortedProperties![0].startsWith('--')).toBe(true);
                expect(result.sortedProperties![1].startsWith('--')).toBe(true);
                expect(result.sortedProperties![2].startsWith('--')).toBe(true);

                // There should be an empty line after the CSS variables (at position 3)
                expect(result.sortedProperties![3]).toBe('');

                console.log(`Strategy: ${strategy}, EmptyLines: ${emptyLinesBetweenGroups}`);
                console.log(`Result: ${JSON.stringify(result.sortedProperties)}`);
            }
        }
    });

    it('should add an empty line after CSS variables in edge cases', () => {
        // Edge case with CSS variables mixed throughout
        const props = [
            'width',
            'height',
            '--primary-color',
            'margin',
            '--secondary-color',
            'color',
            '--spacing',
        ];

        // Test with all strategies
        const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];

        for (const strategy of strategies) {
            const result = sortProperties(props, {
                strategy: strategy as any,
                emptyLinesBetweenGroups: false
            });

            // Verify the result was successful
            expect(result.success).toBe(true);

            // Find all CSS variables in the result
            const cssVars = result.sortedProperties!.filter(p => p.startsWith('--'));

            // There should be exactly 3 CSS variables in the result
            expect(cssVars.length).toBe(3);

            // The CSS variables should always be at the top
            for (let i = 0; i < cssVars.length; i++) {
                expect(result.sortedProperties![i].startsWith('--')).toBe(true);
            }

            // There should be an empty line after the CSS variables
            expect(result.sortedProperties![cssVars.length]).toBe('');
        }
    });
});
