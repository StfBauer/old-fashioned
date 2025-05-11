import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../src/sorting';
import { SortingOptions, SortingResult } from '../../src/types';
import { DEFAULT_PROPERTY_GROUPS, CONCENTRIC_PROPERTY_ORDER, IDIOMATIC_PROPERTY_GROUPS } from '../../src/property-groups';

// Helper function to safely test sorted properties
function testSortedProperties(result: SortingResult, callback: (sortedProps: string[]) => void): void {
    expect(result.success).toBe(true);
    expect(result.sortedProperties).toBeDefined();

    if (result.success && result.sortedProperties) {
        callback(result.sortedProperties);
    }
}

describe('Sorting Strategies', () => {
    describe('Alphabetical Strategy', () => {
        it('should sort properties alphabetically', () => {
            const properties = ['width', 'color', 'background', 'display'];
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                expect(sortedProps).toEqual(['background', 'color', 'display', 'width']);
            });
        });

        it('should handle vendor prefixes correctly in alphabetical sort', () => {
            const properties = ['transform', '-webkit-transform', 'color', '-moz-transform'];
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                expect(sortedProps).toEqual(['-moz-transform', '-webkit-transform', 'color', 'transform']);
            });
        });

        it('should handle CSS variables in alphabetical sort', () => {
            const properties = ['width', '--primary-color', 'background', '--secondary-color'];
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // CSS variables should be sorted at the beginning
                expect(sortedProps[0]).toBe('--primary-color');
                expect(sortedProps[1]).toBe('--secondary-color');
                // Should have an empty line after variables
                expect(sortedProps[2]).toBe('');
                // Then the rest of the properties alphabetically
                expect(sortedProps.slice(3)).toEqual(['background', 'width']);
            });
        });
    });

    describe('Grouped Strategy', () => {
        it('should sort properties according to defined groups', () => {
            const properties = ['color', 'position', 'width', 'display'];
            const options: SortingOptions = {
                strategy: 'grouped',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: false
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Position should come before display, which should come before width, which should come before color
                const positionIndex = sortedProps.indexOf('position');
                const displayIndex = sortedProps.indexOf('display');
                const widthIndex = sortedProps.indexOf('width');
                const colorIndex = sortedProps.indexOf('color');

                expect(positionIndex).toBeLessThan(displayIndex);
                expect(displayIndex).toBeLessThan(widthIndex);
                expect(widthIndex).toBeLessThan(colorIndex);
            });
        });

        it('should add empty lines between groups when requested', () => {
            const properties = ['color', 'position', 'width', 'display'];
            const options: SortingOptions = {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Check for empty lines between groups
                expect(sortedProps.includes('')).toBe(true);
            });
        });
    });

    describe('Concentric Strategy', () => {
        it('should sort properties from outside-in (concentric model)', () => {
            const properties = ['padding', 'position', 'margin', 'color'];
            const options: SortingOptions = {
                strategy: 'concentric',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Verify order follows concentric model (position -> margin -> padding -> color)
                const positionIndex = sortedProps.indexOf('position');
                const marginIndex = sortedProps.indexOf('margin');
                const paddingIndex = sortedProps.indexOf('padding');
                const colorIndex = sortedProps.indexOf('color');

                expect(positionIndex).toBeLessThan(marginIndex);
                expect(marginIndex).toBeLessThan(paddingIndex);
                expect(paddingIndex).toBeLessThan(colorIndex);
            });
        });
    });

    describe('Idiomatic Strategy', () => {
        it('should sort properties following Nicolas Gallagher\'s Idiomatic CSS principles', () => {
            const properties = ['font-size', 'position', 'width', 'display', 'color'];
            const options: SortingOptions = {
                strategy: 'idiomatic',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: false
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Idiomatic ordering: position, display, box model (width), typography (font-size), visual (color)
                const positionIndex = sortedProps.indexOf('position');
                const displayIndex = sortedProps.indexOf('display');
                const widthIndex = sortedProps.indexOf('width');
                const fontSizeIndex = sortedProps.indexOf('font-size');
                const colorIndex = sortedProps.indexOf('color');

                expect(positionIndex).toBeLessThan(displayIndex);
                expect(displayIndex).toBeLessThan(widthIndex);
                expect(widthIndex).toBeLessThan(fontSizeIndex);
                expect(fontSizeIndex).toBeLessThan(colorIndex);
            });
        });
    });

    describe('Custom Strategy', () => {
        it('should sort properties based on custom property groups', () => {
            // Format the custom groups as string[][] which is what the SortingOptions interface expects
            const customGroups: string[][] = [
                ['color', 'background-color', 'background'],
                ['width', 'height'],
                ['display', 'position']
            ];

            const properties = ['width', 'color', 'position', 'background', 'height', 'display'];
            const options: SortingOptions = {
                strategy: 'custom',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true,
                propertyGroups: customGroups
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Check that properties within each group are together
                const colorIndex = sortedProps.indexOf('color');
                const backgroundIndex = sortedProps.indexOf('background');
                const widthIndex = sortedProps.indexOf('width');
                const heightIndex = sortedProps.indexOf('height');
                const displayIndex = sortedProps.indexOf('display');
                const positionIndex = sortedProps.indexOf('position');

                // Group 1 properties should be before Group 2 properties
                expect(Math.max(colorIndex, backgroundIndex)).toBeLessThan(Math.min(widthIndex, heightIndex));

                // Group 2 properties should be before Group 3 properties
                expect(Math.max(widthIndex, heightIndex)).toBeLessThan(Math.min(displayIndex, positionIndex));
            });
        });

        it('should return error when custom strategy is used without propertyGroups', () => {
            const properties = ['width', 'color', 'background', 'display'];
            const options: SortingOptions = {
                strategy: 'custom',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Custom strategy requires propertyGroups option');
        });
    });

    describe('Invalid Strategy', () => {
        it('should return error for unknown strategy', () => {
            const properties = ['width', 'color', 'background', 'display'];
            const options: SortingOptions = {
                strategy: 'nonexistent' as any,
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Unknown strategy: nonexistent');
        });
    });

    describe('CSS Variables Handling', () => {
        it('should always place CSS variables at the beginning', () => {
            const properties = ['width', '--primary-color', 'background', '--secondary-color'];

            // Test with different strategies
            const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

            for (const strategy of strategies) {
                const options: SortingOptions = {
                    strategy,
                    emptyLinesBetweenGroups: false,
                    sortPropertiesWithinGroups: true
                };

                const result = sortProperties(properties, options);

                testSortedProperties(result, (sortedProps) => {
                    // CSS variables should be first and in alphabetical order
                    expect(sortedProps[0]).toBe('--primary-color');
                    expect(sortedProps[1]).toBe('--secondary-color');
                    // Should have an empty line after variables
                    expect(sortedProps[2]).toBe('');
                });
            }
        });
    });

    describe('Caching Functionality', () => {
        it('should produce consistent results when called multiple times', () => {
            const properties = ['width', 'color', 'background', 'display'];
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result1 = sortProperties(properties, options);
            const result2 = sortProperties(properties, options);

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);

            testSortedProperties(result1, (sortedProps1) => {
                testSortedProperties(result2, (sortedProps2) => {
                    expect(sortedProps1).toEqual(sortedProps2);
                });
            });
        });

        it('should use cached results when available with sortPropertiesWithCache', () => {
            const properties = ['width', 'color', 'background', 'display'];
            const options: SortingOptions = {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            // This test is more for code coverage since we can't directly observe cache hits
            // But we can verify the results are consistent
            const result1 = sortProperties(properties, options);
            const result2 = sortProperties([...properties], options); // Create a new array to avoid reference issues

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);

            testSortedProperties(result1, (sortedProps1) => {
                testSortedProperties(result2, (sortedProps2) => {
                    expect(sortedProps1).toEqual(sortedProps2);
                });
            });
        });
    });

    describe('Empty Lines Between Groups', () => {
        it('should add empty lines between groups when requested', () => {
            const properties = ['position', 'z-index', 'display', 'width', 'color', 'background-color'];
            const options: SortingOptions = {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                expect(sortedProps.filter(p => p === '').length).toBeGreaterThan(0);
            });
        });

        it('should not add empty lines between groups when not requested', () => {
            const properties = ['position', 'z-index', 'display', 'width', 'color', 'background-color'];
            const options: SortingOptions = {
                strategy: 'grouped',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
            };

            const result = sortProperties(properties, options);

            testSortedProperties(result, (sortedProps) => {
                // Should not have empty lines (except possibly after CSS variables, but we don't have any here)
                expect(sortedProps.includes('')).toBe(false);
            });
        });
    });
});
