/**
 * Test script for CSS variables with empty line
 * Converted from JavaScript to TypeScript
 */
import * as fs from 'fs';
import * as path from 'path';
import { sortProperties } from '../../packages/shared/src/sorting';
import type { SortingOptions } from '../../packages/shared/src/types';

interface TestCase {
    name: string;
    properties: string[];
    expectedEmptyLinePosition?: number;
}

// Test properties with CSS variables
const testCases: TestCase[] = [
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
        ],
        expectedEmptyLinePosition: 3 // After the three CSS variables
    },
    {
        name: "Only variables",
        properties: [
            '--primary-color',
            '--secondary-color',
            '--spacing'
        ],
        expectedEmptyLinePosition: undefined // No empty line expected
    },
    {
        name: "Only properties",
        properties: [
            'width',
            'height',
            'margin',
            'color'
        ],
        expectedEmptyLinePosition: undefined // No empty line expected
    },
    {
        name: "Mixed order",
        properties: [
            'width',
            '--primary-color',
            'height',
            '--secondary-color',
            'margin',
            '--spacing',
            'color'
        ],
        expectedEmptyLinePosition: 3 // After the three CSS variables are grouped
    }
];

// Test with different strategies
const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;

console.log('========== CSS Variables Empty Line Tests ==========');

// Run each test case with each strategy
for (const testCase of testCases) {
    console.log(`\n## Test Case: ${testCase.name}`);

    for (const strategy of strategies) {
        const options: SortingOptions = {
            strategy,
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        const result = sortProperties(testCase.properties, options);

        if (!result.success || !result.sortedProperties) {
            console.log(`❌ Strategy ${strategy}: Failed to sort`);
            continue;
        }

        // Find the empty line
        const emptyLineIndex = result.sortedProperties.findIndex(p => p === '');

        // Detect variables in the sorted output
        const variablesCount = result.sortedProperties.filter(p => p.startsWith('--')).length;

        console.log(`Strategy ${strategy}:`);
        console.log(`  Variables count: ${variablesCount}`);
        console.log(`  Empty line index: ${emptyLineIndex === -1 ? 'not found' : emptyLineIndex}`);
        console.log(`  Expected empty line index: ${testCase.expectedEmptyLinePosition === undefined ? 'not expected' : testCase.expectedEmptyLinePosition}`);

        // Check if the empty line is at the expected position
        if (testCase.expectedEmptyLinePosition !== undefined) {
            if (emptyLineIndex === testCase.expectedEmptyLinePosition) {
                console.log(`✅ Strategy ${strategy}: Empty line correctly placed at index ${emptyLineIndex}`);
            } else {
                console.log(`❌ Strategy ${strategy}: Empty line misplaced. Expected at ${testCase.expectedEmptyLinePosition}, got ${emptyLineIndex}`);
            }
        } else {
            // No empty line expected
            if (emptyLineIndex === -1) {
                console.log(`✅ Strategy ${strategy}: Correctly has no empty line`);
            } else {
                console.log(`❌ Strategy ${strategy}: Unexpected empty line at index ${emptyLineIndex}`);
            }
        }

        // Log the full result for verification
        console.log(`  Sorted properties: [${result.sortedProperties.map(p => p === '' ? '""' : p).join(', ')}]`);
    }
}

console.log('\n========== Tests Complete ==========');
