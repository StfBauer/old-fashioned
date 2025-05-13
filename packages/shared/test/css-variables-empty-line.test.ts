/**
 * Test for CSS variables empty line behavior
 */
import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';
import type { SortingOptions } from '../src/types';

describe('CSS Variables Empty Line Handling', () => {
    // Test properties with CSS variables
    const properties = [
        '--primary-color',
        '--secondary-color',
        '--spacing',
        'width',
        'height',
        'margin',
        'color'
    ];

    it('should add an empty line after CSS variables when emptyLinesBetweenGroups is true', () => {
        const options: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        const result = sortProperties(properties, options);

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toBeDefined();

        // Get the index of the first empty line
        const emptyLineIndex = result.sortedProperties?.indexOf('');

        // Check that we have an empty line
        expect(emptyLineIndex).not.toBe(-1);

        // Check that all CSS variables are before the empty line
        const beforeEmptyLine = result.sortedProperties?.slice(0, emptyLineIndex);
        const afterEmptyLine = result.sortedProperties?.slice(emptyLineIndex! + 1);

        expect(beforeEmptyLine?.every(prop => prop.startsWith('--'))).toBe(true);
        expect(afterEmptyLine?.some(prop => prop.startsWith('--'))).toBe(false);
    });

    it('should add an empty line after CSS variables even when emptyLinesBetweenGroups is false', () => {
        const options: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false,
            sortPropertiesWithinGroups: true
        };

        const result = sortProperties(properties, options);

        expect(result.success).toBe(true);
        expect(result.sortedProperties).toBeDefined();

        // As per project requirements, empty lines must be added after CSS variables
        // regardless of emptyLinesBetweenGroups setting
        expect(result.sortedProperties?.includes('')).toBe(true);

        // CSS variables should be followed by an empty line
        const cssVars = result.sortedProperties?.filter(p => p.startsWith('--'));
        const cssVarsEnd = cssVars ? cssVars.length - 1 : -1;
        if (cssVarsEnd >= 0 && result.sortedProperties) {
            const cssVarsEndIndex = result.sortedProperties?.indexOf(cssVars![cssVarsEnd]);
            expect(result.sortedProperties[cssVarsEndIndex + 1]).toBe('');
        }
    });

    it('should handle the case with no CSS variables', () => {
        const nonVarProps = ['width', 'height', 'margin', 'color'];
        const options: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        const result = sortProperties(nonVarProps, options);

        expect(result.success).toBe(true);
        // There should be no empty lines specifically for CSS variables grouping
        // Note: There might be empty lines for other groups depending on strategy
    });

    it('should handle the case with only CSS variables', () => {
        const onlyVarProps = ['--primary-color', '--secondary-color', '--spacing'];
        const options: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        const result = sortProperties(onlyVarProps, options);

        expect(result.success).toBe(true);
        // No empty line should be added if there are only CSS variables
        expect(result.sortedProperties?.filter(p => p === '').length).toBe(0);
    });

    // Test with different sorting strategies
    describe('Empty line consistency across strategies', () => {
        const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

        strategies.forEach(strategy => {
            it(`should consistently handle CSS variables with ${strategy} strategy`, () => {
                const options: SortingOptions = {
                    strategy,
                    emptyLinesBetweenGroups: true,
                    sortPropertiesWithinGroups: true
                };

                const result = sortProperties(properties, options);

                expect(result.success).toBe(true);

                // All CSS variables should be grouped together at the beginning
                const varProps = result.sortedProperties?.filter(p => p.startsWith('--'));
                const firstNonVarIndex = result.sortedProperties?.findIndex(p => !p.startsWith('--') && p !== '');

                expect(varProps?.length).toBe(3); // We have 3 CSS variables

                // Check that all variables come before any non-variables (excluding empty lines)
                if (firstNonVarIndex !== -1 && firstNonVarIndex !== undefined) {
                    const beforeFirstNonVar = result.sortedProperties?.slice(0, firstNonVarIndex).filter(p => p !== '');
                    expect(beforeFirstNonVar?.every(p => p.startsWith('--'))).toBe(true);
                }
            });
        });
    });
});
