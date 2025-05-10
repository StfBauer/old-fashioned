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

        // Verify that positioning properties come before others
        const positionIndex = result.sortedProperties.indexOf('position');
        const colorIndex = result.sortedProperties.indexOf('color');
        expect(positionIndex).toBeLessThan(colorIndex);

        // Width/height should be in box model group
        const widthIndex = result.sortedProperties.indexOf('width');
        const marginIndex = result.sortedProperties.indexOf('margin');
        expect(widthIndex).toBeLessThan(marginIndex);

        // Check group separation with options that would create empty lines
        const resultWithEmptyLines = sortProperties(properties, { strategy: 'grouped', emptyLinesBetweenGroups: true });
        const emptyLineCount = resultWithEmptyLines.sortedProperties.filter(p => p === '').length;
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

        // Empty lines should separate logical groups
        expect(result.sortedProperties.includes('')).toBe(true);
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

        // No empty lines should be present between groups
        expect(result.sortedProperties.includes('')).toBe(false);
    });
});
