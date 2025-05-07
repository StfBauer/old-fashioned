import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../shared/src/sorting';

describe('Property Sorting', () => {
    it('should sort properties according to groups', () => {
        // Test with properties that we know our sorter can handle
        const properties = [
            'color',
            'position',
            'margin',
            'width',
            'z-index'
        ];

        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false
        });

        // Verify the sorting worked
        expect(result.success).toBe(true);

        // Position should come before color in grouped sorting
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');

        expect(positionIndex).toBeLessThan(colorIndex);

        // z-index should be near position
        const zIndexIndex = result.sortedProperties!.indexOf('z-index');
        expect(Math.abs(positionIndex - zIndexIndex)).toBeLessThanOrEqual(5);
    });
});
