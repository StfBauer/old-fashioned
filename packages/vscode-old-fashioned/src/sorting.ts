/**
 * CSS sorting implementation for the VS Code extension
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import {
  getParseSyntax,
  getSortingOptions,
  getPropertyGroups
} from './utils';
import { outputChannel } from './extension';

const execAsync = promisify(exec);

/**
 * StylelintOptions type definition
 */
interface StylelintOptions {
  code: string;
  codeFilename: string;
  config: Record<string, any>;
  fix: boolean;
  customSyntax?: any;
}

/**
 * Sort CSS properties in the current document
 */
export async function sortCssProperties(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
  try {
    // Get user settings
    const settings = getSortingOptions();

    // Output settings for debugging
    outputChannel.appendLine(`Applying sorting strategy: ${settings.strategy}`);

    // Get document content
    let content = document.getText();
    const isScss = document.languageId === 'scss' ||
      (document.fileName ? document.fileName.endsWith('.scss') : false);

    // For SCSS files, pre-process to ensure directives are at the top
    if (isScss && settings.processSassDirectives) {
      content = preprocessScssContent(content);
    }

    // Create a temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create temporary files
    const timestamp = Date.now();
    const tempFile = path.join(tempDir, `temp-${timestamp}.${document.languageId}`);
    const configFile = path.join(tempDir, `.stylelintrc-${timestamp}.json`);

    // Build the stylelint configuration based on user settings
    const stylelintConfig: Record<string, any> = {
      "plugins": ["stylelint-order"],
      "rules": {
        "order/properties-order": generatePropertyOrder(settings.strategy)
      }
    };

    // Add SCSS-specific config if needed
    if (isScss) {
      Object.assign(stylelintConfig, { "plugins": [...stylelintConfig.plugins, "stylelint-scss"] });
    } else {
      stylelintConfig.plugins = [...stylelintConfig.plugins];
    }

    // Write temporary files
    fs.writeFileSync(tempFile, content);
    fs.writeFileSync(configFile, JSON.stringify(stylelintConfig));

    try {
      // Process with stylelint
      outputChannel.appendLine(`Processing file with stylelint...`);
      let sortedContent: string;

      try {
        // Try running stylelint directly
        const stylelint = require('stylelint');
        const options: StylelintOptions = {
          code: content,
          codeFilename: document.fileName || (isScss ? 'file.scss' : 'file.css'),
          config: stylelintConfig,
          fix: true
        };

        // Add custom syntax for SCSS files
        if (isScss) {
          const syntax = getParseSyntax(document);
          if (syntax) {
            options.customSyntax = syntax;
          }
        }

        const result = await stylelint.lint(options);
        sortedContent = result.output || content;
      } catch (directError) {
        // Fall back to command line approach
        outputChannel.appendLine(`Direct approach failed: ${directError}`);
        sortedContent = await runStylelintCommand(tempFile, configFile, isScss);
      }

      // Apply the changes if content was changed
      if (sortedContent && sortedContent !== document.getText()) {
        const fullRange = new vscode.Range(
          new vscode.Position(0, 0),
          document.lineAt(document.lineCount - 1).range.end
        );

        return [vscode.TextEdit.replace(fullRange, sortedContent)];
      }
    } catch (error) {
      handleSortingError(error);
    } finally {
      // Clean up
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
      } catch (e) {
        // Silently ignore cleanup errors
      }
    }

    return [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Error sorting CSS properties: ${errorMessage}`);
    return [];
  }
}

/**
 * Pre-process SCSS content to handle directives
 */
function preprocessScssContent(content: string): string {
  // Extract all directive statements
  const useRegex = /@(use|forward|import)\s+(['"])([^'"]+)(['"])\s*;?/g;
  const directives: string[] = [];

  // Remove directives and save them
  const contentWithoutDirectives = content.replace(useRegex, (match) => {
    directives.push(match.endsWith(';') ? match : match + ';');
    return '';
  });

  // Clean the content
  const cleanContent = contentWithoutDirectives
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .trim();

  // Combine directives at the top + remaining content
  return directives.join('\n') + (directives.length ? '\n\n' : '') + cleanContent;
}

/**
 * Generate the property order array based on the selected strategy
 */
export function generatePropertyOrder(strategy: string): any {
  // Get property groups for the selected strategy
  const propertyGroups = getPropertyGroups(strategy);

  // For alphabetical sorting, we need special handling
  if (strategy === 'alphabetical') {
    return [{ alphabetical: true }];
  }

  // For other strategies, transform the groups into stylelint-compatible format
  return propertyGroups.map(group => ({ properties: group }));
}

/**
 * Run stylelint via command line
 */
async function runStylelintCommand(tempFile: string, configFile: string, isScss: boolean): Promise<string> {
  // Find stylelint binary
  const extensionPath = path.dirname(path.dirname(__dirname));

  const possibleStylelintPaths = [
    path.join(extensionPath, 'node_modules', '.bin', 'stylelint'),
    path.join(extensionPath, '..', 'node_modules', '.bin', 'stylelint'),
    path.join(extensionPath, '..', '..', 'node_modules', '.bin', 'stylelint'),
    'stylelint' // fallback to global stylelint if available
  ];

  let stylelintPath = '';
  for (const binPath of possibleStylelintPaths) {
    if (fs.existsSync(binPath)) {
      stylelintPath = binPath;
      outputChannel.appendLine(`Found stylelint at: ${stylelintPath}`);
      break;
    }
  }

  if (!stylelintPath) {
    throw new Error('Could not find stylelint. Please install stylelint globally or in your workspace.');
  }

  // Run stylelint command
  const env = {
    ...process.env,
    NODE_PATH: `${extensionPath}/node_modules:${process.env.NODE_PATH || ''}`
  };

  const syntaxFlag = isScss ? '--custom-syntax=postcss-scss' : '';
  const cmd = `"${stylelintPath}" "${tempFile}" --fix --config "${configFile}" ${syntaxFlag}`;

  outputChannel.appendLine(`Running command: ${cmd}`);
  await execAsync(cmd, { env, timeout: 30000 });
  return fs.readFileSync(tempFile, 'utf8');
}

/**
 * Handle sorting errors
 */
function handleSortingError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Stylelint error: ${error.message}`);
    if (error.stack) console.error(error.stack);
  } else {
    console.error('Stylelint unknown error:', error);
  }

  vscode.window.showErrorMessage(`CSS sorting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}