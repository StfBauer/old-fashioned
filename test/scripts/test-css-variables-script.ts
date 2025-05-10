import { sortProperties } from '../packages/shared/src/sorting';

// Example properties with CSS variables
const properties = [
  '--primary-color',
  '--secondary-color',
  '--spacing',
  'width',
  'height',
  'margin',
  'color'
];

console.log('Testing sorting with different strategies:');

['alphabetical', 'grouped', 'concentric', 'idiomatic'].forEach(strategy => {
  console.log(`\nStrategy: ${strategy}`);
  
  // Test both with emptyLinesBetweenGroups true and false
  [true, false].forEach(emptyLines => {
    const options = { 
      strategy, 
      emptyLinesBetweenGroups: emptyLines,
      sortPropertiesWithinGroups: true
    };
    
    const result = sortProperties(properties, options);
    
    console.log(`  Empty lines between groups: ${emptyLines}`);
    console.log('  Result:', result.sortedProperties);
    
    // Check for empty line after variables
    const varsEnd = result.sortedProperties.findIndex(p => p === '');
    const hasEmptyLineAfterVars = varsEnd === 3; // After 3 CSS variables
    console.log('  Has empty line after variables:', hasEmptyLineAfterVars);
  });
});
