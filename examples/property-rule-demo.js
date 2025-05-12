/**
 * Example file demonstrating CSS @property at-rule sorting and integration
 * with Old Fashioned CSS Property Sorter
 */

// Import the necessary functions for CSS processing
import { Rule, AtRule } from 'postcss';
import postcss from 'postcss';
import stylelint from 'stylelint';
import fs from 'fs';
import path from 'path';

// Sample CSS with @property rules in various positions
const sampleCSS = `
.container {
  /* Properties in different order */
  color: red;
  width: 100%;
  
  /* @property rule in the middle */
  @property --my-color {
    syntax: '<color>';
    initial-value: #c0ffee;
    inherits: false;
  }
  
  height: 200px;
  
  /* Use and forward directives */
  @use 'sass:math';
  @forward 'src/variables';
  
  margin: 20px;
  
  /* Another @property rule */
  @property --my-length {
    syntax: '<length>';
    initial-value: 10px;
    inherits: true;
  }
  
  padding: 10px;
  
  @include my-mixin();
  
  background: blue;
  
  .nested {
    /* A @property rule in a nested element */
    @property --nested-color {
      syntax: '<color>';
      initial-value: #333;
      inherits: false;
    }
    
    display: flex;
    
    @use 'sass:color';
    
    justify-content: center;
  }
}
`;

// Example demonstration of processing @property rules with the SCSS processor
async function demonstratePropertyProcessing() {
    console.log('Original CSS:');
    console.log('------------');
    console.log(sampleCSS);
    console.log('\n');

    // Process the CSS with the SCSS processor through stylelint
    const result = await stylelint.lint({
        code: sampleCSS,
        config: {
            plugins: ['../packages/stylelint-oldfashioned-order/src/index.js'],
            rules: {
                'plugin/old-fashioned': [
                    true,
                    {
                        strategy: 'grouped',
                        emptyLinesBetweenGroups: true
                    }
                ],
            }
        }
    });

    console.log('Processed CSS:');
    console.log('--------------');
    console.log(result.output);

    // Save the processed CSS to a file for inspection
    const outputDir = path.join(process.cwd(), 'test', 'scss');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'property-rule-sorted.scss');
    fs.writeFileSync(outputFile, result.output, 'utf8');

    console.log(`\nSorted CSS saved to ${outputFile}`);
    console.log('\nExpected order:');
    console.log('1. @use/@forward directives');
    console.log('2. @property rules');
    console.log('3. SCSS variables');
    console.log('4. SCSS mixins & includes');
    console.log('5. Regular CSS properties (sorted by strategy)');
    console.log('6. Nested rules');
}

// Run the demonstration
demonstratePropertyProcessing().catch(console.error);
