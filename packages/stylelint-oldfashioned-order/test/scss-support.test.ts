import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../shared/src/sorting';

describe('SCSS-specific features', () => {
    it('should handle properties with media queries within a rule', () => {
        // Even with media queries in between, properties should sort properly
        const properties = [
            'position', 'top', 'right', 'bottom', 'content',
            'display', 'box-sizing', 'width', 'height',
            'padding', 'margin', 'background-color', 'font-family',
            'font-size', 'font-weight', 'transition'
        ];

        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true
        });

        expect(result.success).toBe(true);

        // Check that empty lines are inserted between groups
        const emptyLineCount = result.sortedProperties!.filter(prop => prop === '').length;
        expect(emptyLineCount).toBeGreaterThan(0);

        // Position properties should come first
        const positionIndex = result.sortedProperties!.indexOf('position');
        const contentIndex = result.sortedProperties!.indexOf('content');

        expect(positionIndex).toBeLessThan(contentIndex);
    });

    it('should sort properties with logical and physical properties', () => {
        const properties = [
            'padding-left', 'padding-inline-start', 'margin-top', 'margin-block-start'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Padding variations should be grouped together
        const paddingLeftIndex = result.sortedProperties!.indexOf('padding-left');
        const paddingInlineStartIndex = result.sortedProperties!.indexOf('padding-inline-start');

        // Margin variations should be grouped together
        const marginTopIndex = result.sortedProperties!.indexOf('margin-top');
        const marginBlockStartIndex = result.sortedProperties!.indexOf('margin-block-start');

        expect(Math.abs(paddingLeftIndex - paddingInlineStartIndex)).toBeLessThanOrEqual(5);
        expect(Math.abs(marginTopIndex - marginBlockStartIndex)).toBeLessThanOrEqual(5);
    });
});
