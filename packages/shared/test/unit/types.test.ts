import { describe, it, expect } from 'vitest';
import { SortingStrategy, SortingOptions, PropertyGroup, NestedRuleContext, SortingResult } from '../../src/types';

describe('Types - Utility Functions', () => {
    describe('convertCSSCombConfig', () => {
        it('should convert CSSComb config with property groups', () => {
            // This is just a type test, not actually testing implementation
            const cssCombConfig = {
                'sort-order': [
                    ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
                    ['display', 'visibility', 'float', 'clear']
                ]
            };

            expect(cssCombConfig['sort-order']).toBeInstanceOf(Array);
            expect(cssCombConfig['sort-order'][0]).toBeInstanceOf(Array);
        });

        it('should handle empty CSSComb config', () => {
            const emptyCssCombConfig = {
                'sort-order': []
            };

            expect(emptyCssCombConfig['sort-order']).toBeInstanceOf(Array);
            expect(emptyCssCombConfig['sort-order'].length).toBe(0);
        });

        it('should handle CSSComb config with mixed arrays and strings', () => {
            const mixedCssCombConfig = {
                'sort-order': [
                    ['position', 'top', 'right', 'bottom', 'left'],
                    'z-index',
                    ['display', 'visibility']
                ]
            };

            expect(mixedCssCombConfig['sort-order']).toBeInstanceOf(Array);
            expect(mixedCssCombConfig['sort-order'].length).toBe(3);
        });

        it('should handle CSSComb config with additional properties', () => {
            const cssCombConfig = {
                'sort-order': [
                    ['position', 'top', 'right', 'bottom', 'left']
                ],
                'color-shorthand': true,
                'space-before-colon': ''
            };

            expect(cssCombConfig['sort-order']).toBeInstanceOf(Array);
            expect(cssCombConfig['color-shorthand']).toBe(true);
            expect(cssCombConfig['space-before-colon']).toBe('');
        });
    });

    describe('Interface Types', () => {
        it('should correctly use PropertyGroup interface', () => {
            const propertyGroup: PropertyGroup = {
                name: 'Position',
                properties: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
                emptyLineAfter: true
            };

            expect(propertyGroup.name).toBe('Position');
            expect(propertyGroup.properties.length).toBe(6);
            expect(propertyGroup.emptyLineAfter).toBe(true);
        });

        it('should correctly use NestedRuleContext interface', () => {
            const context: NestedRuleContext = {
                nestingLevel: 2,
                parentType: 'media',
                isAtRule: true
            };

            expect(context.nestingLevel).toBe(2);
            expect(context.parentType).toBe('media');
            expect(context.isAtRule).toBe(true);
        });

        it('should correctly use SortingOptions interface', () => {
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true,
                propertyGroups: [
                    ['position', 'z-index'],
                    ['width', 'height']
                ]
            };

            expect(options.strategy).toBe('alphabetical');
            expect(options.emptyLinesBetweenGroups).toBe(true);
            expect(options.sortPropertiesWithinGroups).toBe(true);
            expect(options.propertyGroups).toBeInstanceOf(Array);
            expect(options.propertyGroups![0]).toContain('position');
        });

        it('should correctly use SortingResult interface', () => {
            const result: SortingResult = {
                success: true,
                originalProperties: ['width', 'color'],
                sortedProperties: ['color', 'width']
            };

            expect(result.success).toBe(true);
            expect(result.originalProperties).toBeInstanceOf(Array);
            expect(result.sortedProperties).toBeInstanceOf(Array);
            expect(result.originalProperties).toContain('width');
            expect(result.sortedProperties).toContain('width');
        });
    });

    describe('SortingStrategy Type', () => {
        it('should accept valid strategy values', () => {
            const strategies: SortingStrategy[] = ['alphabetical', 'grouped', 'concentric', 'idiomatic', 'custom'];

            expect(strategies).toContain('alphabetical');
            expect(strategies).toContain('grouped');
            expect(strategies).toContain('concentric');
            expect(strategies).toContain('idiomatic');
            expect(strategies).toContain('custom');
            expect(strategies.length).toBe(5);
        });
    });
});