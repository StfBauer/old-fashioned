// Simple script to test CSS variables empty line
const fs = require('fs');
const path = require('path');
const { sortProperties } = require('./packages/shared/src/sorting');

// Read the test file
const cssContent = fs.readFileSync('./test-empty-line.css', 'utf8');

// Extract the property names (simple implementation for testing)
const propertyRegex = /^\s*([\w-]+)\s*:/gm;
const properties = [];
let match;
while ((match = propertyRegex.exec(cssContent)) !== null) {
    properties.push(match[1]);
}

console.log('Original properties:', properties);

// Test with different sorting strategies
['alphabetical', 'grouped', 'concentric', 'idiomatic'].forEach(strategy => {
    console.log(`\nStrategy: ${strategy}`);
    
    const result = sortProperties(properties, { 
        strategy, 
        emptyLinesBetweenGroups: false 
    });
    
    console.log('Sorted properties:');
    console.log(result.sortedProperties);
    
    // Extract CSS variables and check for empty line
    const cssVars = result.sortedProperties.filter(p => p.startsWith('--'));
    const firstNonVar = result.sortedProperties.findIndex(p => !p.startsWith('--') && p !== '');
    
    if (firstNonVar > 0) {
        console.log(`CSS variables: ${cssVars.length}, First non-var index: ${firstNonVar}`);
        console.log(`Empty line after variables: ${result.sortedProperties[cssVars.length] === ''}`);
    }
});
