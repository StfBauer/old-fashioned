import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';

describe('CSS Custom Properties (Variables) Ordering', () => {
    // Test that CSS variables are always placed at the top
    it('should place CSS custom properties at the top of sorted properties', () => {
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
        const strategies: ('alphabetical' | 'grouped' | 'concentric' | 'idiomatic')[] = [
            'alphabetical', 'grouped', 'concentric', 'idiomatic'
        ];

        for (const strategy of strategies) {
            const result = sortProperties(props, { strategy });

            // Verify the result was successful
            expect(result.success).toBe(true);

            // Filter out empty lines for checking variable positions
            const sorted = result.sortedProperties!.filter(p => p !== '');

            // The variables should be the first properties in the sorted list
            const firstNonVariable = sorted.findIndex(p => !p.startsWith('--'));
            const lastVariable = sorted.findIndex((p, idx) => p.startsWith('--') &&
                (idx + 1 >= sorted.length || !sorted[idx + 1].startsWith('--')));

            // Verify all variables are at the beginning
            expect(firstNonVariable).toBeGreaterThan(0);
            expect(lastVariable).toBeLessThan(firstNonVariable);

            // Get the variables from the result
            const resultVariables = sorted.filter(p => p.startsWith('--'));

            // Check that we have all the original variables
            expect(resultVariables).toHaveLength(3);
            expect(resultVariables).toContain('--color');
            expect(resultVariables).toContain('--spacing');
            expect(resultVariables).toContain('--border');

            // Check that variables are alphabetically sorted
            expect(resultVariables[0] <= resultVariables[1]).toBe(true);
            expect(resultVariables[1] <= resultVariables[2]).toBe(true);
        }
    });

    // Test that CSS variables with similar names are sorted correctly
    it('should sort CSS variables alphabetically regardless of sorting strategy', () => {
        const props = [
            '--zebra',
            '--apple',
            '--delta',
            '--banana',
            '--cherry',
            'color',
            'width'
        ];

        const result = sortProperties(props, { strategy: 'grouped' });

        // Verify the result was successful
        expect(result.success).toBe(true);

        // Filter out empty lines for checking variable order
        const sorted = result.sortedProperties!.filter(p => p !== '');
        const variables = sorted.filter(p => p.startsWith('--'));

        // Variables should be sorted alphabetically
        expect(variables).toEqual([
            '--apple',
            '--banana',
            '--cherry',
            '--delta',
            '--zebra'
        ]);
    });

    // Test that variables are handled correctly in a complex real-world scenario
    it('should correctly handle CSS variables in a complex property set', () => {
        // Example from a design system with many variables and properties
        const props = [
            'width', '100%',
            'height', 'auto',
            'display', 'grid',
            'grid-template-columns', '1fr 1fr',
            '--grid-gap', '20px',
            '--border-color', '#ddd',
            '--text-color', '#333',
            '--heading-color', '#111',
            'gap', 'var(--grid-gap)',
            'color', 'var(--text-color)',
            'border', '1px solid var(--border-color)',
            'padding', '16px'
        ];

        const result = sortProperties(props.filter((_, i) => i % 2 === 0), {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true
        });

        // Verify the result was successful
        expect(result.success).toBe(true);

        // The CSS variables should be at the top
        const sorted = result.sortedProperties!;
        const cssVarsEnd = sorted.findIndex(p => p === '');

        // Check that all CSS variables are before the first empty line
        const variableSection = sorted.slice(0, cssVarsEnd);
        expect(variableSection.every(p => p.startsWith('--'))).toBe(true);

        // Check that all CSS variables are included
        expect(variableSection).toContain('--grid-gap');
        expect(variableSection).toContain('--border-color');
        expect(variableSection).toContain('--text-color');
        expect(variableSection).toContain('--heading-color');

        // Check that variables are sorted alphabetically
        expect(variableSection).toEqual([...variableSection].sort());
    });
});
