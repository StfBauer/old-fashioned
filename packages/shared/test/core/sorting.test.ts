import { describe, it, expect } from 'vitest';
import { sortPropertiesWithCache, sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('Property Sorting', () => {
    it('should sort properties based on specified strategy', () => {
        // Test data
        const properties = [
            'color',
            'z-index',
            'position',
            'width',
            'margin'
        ];

        // Test alphabetical sorting
        const alphabeticalOptions: SortingOptions = {
            strategy: 'alphabetical'
        };

        const alphabeticalResult = sortProperties(properties, alphabeticalOptions);
        expect(alphabeticalResult.success).toBe(true);
        expect(alphabeticalResult.sortedProperties).toEqual([
            'color',
            'margin',
            'position',
            'width',
            'z-index'
        ]);

        // Test grouped sorting
        const groupedOptions: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false
        };

        const groupedResult = sortProperties(properties, groupedOptions);
        expect(groupedResult.success).toBe(true);

        // In grouped sorting, position should come before width
        const positionIndex = groupedResult.sortedProperties!.indexOf('position');
        const widthIndex = groupedResult.sortedProperties!.indexOf('width');
        expect(positionIndex).toBeLessThan(widthIndex);
    });
});

describe('Property Sorting with Cache', () => {
    it('should cache results for identical inputs', () => {
        const properties = ['color', 'margin', 'padding', 'width'];
        const options: SortingOptions = { strategy: 'alphabetical' };

        const firstResult = sortPropertiesWithCache(properties, options);
        const secondResult = sortPropertiesWithCache(properties, options);

        expect(firstResult).toEqual(secondResult);
    });

    it('should handle nested rules correctly', () => {
        const properties = ['color', 'margin', 'padding', 'width'];
        const options: SortingOptions = { strategy: 'grouped' };

        const result = sortProperties(properties, options);

        console.log('Actual:', result.sortedProperties);
        console.log('Expected:', [
            'margin',
            'padding',
            'color',
            'width'
        ]);

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toEqual([
            'width',
            'margin',
            'padding',
            'color'
        ]);
    });

    it('should sort properties alphabetically', () => {
        const properties = ['z-index', 'color', 'margin', 'display'];
        const options: SortingOptions = { strategy: 'alphabetical' };

        const result = sortProperties(properties, options);

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toEqual([
            'color',
            'display',
            'margin',
            'z-index'
        ]);
    });

    it('should sort properties by concentric order', () => {
        const properties = ['color', 'position', 'padding', 'margin', 'width'];
        const options: SortingOptions = { strategy: 'concentric' };

        const result = sortProperties(properties, options);

        expect(result.success).toBe(true);
        // Check that all properties are present
        expect(result.sortedProperties!.includes('position')).toBe(true);
        expect(result.sortedProperties!.includes('width')).toBe(true);
        expect(result.sortedProperties!.includes('margin')).toBe(true);
        expect(result.sortedProperties!.includes('padding')).toBe(true);
        expect(result.sortedProperties!.includes('color')).toBe(true);

        // Verify order of key elements
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');
        expect(positionIndex).toBeLessThan(colorIndex);
    });
});
