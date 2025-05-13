// Test script for CSS variables with empty line
const fs = require('fs');
const path = require('path');

// Import the shared package (ES module style)
const { sortProperties } = require('./packages/shared/dist/sorting');

// Test properties with CSS variables
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

// Test with each strategy and empty lines setting
const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];
const emptyLinesSettings = [true, false];

// Run tests and log results
console.log("==== CSS Variables Empty Line Test ====\n");

testCases.forEach(testCase => {
  console.log(`Test Case: ${testCase.name}`);
  console.log(`Original properties:`, testCase.properties);
  
  strategies.forEach(strategy => {
    emptyLinesSettings.forEach(emptyLines => {
      console.log(`\n  Strategy: ${strategy}, Empty Lines Between Groups: ${emptyLines}`);
      
      const result = sortProperties(testCase.properties, { 
        strategy,
        emptyLinesBetweenGroups: emptyLines,
        sortPropertiesWithinGroups: true
      });
      
      console.log('  Resulting properties:', JSON.stringify(result.sortedProperties));
      
      // Find CSS variables in the result
      const cssVars = result.sortedProperties.filter(p => p.startsWith('--'));
      if (cssVars.length > 0) {
        const lineAfterVarsIndex = cssVars.length;
        const hasEmptyLineAfterVars = 
          lineAfterVarsIndex < result.sortedProperties.length && 
          result.sortedProperties[lineAfterVarsIndex] === '';
        
        console.log(`  CSS variables count: ${cssVars.length}`);
        console.log(`  Empty line after variables: ${hasEmptyLineAfterVars ? 'YES' : 'NO'}`);
        
        // Report if the test passes or fails
        if (hasEmptyLineAfterVars) {
          console.log("  ✓ PASS: Empty line correctly added after CSS variables");
        } else {
          console.log("  ✗ FAIL: Missing empty line after CSS variables");
        }
      }
    });
  });
  
  console.log("\n-------------------------------------------\n");
});
