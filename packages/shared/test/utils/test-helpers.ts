/**
 * Test helper utilities for CSS property ordering tests
 */

import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

/**
 * Run sorting with different strategies and return results
 * @param properties Properties to sort
 * @param options Additional sorting options
 * @returns Object with results for each strategy
 */
export function testWithAllStrategies(properties: string[], options: Partial<SortingOptions> = {}) {
    const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];
    const results: Record<string, ReturnType<typeof sortProperties>> = {};

    for (const strategy of strategies) {
        results[strategy] = sortProperties(properties, {
            ...options,
            strategy: strategy as SortingOptions['strategy']
        });
    }

    return results;
}

/**
 * Helper to verify CSS variables are correctly separated with an empty line
 * @param sortedProperties The sorted properties array
 * @returns Whether CSS variables are correctly separated
 */
export function verifyCssVariableSeparation(sortedProperties: string[]): boolean {
    const cssVars = sortedProperties.filter(p => p.startsWith('--'));
    if (cssVars.length === 0) return true;

    const lastVarIndex = sortedProperties.lastIndexOf(cssVars[cssVars.length - 1]);
    const hasEmptyLineAfterVars =
        lastVarIndex < sortedProperties.length - 1 &&
        sortedProperties[lastVarIndex + 1] === '';

    return hasEmptyLineAfterVars;
}
