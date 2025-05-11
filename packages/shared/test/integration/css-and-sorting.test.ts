import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

describe('CSS and Property Sorting Integration', () => {
    describe('CSS Variables with Different Sorting Strategies', () => {
        it('should place CSS variables at the beginning for all strategies', () => {
            const properties = [
                'color',
                '--primary-color',
                'margin',
                '--spacing',
                'display',
                '--accent-color'
            ];

            // Test all sorting strategies
            const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

            for (const strategy of strategies) {
                const result = sortProperties(properties, { strategy });

                expect(result.success).toBe(true);

                // CSS variables should be at the beginning
                const cssVarsCount = properties.filter(p => p.startsWith('--')).length;

                for (let i = 0; i < cssVarsCount; i++) {
                    expect(result.sortedProperties![i].startsWith('--')).toBe(true);
                }

                // There should be an empty line after CSS variables
                expect(result.sortedProperties![cssVarsCount]).toBe('');
            }
        });

        it('should maintain alphabetical order within CSS variables group', () => {
            const properties = [
                '--zebra',
                '--apple',
                '--banana',
                'color',
                'margin'
            ];

            // Test all sorting strategies
            const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

            for (const strategy of strategies) {
                const result = sortProperties(properties, { strategy });

                expect(result.success).toBe(true);

                // CSS variables should be sorted alphabetically
                expect(result.sortedProperties![0]).toBe('--apple');
                expect(result.sortedProperties![1]).toBe('--banana');
                expect(result.sortedProperties![2]).toBe('--zebra');
            }
        });
    });

    describe('@property Rules Integration', () => {
        it('should handle @property rules with all strategies', () => {
            const properties = [
                'color',
                '@property --spin-angle',
                'margin',
                '@property --gradient-angle',
                'display'
            ];

            // Test all sorting strategies
            const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

            for (const strategy of strategies) {
                const result = sortProperties(properties, { strategy });

                expect(result.success).toBe(true);

                // All @property rules should be present in the result
                const propertyRulesCount = properties.filter(p => p.startsWith('@property')).length;

                // Verify that all @property rules are in the sorted properties
                const propertyRules = result.sortedProperties!.filter(p => p.startsWith('@property'));
                expect(propertyRules.length).toBe(propertyRulesCount);

                // @property rules should include both declarations in some order
                expect(propertyRules).toContain('@property --gradient-angle');
                expect(propertyRules).toContain('@property --spin-angle');

                // Regular properties should also be present
                expect(result.sortedProperties!).toContain('color');
                expect(result.sortedProperties!).toContain('margin');
                expect(result.sortedProperties!).toContain('display');
            }
        });
    });

    describe('Empty Lines Between Groups Integration', () => {
        it('should handle empty lines between groups consistently', () => {
            const properties = [
                'position',
                'display',
                'width',
                'background-color',
                'color',
                'animation'
            ];

            // Test grouped and idiomatic with empty lines
            const result1 = sortProperties(properties, {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true
            });

            const result2 = sortProperties(properties, {
                strategy: 'idiomatic',
                emptyLinesBetweenGroups: true
            });

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);

            // Both should include empty lines between groups
            expect(result1.sortedProperties!.includes('')).toBe(true);
            expect(result2.sortedProperties!.includes('')).toBe(true);

            // Should have more lines than original properties due to empty lines
            expect(result1.sortedProperties!.length).toBeGreaterThan(properties.length);
            expect(result2.sortedProperties!.length).toBeGreaterThan(properties.length);
        });
    });

    describe('Vendor Prefixes Integration', () => {
        it('should handle vendor prefixes correctly with all strategies', () => {
            const properties = [
                '-webkit-transform',
                'transform',
                '-moz-transform',
                '-ms-transform'
            ];

            // Test all sorting strategies
            const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

            for (const strategy of strategies) {
                const result = sortProperties(properties, { strategy });

                expect(result.success).toBe(true);

                // Vendor prefixes should stay together with their unprefixed version
                const transformIndex = result.sortedProperties!.indexOf('transform');
                const webkitIndex = result.sortedProperties!.indexOf('-webkit-transform');
                const mozIndex = result.sortedProperties!.indexOf('-moz-transform');
                const msIndex = result.sortedProperties!.indexOf('-ms-transform');

                // For most strategies, prefix order should be maintained
                // This is a general test that all prefixes are nearby (within reasonable range)
                const allIndices = [transformIndex, webkitIndex, mozIndex, msIndex];
                const minIndex = Math.min(...allIndices);
                const maxIndex = Math.max(...allIndices);

                // All transform properties should be within a small range
                expect(maxIndex - minIndex).toBeLessThan(5);
            }
        });
    });
});