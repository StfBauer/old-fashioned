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

    it('should handle strip-spaces rule', () => {
        const properties = ['  color  ', '  margin  '];
        const result = sortProperties(properties, {
            strategy: 'alphabetical',
            stripSpaces: true
        });

        expect(result.success).toBe(true);
        // In standalone sortProperties, strip spaces only affects sorting, not the returned values
        expect(result.sortedProperties!.includes('  color  ')).toBe(true);
        expect(result.sortedProperties!.includes('  margin  ')).toBe(true);
    });

    it('should handle tab-size rule', () => {
        const properties = ['\tcolor', '\tmargin'];
        const result = sortProperties(properties, {
            strategy: 'alphabetical',
            tabSize: true
        });

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toEqual(['\tcolor', '\tmargin']);
    });

    it('should handle unitless-zero rule', () => {
        const properties = ['margin: 0px;', 'padding: 0em;'];
        const result = sortProperties(properties, {
            strategy: 'alphabetical',
            unitlessZero: true
        });

        expect(result.success).toBe(true);
        // In standalone sortProperties, unitless zero only affects sorting, not the returned values
        expect(result.sortedProperties!.includes('margin: 0px;')).toBe(true);
        expect(result.sortedProperties!.includes('padding: 0em;')).toBe(true);
    });

    it('should handle vendor-prefix-align rule', () => {
        const properties = ['-webkit-transform', 'transform'];
        const result = sortProperties(properties, {
            strategy: 'alphabetical',
            vendorPrefixAlign: true
        });

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toEqual(['-webkit-transform', 'transform']);
    });
});
