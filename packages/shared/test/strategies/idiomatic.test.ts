import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('Idiomatic Property Sorting', () => {
    it('should sort properties according to idiomatic CSS order', () => {
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

        const result = sortProperties(properties, { strategy: 'idiomatic' });
        expect(result.success).toBe(true);
        const sortedProps = result.sortedProperties || [];

        // Position-related properties should come before sizing
        const positionIndex = sortedProps.indexOf('position');
        const widthIndex = sortedProps.indexOf('width');
        expect(positionIndex).toBeLessThan(widthIndex);

        // Font properties should come after spacing properties
        const fontSizeIndex = sortedProps.indexOf('font-size');
        const marginIndex = sortedProps.indexOf('margin');
        expect(marginIndex).toBeLessThan(fontSizeIndex);

        // Check that color is in the color/appearance group
        const colorIndex = sortedProps.indexOf('color');
        const backgroundColorIndex = sortedProps.indexOf('background-color');
        // Should be near each other in the appearance group
        expect(Math.abs(colorIndex - backgroundColorIndex)).toBeLessThan(3);
    });

    it('should handle empty lines when emptyLinesBetweenGroups is true', () => {
        const properties = [
            'color',
            'margin',
            'position',
            'width'
        ];

        const result = sortProperties(properties, {
            strategy: 'idiomatic',
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
            strategy: 'idiomatic',
            emptyLinesBetweenGroups: false
        });
        expect(result.success).toBe(true);
        const sortedProps = result.sortedProperties || [];

        // No empty lines should be present between groups
        expect(sortedProps.includes('')).toBe(false);
    });
});
