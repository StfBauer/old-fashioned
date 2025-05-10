import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';

describe('CSS Custom Properties Separation', () => {
  // Test that CSS variables are always separated by an empty line
  it('should always add an empty line after CSS variables, regardless of sorting strategy or empty lines option', () => {
    // Mixed properties including CSS variables
    const props = [
      'width',
      '--color',
      'height',
      '--spacing',
      'margin',
      'padding',
      '--border',
      'color',
    ];

    // Test with different sorting strategies
    const strategies: ('alphabetical' | 'grouped' | 'concentric' | 'idiomatic')[] = [
      'alphabetical', 'grouped', 'concentric', 'idiomatic'
    ];

    // Test with both emptyLinesBetweenGroups options
    const emptyLinesOptions = [true, false];

    for (const strategy of strategies) {
      for (const emptyLinesBetweenGroups of emptyLinesOptions) {
        const options = {
          strategy,
          emptyLinesBetweenGroups,
          sortPropertiesWithinGroups: true
        };

        const result = sortProperties(props, options);

        // Verify the result was successful
        expect(result.success).toBe(true);

        console.log(`Strategy: ${strategy}, EmptyLines: ${emptyLinesBetweenGroups}`);
        console.log(result.sortedProperties);

        // Find the variables section
        const variables = result.sortedProperties!.filter(p => p.startsWith('--'));
        const emptyLineIndex = result.sortedProperties!.indexOf('');

        // Variables should be at the beginning
        for (let i = 0; i < variables.length; i++) {
          expect(result.sortedProperties![i]).toBe(variables[i]);
        }

        // There should be an empty line after the variables
        expect(emptyLineIndex).toBe(variables.length);

        // Variables should be sorted alphabetically
        expect([...variables].sort()).toEqual(variables);
      }
    }
  });
});
