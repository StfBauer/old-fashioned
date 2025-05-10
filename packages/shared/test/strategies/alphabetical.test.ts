import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('Alphabetical Property Sorting', () => {
    it('should sort properties alphabetically', () => {
        // Test data with properties in random order
        const properties = [
            'z-index',
            'color',
            'margin',
            'background',
            'display',
            'width',
            'padding'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        // Check that properties are sorted alphabetically
        expect(result.sortedProperties).toEqual([
            'background',
            'color',
            'display',
            'margin',
            'padding',
            'width',
            'z-index'
        ]);
    });

    it('should handle prefixed properties correctly', () => {
        const properties = [
            'display',
            '-webkit-transition',
            'transition',
            '-moz-transition',
            'color'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        // Prefixed properties should be grouped with their standard property
        expect(result.sortedProperties).toEqual([
            'color',
            'display',
            '-moz-transition',
            '-webkit-transition',
            'transition'
        ]);
    });

    it('should handle empty lines when emptyLinesBetweenGroups is false', () => {
        const properties = [
            'z-index',
            'color',
            'margin',
            'background',
        ];

        const result = sortProperties(properties, {
            strategy: 'alphabetical',
            emptyLinesBetweenGroups: false
        });

        // No empty lines should be inserted in alphabetical mode with emptyLinesBetweenGroups: false
        expect(result.sortedProperties).toEqual([
            'background',
            'color',
            'margin',
            'z-index'
        ]);
    });
});
