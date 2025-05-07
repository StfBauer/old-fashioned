import * as fs from 'fs';
import { outputChannel } from './extension';
import { findBinary, ensurePackages } from './package-ensure';

// Define a proper interface for the stylelint options to include customSyntax
interface StylelintOptions {
  code: string;
  codeFilename: string;
  config: any;
  fix: boolean;
  customSyntax?: any; // Add this to fix the typing error
}

/**
 * Run stylelint directly without using exec
 */
export async function runStylelintDirect(
  inputFile: string,
  configFile: string,
  isSCSS: boolean
): Promise<string> {
  outputChannel.appendLine('Running stylelint directly');

  try {
    // Ensure stylelint packages are installed
    await ensurePackages([
      { name: 'stylelint', version: '^16.3.1' },
      { name: 'stylelint-order', version: '^6.0.4' },
      { name: 'postcss-scss', version: '^4.0.9' },
      { name: 'stylelint-scss', version: '^6.2.1' }
    ]);

    // Load modules directly rather than through NPX
    let stylelint;
    try {
      stylelint = require('stylelint');
    } catch (e) {
      outputChannel.appendLine(`Error importing stylelint: ${e}`);
      // Try a different approach using dynamic import
      const stylelintPath = findBinary('stylelint');
      if (!stylelintPath) {
        throw new Error('Could not find stylelint module');
      }
      const stylelintDir = stylelintPath.replace(/\/\.bin\/stylelint$/, '');
      stylelint = require(`${stylelintDir}/stylelint`);
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const fileContent = fs.readFileSync(inputFile, 'utf8');

    // Prepare options for stylelint with proper typing
    const options: StylelintOptions = {
      code: fileContent,
      codeFilename: inputFile,
      config,
      fix: true
    };

    // Add custom syntax for SCSS files
    if (isSCSS) {
      try {
        const syntax = require('postcss-scss');
        options.customSyntax = syntax; // Now TypeScript won't complain
      } catch (syntaxError) {
        outputChannel.appendLine(`Error loading postcss-scss: ${syntaxError}`);
        throw new Error(`Failed to load postcss-scss syntax: ${syntaxError}`);
      }
    }

    // Run stylelint
    const result = await stylelint.lint(options);

    if (result.output && result.output.length > 0) {
      return result.output;
    } else {
      // If no output is returned, return the original content
      return fileContent;
    }
  } catch (error) {
    outputChannel.appendLine(`Stylelint direct error: ${error}`);
    throw error;
  }
}
