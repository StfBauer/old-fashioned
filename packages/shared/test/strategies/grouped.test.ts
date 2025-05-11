import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import type { SortingOptions } from '../../src/types';

describe('Grouped Property Sorting', () => {
    it('should sort properties according to predefined groups', () => {
        // Test data with properties in random order from different groups
        const properties = [
            'color',                // Appearance
            'position',             // Positioning
            'margin',               // Box model
            'width',                // Box model
            'z-index',              // Positioning
            'display',              // Layout
            'background-color',     // Appearance
            'font-size'             // Typography
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Check specific group ordering
        const positionIndex = result.sortedProperties!.indexOf('position');
        const zIndexIndex = result.sortedProperties!.indexOf('z-index');
        const displayIndex = result.sortedProperties!.indexOf('display');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const backgroundColorIndex = result.sortedProperties!.indexOf('background-color');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const fontSizeIndex = result.sortedProperties!.indexOf('font-size');

        // Positioning should come before layout
        expect(positionIndex).toBeLessThan(displayIndex);
        expect(zIndexIndex).toBeLessThan(displayIndex);

        // Layout should come before box model
        expect(displayIndex).toBeLessThan(widthIndex);
        expect(displayIndex).toBeLessThan(marginIndex);

        // Box model should come before appearance
        expect(widthIndex).toBeLessThan(backgroundColorIndex);
        expect(marginIndex).toBeLessThan(colorIndex);

        // Appearance should come before typography
        expect(backgroundColorIndex).toBeLessThan(fontSizeIndex);
        expect(colorIndex).toBeLessThan(fontSizeIndex);
    });

    it('should add empty lines between groups when configured', () => {
        const properties = [
            'position',
            'width',
            'color',
            'font-size'
        ];

        // With empty lines between groups
        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true
        });

        expect(result.success).toBe(true);

        // Should include empty lines between different groups
        expect(result.sortedProperties!.includes('')).toBe(true);

        // The length should be greater than the original due to added empty lines
        expect(result.sortedProperties!.length).toBeGreaterThan(properties.length);

        // Without empty lines
        const resultNoEmptyLines = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false
        });

        // Should not include empty lines (except after CSS variables if present)
        const emptyCounts = resultNoEmptyLines.sortedProperties!.filter(p => p === '').length;
        expect(emptyCounts).toBe(0);
        expect(resultNoEmptyLines.sortedProperties!.length).toBe(properties.length);
    });

    it('should place CSS variables at the beginning', () => {
        const properties = [
            'position',
            '--theme-color',
            'width',
            '--spacing',
            'color'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // CSS variables should be at the beginning
        const variables = properties.filter(p => p.startsWith('--'));

        for (let i = 0; i < variables.length; i++) {
            expect(result.sortedProperties![i].startsWith('--')).toBe(true);
        }

        // There should be an empty line after CSS variables
        expect(result.sortedProperties![variables.length]).toBe('');

        // Regular properties should maintain their group order
        const positionIndex = result.sortedProperties!.indexOf('position');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const colorIndex = result.sortedProperties!.indexOf('color');

        expect(positionIndex).toBeLessThan(widthIndex);
        expect(widthIndex).toBeLessThan(colorIndex);
    });
});