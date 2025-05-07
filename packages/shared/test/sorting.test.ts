import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import { SortingOptions } from '../src/types';

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
