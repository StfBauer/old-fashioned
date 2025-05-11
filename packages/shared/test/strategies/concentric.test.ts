import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import type { SortingOptions } from '../../src/types';

describe('Concentric Property Sorting', () => {
    it('should sort properties from outside to inside', () => {
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

        const result = sortProperties(properties, { strategy: 'concentric' });

        expect(result.success).toBe(true);

        // Check some specific order expectations
        const positionIndex = result.sortedProperties!.indexOf('position');
        const topIndex = result.sortedProperties!.indexOf('top');
        const zIndexIndex = result.sortedProperties!.indexOf('z-index');
        const widthIndex = result.sortedProperties!.indexOf('width');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const paddingIndex = result.sortedProperties!.indexOf('padding');
        const borderIndex = result.sortedProperties!.indexOf('border');
        const backgroundColorIndex = result.sortedProperties!.indexOf('background-color');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const fontSizeIndex = result.sortedProperties!.indexOf('font-size');

        // Position properties should come first
        expect(positionIndex).toBeLessThan(widthIndex);
        expect(positionIndex).toBeLessThan(marginIndex);
        expect(topIndex).toBeLessThan(widthIndex);
        expect(zIndexIndex).toBeLessThan(widthIndex);

        // Box model properties 
        expect(marginIndex).toBeLessThan(colorIndex);
        expect(borderIndex).toBeLessThan(colorIndex);
        expect(paddingIndex).toBeLessThan(colorIndex);

        // Visual properties come after structural properties
        expect(widthIndex).toBeLessThan(backgroundColorIndex);
        expect(widthIndex).toBeLessThan(colorIndex);

        // Typography comes after background
        expect(backgroundColorIndex).toBeLessThan(fontSizeIndex);
        expect(colorIndex).toBeLessThan(fontSizeIndex);
    });

    it('should sort unknown properties alphabetically at the end', () => {
        const properties = [
            'position',
            'custom-property',
            'another-unknown',
            'margin'
        ];

        const result = sortProperties(properties, { strategy: 'concentric' });

        expect(result.success).toBe(true);

        // Known properties should come first
        const positionIndex = result.sortedProperties!.indexOf('position');
        const marginIndex = result.sortedProperties!.indexOf('margin');
        const customPropertyIndex = result.sortedProperties!.indexOf('custom-property');
        const anotherUnknownIndex = result.sortedProperties!.indexOf('another-unknown');

        // Known properties should be before unknown ones
        expect(positionIndex).toBeLessThan(customPropertyIndex);
        expect(marginIndex).toBeLessThan(customPropertyIndex);

        // Unknown properties should be sorted alphabetically
        expect(anotherUnknownIndex).toBeLessThan(customPropertyIndex);
    });
});
