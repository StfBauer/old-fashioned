import { describe, it, expect } from 'vitest';
import { sortProperties } from '../../packages/shared/src/sorting';

/**
 * CSS Variables Empty Line Test Suite
 * 
 * This test suite verifies that CSS variables are properly handled in the sorting functionality:
 * 1. CSS variables should always appear at the top of sorted properties
 * 2. CSS variables should be alphabetically sorted
 * 3. There should always be an empty line after CSS variables to separate them from regular properties
 */
describe('CSS Variables Handling', () => {
  // Test cases with different property arrangements
  const testCases = [
    {
      name: "Basic CSS variables and properties",
      properties: [
        '--primary-color',
        '--secondary-color',
        '--spacing',
        'width',
        'height',
        'margin',
        'color'
      ]
    },
    {
      name: "Edge case with CSS variables mixed with properties",
      properties: [
        'width',
        'height',
        'margin',
        'color',
        '--primary-color',
        '--secondary-color',
        '--spacing'
      ]
    },
    {
      name: "Single CSS variable with properties",
      properties: [
        'width',
        '--single-var',
        'height',
        'color'
      ]
    }
  ];

  // Test each strategy and emptyLinesBetweenGroups setting combination
  const strategies: ('alphabetical' | 'grouped' | 'concentric' | 'idiomatic')[] = [
    'alphabetical', 'grouped', 'concentric', 'idiomatic'
  ];
  const emptyLinesSettings = [true, false];

  // Generate tests for all combinations
  testCases.forEach(testCase => {
    describe(`${testCase.name}`, () => {
      strategies.forEach(strategy => {
        emptyLinesSettings.forEach(emptyLines => {
          it(`should add an empty line after CSS variables (strategy: ${strategy}, emptyLinesBetweenGroups: ${emptyLines})`, () => {
            const result = sortProperties(testCase.properties, {
              strategy,
              emptyLinesBetweenGroups: emptyLines,
              sortPropertiesWithinGroups: true
            });

            // Verify the result was successful
            expect(result.success).toBe(true);

            // Find all CSS variables in the result
            const cssVars = result.sortedProperties!.filter(p => p.startsWith('--'));

            // Only test if we have CSS variables and other properties
            if (cssVars.length > 0) {
              const nonVarProperties = result.sortedProperties!.filter(p => !p.startsWith('--') && p !== '');

              // Skip test if there are no non-variable properties
              if (nonVarProperties.length === 0) return;

              // The line after all variables should be an empty string
              const lineAfterVarsIndex = cssVars.length;

              // There should always be an empty line after CSS variables
              expect(result.sortedProperties![lineAfterVarsIndex]).toBe('');

              // CSS variables should be at the top
              for (let i = 0; i < cssVars.length; i++) {
                expect(result.sortedProperties![i].startsWith('--')).toBe(true);
              }

              // CSS variables should be alphabetically sorted
              const sortedVars = [...cssVars].sort((a, b) => a.localeCompare(b));
              expect(cssVars).toEqual(sortedVars);
            }
          });
        });
      });
    });
  });
});
