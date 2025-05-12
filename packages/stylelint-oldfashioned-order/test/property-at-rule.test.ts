import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../shared/src/sorting';

describe('@property At-Rule Support', () => {
    it('should place @property rules at the beginning of CSS styles', () => {
        const properties = [
            'color',
            '@property --gradient-angle',
            'margin',
            '@property --spin-angle'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // @property rules should be at the beginning
        const firstProperty = result.sortedProperties![0];
        const secondProperty = result.sortedProperties![1];

        expect(firstProperty.startsWith('@property')).toBe(true);
        expect(secondProperty.startsWith('@property')).toBe(true);

        // Other properties should follow
        const colorIndex = result.sortedProperties!.indexOf('color');
        const marginIndex = result.sortedProperties!.indexOf('margin');

        expect(colorIndex).toBeGreaterThan(1);
        expect(marginIndex).toBeGreaterThan(1);
    });

    it('should place @property rules in alphabetical order', () => {
        const properties = [
            '@property --z-variable',
            '@property --a-variable',
            'color'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // @property rules should be sorted alphabetically
        const aVariableIndex = result.sortedProperties!.findIndex(p => p.includes('--a-variable'));
        const zVariableIndex = result.sortedProperties!.findIndex(p => p.includes('--z-variable'));

        expect(aVariableIndex).toBeLessThan(zVariableIndex);

        // color should be after @property rules
        const colorIndex = result.sortedProperties!.indexOf('color');
        expect(colorIndex).toBeGreaterThan(aVariableIndex);
        expect(colorIndex).toBeGreaterThan(zVariableIndex);
    });

    it('should place CSS variables after @property rules', () => {
        const properties = [
            'color',
            '@property --my-color',
            '--accent-color',
            'margin'
        ];

        const result = sortProperties(properties, { strategy: 'alphabetical' });

        expect(result.success).toBe(true);

        // Check if result contains both CSS variables and @property rules
        const containsAtProperty = result.sortedProperties!.some(p => p.includes('@property'));
        const containsCssVar = result.sortedProperties!.some(p => p === '--accent-color');

        expect(containsAtProperty).toBe(true);
        expect(containsCssVar).toBe(true);

        // Find the positions
        const atPropertyIndex = result.sortedProperties!.findIndex(p => p.includes('@property'));
        const cssVarIndex = result.sortedProperties!.findIndex(p => p === '--accent-color');
        const colorIndex = result.sortedProperties!.indexOf('color');
        const marginIndex = result.sortedProperties!.indexOf('margin');

        // Verify the order: first @property, then CSS variables, then regular properties
        // Regular properties should come after CSS variables
        expect(colorIndex).toBeGreaterThan(cssVarIndex);
        expect(marginIndex).toBeGreaterThan(cssVarIndex);
    });

    it('should handle @property rules with different sorting strategies', () => {
        const properties = [
            'color',
            '@property --my-color',
            'position',
            'margin',
            '@property --layout-grid'
        ];

        // Test with alphabetical strategy
        const alphaResult = sortProperties(properties, { strategy: 'alphabetical' });
        expect(alphaResult.success).toBe(true);

        // All sorting strategies should include @property rules
        expect(alphaResult.sortedProperties!.some(p => p.includes('@property'))).toBe(true);

        // Test with grouped strategy
        const groupedResult = sortProperties(properties, { strategy: 'grouped' });
        expect(groupedResult.success).toBe(true);
        expect(groupedResult.sortedProperties!.some(p => p.includes('@property'))).toBe(true);

        // Test with concentric strategy
        const concentricResult = sortProperties(properties, { strategy: 'concentric' });
        expect(concentricResult.success).toBe(true);
        expect(concentricResult.sortedProperties!.some(p => p.includes('@property'))).toBe(true);

        // Verify that all strategies sort @property rules consistently
        const findAtPropertyRules = (props: string[]) => props.filter(p => p.includes('@property'));

        const alphaPropertyRules = findAtPropertyRules(alphaResult.sortedProperties!);
        const groupedPropertyRules = findAtPropertyRules(groupedResult.sortedProperties!);
        const concentricPropertyRules = findAtPropertyRules(concentricResult.sortedProperties!);

        // Each strategy should preserve both @property rules
        expect(alphaPropertyRules.length).toBe(2);
        expect(groupedPropertyRules.length).toBe(2);
        expect(concentricPropertyRules.length).toBe(2);
    });
});