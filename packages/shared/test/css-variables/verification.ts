/**
 * Utility for verifying CSS variable behavior across all strategies
 */
import { sortProperties } from '../../src/sorting';
import { SortingOptions } from '../../src/types';

/**
 * Test CSS variables ordering and empty line handling with different strategies
 * @param properties CSS properties to test with
 * @param options Additional sorting options
 * @returns Results for each strategy
 */
export function verifyCssVariables(properties: string[], options: Partial<SortingOptions> = {}) {
    const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];
    const results: Record<string, {
        sortedProperties: string[],
        cssVarCount: number,
        hasEmptyLineAfterVars: boolean,
        passes: boolean
    }> = {};

    for (const strategy of strategies) {
        const result = sortProperties(properties, {
            strategy: strategy as SortingOptions['strategy'],
            ...options
        });

        // Find CSS variables in the result
        const sortedProps = result.sortedProperties || [];
        const cssVars = sortedProps.filter(p => p.startsWith('--'));
        const cssVarCount = cssVars.length;

        let hasEmptyLineAfterVars = false;
        let passes = true;

        if (cssVarCount > 0) {
            const lineAfterVarsIndex = sortedProps.indexOf(cssVars[cssVarCount - 1]) + 1;
            hasEmptyLineAfterVars =
                lineAfterVarsIndex < sortedProps.length &&
                sortedProps[lineAfterVarsIndex] === '';

            passes = hasEmptyLineAfterVars;
        }

        results[strategy] = {
            sortedProperties: result.sortedProperties || [],
            cssVarCount,
            hasEmptyLineAfterVars,
            passes
        };
    }

    return results;
}

/**
 * Helper to run CSS variable tests and log formatted results
 * @param testCases Test cases with properties to check
 */
export function runCssVariableTests(testCases: Array<{ name: string, properties: string[] }>) {
    console.log("==== CSS Variables Empty Line Test ====\n");

    testCases.forEach(testCase => {
        console.log(`Test Case: ${testCase.name}`);
        console.log(`Original properties:`, testCase.properties);

        const emptyLinesSettings = [true, false];

        // Run each strategy with both empty line settings
        emptyLinesSettings.forEach(emptyLines => {
            const results = verifyCssVariables(testCase.properties, {
                emptyLinesBetweenGroups: emptyLines,
                sortPropertiesWithinGroups: true
            });

            // Log results
            Object.entries(results).forEach(([strategy, result]) => {
                console.log(`\n  Strategy: ${strategy}, Empty Lines Between Groups: ${emptyLines}`);
                console.log('  Resulting properties:', JSON.stringify(result.sortedProperties));
                console.log(`  CSS variables count: ${result.cssVarCount}`);
                console.log(`  Empty line after variables: ${result.hasEmptyLineAfterVars ? 'YES' : 'NO'}`);

                if (result.passes) {
                    console.log("  ✓ PASS: Empty line correctly added after CSS variables");
                } else {
                    console.log("  ✗ FAIL: Missing empty line after CSS variables");
                }
            });
        });

        console.log("\n-------------------------------------------\n");
    });
}
