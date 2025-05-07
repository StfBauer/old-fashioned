import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import { SortingOptions } from '../src/types';

describe('CSS Property Sorting - Comprehensive Tests', () => {
    // Test alphabetical sorting
    describe('Alphabetical sorting', () => {
        it('should sort properties alphabetically', () => {
            const properties = [
                'z-index',
                'color',
                'margin',
                'display',
                'width'
            ];

            const result = sortProperties(properties, { strategy: 'alphabetical' });

            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual([
                'color',
                'display',
                'margin',
                'width',
                'z-index'
            ]);
        });

        it('should handle vendor prefixes', () => {
            const properties = [
                'transform',
                '-webkit-transform',
                'color',
                '-moz-transform'
            ];

            const result = sortProperties(properties, { strategy: 'alphabetical' });

            // Vendor prefixes should be sorted alphabetically too
            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual([
                '-moz-transform',
                '-webkit-transform',
                'color',
                'transform'
            ]);
        });
    });

    // Test grouped sorting
    describe('Grouped sorting', () => {
        it('should sort properties according to predefined groups', () => {
            const properties = [
                'color',
                'position',
                'margin',
                'display',
                'width',
                'z-index',
                'background-color',
                'font-size'
            ];

            const result = sortProperties(properties, { strategy: 'grouped' });

            expect(result.success).toBe(true);

            // Position and z-index should appear before display
            const positionIndex = result.sortedProperties!.indexOf('position');
            const zIndexIndex = result.sortedProperties!.indexOf('z-index');
            const displayIndex = result.sortedProperties!.indexOf('display');

            expect(positionIndex).toBeLessThan(displayIndex);
            expect(zIndexIndex).toBeLessThan(displayIndex);
        });

        it('should handle empty lines between groups when configured', () => {
            const properties = [
                'color',
                'position',
                'margin',
                'display'
            ];

            const result = sortProperties(properties, {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true
            });

            expect(result.success).toBe(true);
            expect(result.sortedProperties!.includes('')).toBe(true);
        });
    });

    // Test edge cases
    describe('Edge cases', () => {
        it('should handle empty property list', () => {
            const result = sortProperties([], { strategy: 'grouped' });
            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual([]);
        });

        it('should handle single property', () => {
            const result = sortProperties(['color'], { strategy: 'grouped' });
            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual(['color']);
        });

        it('should handle duplicate properties', () => {
            const result = sortProperties(
                ['color', 'margin', 'color', 'margin'],
                { strategy: 'alphabetical' }
            );
            expect(result.success).toBe(true);
            expect(result.sortedProperties).toEqual(['color', 'color', 'margin', 'margin']);
        });
    });
});
