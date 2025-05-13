import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../shared/src/sorting';

describe('SCSS Property Sorting', () => {
    it('should sort complex property list', () => {
        // Complex property list from the SCSS example
        const properties = [
            'position',
            'z-index',
            'top',
            'right',
            'bottom',
            'isolation',
            'display',
            'visibility',
            'box-sizing',
            'width',
            'height',
            'padding',
            'padding-block',
            'padding-inline',
            'padding-inline-start',
            'margin',
            'font-family',
            'font-size',
            'font-weight',
            'transition',
            'background-color',
            'content'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Position-related properties should be grouped together at the beginning
        const positionIndex = result.sortedProperties!.indexOf('position');
        const topIndex = result.sortedProperties!.indexOf('top');

        expect(positionIndex).toBeLessThan(5); // Should be near the start
        expect(Math.abs(positionIndex - topIndex)).toBeLessThanOrEqual(5); // Should be close together

        // Box model properties should follow position properties
        const displayIndex = result.sortedProperties!.indexOf('display');
        const widthIndex = result.sortedProperties!.indexOf('width');

        expect(displayIndex).toBeGreaterThan(positionIndex);
        expect(widthIndex).toBeGreaterThan(displayIndex);

        // Visual properties should be later
        const bgColorIndex = result.sortedProperties!.indexOf('background-color');

        expect(bgColorIndex).toBeGreaterThan(widthIndex);

        // Font properties should be grouped together
        const fontFamilyIndex = result.sortedProperties!.indexOf('font-family');
        const fontSizeIndex = result.sortedProperties!.indexOf('font-size');

        expect(Math.abs(fontFamilyIndex - fontSizeIndex)).toBeLessThanOrEqual(2);
    });
});
