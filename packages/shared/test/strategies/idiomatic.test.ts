import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import type { SortingOptions } from '../../src/types';

describe('Idiomatic Property Sorting', () => {
    it('should sort properties according to Idiomatic CSS principles', () => {
        // Test data with properties in random order from different groups
        const properties = [
            'font-size',           // Typography
            'width',               // Box sizing
            'margin',              // Spacing
            'position',            // Positioning
            'color',               // Typography
            'z-index',             // Positioning
            'background-color',    // Background
            'display',             // Display & Box Model
            'animation'            // Animation
        ];

        const result = sortProperties(properties, { strategy: 'idiomatic' });

        expect(result.success).toBe(true);

        // Check specific group ordering based on IDIOMATIC_PROPERTY_GROUPS
        const positionIndex = result.sortedProperties!.indexOf('position');
        const zIndexIndex = result.sortedProperties!.indexOf('z-index');
        const displayIndex = result.sortedProperties!.indexOf('display');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const backgroundColorIndex = result.sortedProperties!.indexOf('background-color');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const fontSizeIndex = result.sortedProperties!.indexOf('font-size');
        const animationIndex = result.sortedProperties!.indexOf('animation');

        // Positioning should come first
        expect(positionIndex).toBeLessThan(displayIndex);
        expect(zIndexIndex).toBeLessThan(displayIndex);

        // Display & Box Model should come before Box sizing
        expect(displayIndex).toBeLessThan(widthIndex);

        // Box sizing should come before Spacing
        expect(widthIndex).toBeLessThan(marginIndex);

        // Spacing should come before Background
        expect(marginIndex).toBeLessThan(backgroundColorIndex);

        // Background should come before Typography
        expect(backgroundColorIndex).toBeLessThan(colorIndex);
        expect(backgroundColorIndex).toBeLessThan(fontSizeIndex);

        // Typography should come before Animation
        expect(fontSizeIndex).toBeLessThan(animationIndex);
        expect(colorIndex).toBeLessThan(animationIndex);
    });

    it('should add empty lines between groups when configured', () => {
        const properties = [
            'position',           // Positioning
            'display',            // Display & Box Model
            'width',              // Box sizing
            'margin',             // Spacing
            'background-color',   // Background
            'color',              // Typography
            'animation'           // Animation
        ];

        // With empty lines between groups
        const result = sortProperties(properties, {
            strategy: 'idiomatic',
            emptyLinesBetweenGroups: true
        });

        expect(result.success).toBe(true);

        // Should include empty lines between different groups
        expect(result.sortedProperties!.includes('')).toBe(true);

        // The length should be greater than the original due to added empty lines
        expect(result.sortedProperties!.length).toBeGreaterThan(properties.length);

        // Without empty lines
        const resultNoEmptyLines = sortProperties(properties, {
            strategy: 'idiomatic',
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

        const result = sortProperties(properties, { strategy: 'idiomatic' });

        expect(result.success).toBe(true);

        // CSS variables should be at the beginning
        const variables = properties.filter(p => p.startsWith('--'));

        for (let i = 0; i < variables.length; i++) {
            expect(result.sortedProperties![i].startsWith('--')).toBe(true);
        }

        // There should be an empty line after CSS variables
        expect(result.sortedProperties![variables.length]).toBe('');

        // Regular properties should maintain their idiomatic order
        const positionIndex = result.sortedProperties!.indexOf('position');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const colorIndex = result.sortedProperties!.indexOf('color');

        expect(positionIndex).toBeLessThan(widthIndex);
        expect(widthIndex).toBeLessThan(colorIndex);
    });

    it('should handle properties from all idiomatic groups', () => {
        // Test with properties from all idiomatic groups
        const properties = [
            'animation',             // Animation group
            'color',                 // Typography group
            'background',            // Background group
            'margin',                // Spacing group
            'width',                 // Box sizing group
            'display',               // Display & Box Model group
            'container',             // Container queries group
            'grid-template',         // Grid group
            'position'               // Positioning group
        ];

        const result = sortProperties(properties, { strategy: 'idiomatic' });

        expect(result.success).toBe(true);

        // Check that properties from each group are in the right order
        const positionIndex = result.sortedProperties!.indexOf('position');
        const containerIndex = result.sortedProperties!.indexOf('container');
        const displayIndex = result.sortedProperties!.indexOf('display');
        const gridTemplateIndex = result.sortedProperties!.indexOf('grid-template');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const backgroundIndex = result.sortedProperties!.indexOf('background');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const animationIndex = result.sortedProperties!.indexOf('animation');

        // Verify ordering between groups
        expect(positionIndex).toBeLessThan(containerIndex);
        expect(containerIndex).toBeLessThan(displayIndex);
        expect(displayIndex).toBeLessThan(gridTemplateIndex);
        expect(gridTemplateIndex).toBeLessThan(widthIndex);
        expect(widthIndex).toBeLessThan(marginIndex);
        expect(marginIndex).toBeLessThan(backgroundIndex);
        expect(backgroundIndex).toBeLessThan(colorIndex);
        expect(colorIndex).toBeLessThan(animationIndex);
    });
});