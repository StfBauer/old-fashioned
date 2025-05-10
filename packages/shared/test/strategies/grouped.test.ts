import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('Grouped Property Sorting', () => {
    it('should sort properties according to predefined groups', () => {
        // Test data with properties in random order
        const properties = [
            'color',
            'margin',
            'position',
            'top',
            'padding',
            'border',
            'width',
            'font-size',
            'background-color',
            'z-index'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });
        expect(result.success).toBe(true);
        const sortedProps = result.sortedProperties || [];

        // Verify that positioning properties come before others
        const positionIndex = sortedProps.indexOf('position');
        const colorIndex = sortedProps.indexOf('color');
        expect(positionIndex).toBeLessThan(colorIndex);

        // Width/height should be in box model group
        const widthIndex = sortedProps.indexOf('width');
        const marginIndex = sortedProps.indexOf('margin');
        expect(widthIndex).toBeLessThan(marginIndex);

        // Check group separation with options that would create empty lines
        const resultWithEmptyLines = sortProperties(properties, { strategy: 'grouped', emptyLinesBetweenGroups: true });
        expect(resultWithEmptyLines.success).toBe(true);
        const withEmptyLinesProps = resultWithEmptyLines.sortedProperties || [];
        const emptyLineCount = withEmptyLinesProps.filter(p => p === '').length;
        expect(emptyLineCount).toBeGreaterThan(0);
    });

    it('should handle empty lines when emptyLinesBetweenGroups is true', () => {
        const properties = [
            'color',
            'margin',
            'position',
            'width'
        ];

        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true
        });
        expect(result.success).toBe(true);
        const sortedProps = result.sortedProperties || [];

        // Empty lines should separate logical groups
        expect(sortedProps.includes('')).toBe(true);
    });

    it('should not add empty lines when emptyLinesBetweenGroups is false', () => {
        const properties = [
            'color',
            'margin',
            'position',
            'width'
        ];

        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false
        });
        expect(result.success).toBe(true);
        const sortedProps = result.sortedProperties || [];

        // No empty lines should be present between groups
        expect(sortedProps.includes('')).toBe(false);
    });
});
