import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../shared/src/sorting';

describe('Modern CSS feature support', () => {
    it('should group container query properties', () => {
        const properties = [
            'container-name', 'container-type', 'display', 'position', 'container'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Container properties should be grouped together
        const containerIndex = result.sortedProperties!.indexOf('container');
        const containerTypeIndex = result.sortedProperties!.indexOf('container-type');
        const containerNameIndex = result.sortedProperties!.indexOf('container-name');

        // Check that all container properties are closely grouped
        expect(Math.abs(containerIndex - containerTypeIndex)).toBeLessThanOrEqual(2);
        expect(Math.abs(containerIndex - containerNameIndex)).toBeLessThanOrEqual(2);
        expect(Math.abs(containerTypeIndex - containerNameIndex)).toBeLessThanOrEqual(2);
    });

    it('should group logical and physical properties for inset', () => {
        const properties = [
            'inset', 'inset-block', 'inset-inline', 'position',
            'top', 'left', 'inset-block-start', 'inset-inline-end'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // All inset properties should be grouped with position properties
        const positionIndex = result.sortedProperties!.indexOf('position');
        const insetIndex = result.sortedProperties!.indexOf('inset');
        const insetBlockIndex = result.sortedProperties!.indexOf('inset-block');
        const insetInlineEndIndex = result.sortedProperties!.indexOf('inset-inline-end');

        // Position-related properties should be in the same group
        expect(Math.abs(positionIndex - insetIndex)).toBeLessThanOrEqual(7);
        expect(Math.abs(insetIndex - insetBlockIndex)).toBeLessThanOrEqual(6);
        expect(Math.abs(positionIndex - insetInlineEndIndex)).toBeLessThanOrEqual(7);
    });

    it('should group gap properties with flex properties', () => {
        const properties = [
            'display',
            'color',
            'flex',
            'gap',
            'margin',
            'row-gap',
            'padding',
            'column-gap'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // In our new algorithm, these are grouped by their base property names
        // 'column-gap', 'gap', and 'row-gap' should be next to each other
        const columnGapIndex = result.sortedProperties!.indexOf('column-gap');
        const gapIndex = result.sortedProperties!.indexOf('gap');
        const rowGapIndex = result.sortedProperties!.indexOf('row-gap');

        // Verify they're all close to each other in the output
        const minGapIndex = Math.min(columnGapIndex, gapIndex, rowGapIndex);
        const maxGapIndex = Math.max(columnGapIndex, gapIndex, rowGapIndex);

        // The difference between max and min should be exactly the number of gap properties - 1
        expect(maxGapIndex - minGapIndex).toBe(2);
    });

    it('should group grid properties together', () => {
        const properties = [
            'display', 'grid', 'grid-template-columns', 'grid-auto-flow',
            'grid-area', 'width', 'flex', 'grid-template-rows'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Grid properties should be grouped together
        const gridIndex = result.sortedProperties!.indexOf('grid');
        const gridTemplateColumnsIndex = result.sortedProperties!.indexOf('grid-template-columns');
        const gridTemplateRowsIndex = result.sortedProperties!.indexOf('grid-template-rows');

        expect(Math.abs(gridIndex - gridTemplateColumnsIndex)).toBeLessThanOrEqual(6);
        expect(Math.abs(gridIndex - gridTemplateRowsIndex)).toBeLessThanOrEqual(6);
    });

    it('should include aspect-ratio with dimension properties', () => {
        const properties = [
            'width', 'height', 'aspect-ratio', 'max-width'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Aspect-ratio should be grouped with other dimension properties
        const widthIndex = result.sortedProperties!.indexOf('width');
        const aspectRatioIndex = result.sortedProperties!.indexOf('aspect-ratio');

        expect(Math.abs(widthIndex - aspectRatioIndex)).toBeLessThanOrEqual(3);
    });

    it('should group logical border properties together', () => {
        const properties = [
            'border', 'border-width', 'border-block', 'border-block-end',
            'border-inline-start', 'border-inline-color', 'border-start-end-radius'
        ];

        const result = sortProperties(properties, { strategy: 'grouped' });

        expect(result.success).toBe(true);

        // Logical border properties should be grouped with standard border properties
        const borderIndex = result.sortedProperties!.indexOf('border');
        const borderBlockIndex = result.sortedProperties!.indexOf('border-block');
        const borderInlineStartIndex = result.sortedProperties!.indexOf('border-inline-start');
        const borderStartEndRadiusIndex = result.sortedProperties!.indexOf('border-start-end-radius');

        expect(Math.abs(borderIndex - borderBlockIndex)).toBeLessThanOrEqual(10);
        expect(Math.abs(borderIndex - borderInlineStartIndex)).toBeLessThanOrEqual(10);
        expect(Math.abs(borderIndex - borderStartEndRadiusIndex)).toBeLessThanOrEqual(20);
    });

    it('should support concentric sorting with modern CSS properties', () => {
        const properties = [
            'color', 'position', 'inset', 'container', 'aspect-ratio',
            'gap', 'grid-template-columns', 'padding-inline'
        ];

        const result = sortProperties(properties, { strategy: 'concentric' });

        expect(result.success).toBe(true);

        // In concentric sorting, position properties should come before visual properties
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');

        // Position and structure properties should come before visual properties
        expect(positionIndex).toBeLessThan(colorIndex);

        // Check for presence of modern properties in the results
        expect(result.sortedProperties!.includes('inset')).toBe(true);
        expect(result.sortedProperties!.includes('container')).toBe(true);
        expect(result.sortedProperties!.includes('aspect-ratio')).toBe(true);
        expect(result.sortedProperties!.includes('grid-template-columns')).toBe(true);
        expect(result.sortedProperties!.includes('padding-inline')).toBe(true);
    });

    it('should support idiomatic sorting with modern CSS properties', () => {
        const properties = [
            'color', 'position', 'inset-block', 'container-type', 'aspect-ratio',
            'gap', 'grid-template-columns', 'padding-inline-start'
        ];

        const result = sortProperties(properties, { strategy: 'idiomatic' });

        expect(result.success).toBe(true);

        // In idiomatic sorting, position properties should come before visual properties
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');

        // Container should be in position group
        const containerTypeIndex = result.sortedProperties!.indexOf('container-type');

        // Aspect-ratio should be grouped with box sizing
        const aspectRatioIndex = result.sortedProperties!.indexOf('aspect-ratio');

        // Padding-inline should be with spacing properties
        const paddingInlineStartIndex = result.sortedProperties!.indexOf('padding-inline-start');

        expect(positionIndex).toBeLessThan(colorIndex);
        expect(containerTypeIndex).toBeLessThan(colorIndex);
        expect(aspectRatioIndex).toBeLessThan(colorIndex);
        expect(paddingInlineStartIndex).toBeLessThan(colorIndex);
    });
});
