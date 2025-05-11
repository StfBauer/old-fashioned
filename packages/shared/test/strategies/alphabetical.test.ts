import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import type { SortingOptions } from '../../src/types';

describe('Alphabetical Property Sorting', () => {
    it('should sort properties alphabetically', () => {
        // Test data with properties in random order
        const properties = [
            'margin',
            'color',
            'z-index',
            'display',
            'background',
            'font-size',
            'width',
            'animation',
            'padding'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // Expected order: animation, background, color, display, font-size, margin, padding, width, z-index
        expect(result.sortedProperties).toEqual([
            'animation',
            'background',
            'color',
            'display',
            'font-size',
            'margin',
            'padding',
            'width',
            'z-index'
        ]);
    });

    it('should sort properties case-insensitively', () => {
        const properties = [
            'Margin',
            'COLOR',
            'Z-index',
            'display',
            'Background'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // Get the sorted properties, converted to lowercase for comparison
        const sortedLowercase = result.sortedProperties!.map(p => p.toLowerCase());

        // Expected order: background, color, margin, z-index, display
        expect(sortedLowercase).toEqual([
            'background',
            'color',
            'margin',
            'z-index',
            'display'
        ]);
    });

    it('should place CSS variables at the beginning', () => {
        const properties = [
            'margin',
            '--primary-color',
            'color',
            '--spacing',
            'padding'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // CSS variables should be at the beginning, followed by an empty line, then other properties
        const cssVarsCount = properties.filter(p => p.startsWith('--')).length;

        for (let i = 0; i < cssVarsCount; i++) {
            expect(result.sortedProperties![i].startsWith('--')).toBe(true);
        }

        // There should be an empty line after CSS variables
        expect(result.sortedProperties![cssVarsCount]).toBe('');

        // Regular properties should be sorted alphabetically after the empty line
        expect(result.sortedProperties!.slice(cssVarsCount + 1)).toEqual([
            'color',
            'margin',
            'padding'
        ]);
    });
});