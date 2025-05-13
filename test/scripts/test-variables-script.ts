/**
 * Simple script to test CSS variables empty line
 * Converted from JavaScript to TypeScript
 */
import * as fs from 'fs';
import * as path from 'path';
import { sortProperties } from '../../packages/shared/src/sorting';
import type { SortingOptions } from '../../packages/shared/src/types';

// Read the test file
const cssContent = fs.readFileSync(path.join(__dirname, '../css-variables/test-empty-line.css'), 'utf8');

// Extract the property names (simple implementation for testing)
const propertyRegex = /^\s*([\w-]+)\s*:/gm;
const properties: string[] = [];
let match: RegExpExecArray | null;
while ((match = propertyRegex.exec(cssContent)) !== null) {
    properties.push(match[1]);
}

console.log('Extracted properties:', properties);

// Test with different sorting strategies
const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'] as const;
for (const strategy of strategies) {
    const options: SortingOptions = {
        strategy,
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: true
    };

    const result = sortProperties(properties, options);

    console.log(`\nStrategy: ${strategy}`);
    console.log('Sorted properties:', result.sortedProperties);

    // Check for empty line between CSS variables and regular properties
    if (result.sortedProperties) {
        const emptyLineIndex = result.sortedProperties.findIndex(p => p === '');
        if (emptyLineIndex >= 0) {
            console.log(`Empty line found at index ${emptyLineIndex}`);
            console.log(`Properties before empty line: ${result.sortedProperties.slice(0, emptyLineIndex).join(', ')}`);
            console.log(`Properties after empty line: ${result.sortedProperties.slice(emptyLineIndex + 1).join(', ')}`);
        } else {
            console.log('No empty line found');
        }
    }
}
