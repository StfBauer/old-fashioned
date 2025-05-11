/**
 * Integration test for CSS variables and property at-rules
 * 
 * This test verifies the proper handling of CSS variables and @property at-rules
 * when sorting CSS properties with different strategies.
 */

import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import type { SortingOptions } from '../src/types';

describe('CSS Variables and @property Integration', () => {
    describe('CSS Variables Handling', () => {
        it('should group CSS variables at the beginning with empty line when enabled', () => {
            const properties = [
                'width',
                '--primary-color',
                'height',
                '--secondary-color',
                'margin',
                '--spacing',
                'color'
            ];

            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            expect(result.success).toBe(true);
            expect(result.sortedProperties).toBeDefined();

            if (result.sortedProperties) {
                // CSS variables should be at beginning
                expect(result.sortedProperties[0]).toBe('--primary-color');
                expect(result.sortedProperties[1]).toBe('--secondary-color');
                expect(result.sortedProperties[2]).toBe('--spacing');

                // Empty line after variables
                expect(result.sortedProperties[3]).toBe('');

                // Regular properties after empty line
                expect(result.sortedProperties.slice(4)).toContain('color');
                expect(result.sortedProperties.slice(4)).toContain('height');
                expect(result.sortedProperties.slice(4)).toContain('margin');
                expect(result.sortedProperties.slice(4)).toContain('width');
            }
        });
    });

    describe('@property at-rules and CSS Variables Integration', () => {
        it('should handle both @property at-rules and CSS variables correctly', () => {
            const properties = [
                'margin',
                '@property --grid-gap',
                'color',
                '--primary-color',
                '@property --primary-color-theme',
                'padding',
                '--spacing',
                '@property --spacing-unit'
            ];

            const options: SortingOptions = {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            expect(result.success).toBe(true);
            expect(result.sortedProperties).toBeDefined();

            if (result.sortedProperties) {
                // @property declarations should exist in the sorted properties
                const propertyRules = result.sortedProperties.filter(p => p.startsWith('@property'));
                expect(propertyRules).toHaveLength(3);
                expect(propertyRules).toContain('@property --grid-gap');
                expect(propertyRules).toContain('@property --primary-color-theme');
                expect(propertyRules).toContain('@property --spacing-unit');

                // CSS variables should come next                // CSS variables (--*) should exist in sorted properties
                const cssVars = result.sortedProperties.filter(p => p.startsWith('--'));
                expect(cssVars.length).toBeGreaterThan(0);

                // Empty line should exist between groups
                expect(result.sortedProperties.includes('')).toBe(true);

                // Regular properties should be present
                const regularProps = result.sortedProperties.filter(p => !p.startsWith('@property') && !p.startsWith('--') && p !== '');
                expect(regularProps.length).toBeGreaterThan(0);

                // Properties should be in expected groups based on grouped strategy
                const marginIndex = result.sortedProperties.indexOf('margin');
                const paddingIndex = result.sortedProperties.indexOf('padding');
                const colorIndex = result.sortedProperties.indexOf('color');

                expect(marginIndex).toBeLessThan(paddingIndex);
                expect(paddingIndex).toBeLessThan(colorIndex);
            }
        });
    });
});
