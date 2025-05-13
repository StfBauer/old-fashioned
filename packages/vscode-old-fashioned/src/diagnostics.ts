/**
 * Diagnostics provider for Old Fashioned VS Code extension
 * 
 * This file handles diagnostics for CSS property ordering issues
 */

import * as vscode from 'vscode';
import * as stylelint from 'stylelint';
import * as path from 'path';
import { getParseSyntax, createDiagnosticFromWarning, isStyleDocument, getSortingOptions, getFormattingOptions } from './utils';

/**
 * Interface for Stylelint warning object
 */
interface StylelintWarning {
  line: number;
  column: number;
  rule: string;
  severity: string;
  text: string;
}

/**
 * Interface for Stylelint result object
 */
interface StylelintResultItem {
  source: string;
  warnings: StylelintWarning[];
  errored?: boolean;
  deprecations?: { text: string; reference: string }[];
  invalidOptionWarnings?: { text: string }[];
}

/**
 * Interface for Stylelint configuration
 */
interface StylelintConfig {
  plugins: string[];
  rules: Record<string, any>;
  customSyntax?: string;
}

// Create a diagnostics collection for property order issues
const diagnosticsCollection = vscode.languages.createDiagnosticCollection('old-fashioned');

/**
 * Activate the diagnostics provider
 * 
 * @param context - The VS Code extension context
 * @returns Array of disposable resources
 */
export function activateDiagnostics(context: vscode.ExtensionContext): vscode.Disposable[] {
  const subscriptions: vscode.Disposable[] = [];

  // Register event handlers
  const didOpenTextDocument = vscode.workspace.onDidOpenTextDocument(document => {
    if (isStyleDocument(document)) {
      updateDiagnostics(document);
    }
  });

  const didChangeTextDocument = vscode.workspace.onDidChangeTextDocument(event => {
    // Throttle updates on change to avoid too frequent linting
    if (isStyleDocument(event.document)) {
      const documentUri = event.document.uri.toString();

      // Clear previous timer if it exists
      if (changeTimers.has(documentUri)) {
        clearTimeout(changeTimers.get(documentUri));
      }

      // Set a new timer
      const timerId = setTimeout(() => {
        updateDiagnostics(event.document);
        changeTimers.delete(documentUri);
      }, 500);

      changeTimers.set(documentUri, timerId);
    }
  });

  const didSaveTextDocument = vscode.workspace.onDidSaveTextDocument(document => {
    if (isStyleDocument(document)) {
      updateDiagnostics(document);
    }
  });

  const didCloseTextDocument = vscode.workspace.onDidCloseTextDocument(document => {
    diagnosticsCollection.delete(document.uri);

    // Clear any timers for this document
    const documentUri = document.uri.toString();
    if (changeTimers.has(documentUri)) {
      clearTimeout(changeTimers.get(documentUri));
      changeTimers.delete(documentUri);
    }
  });

  // Process already open documents
  vscode.workspace.textDocuments.forEach(document => {
    if (isStyleDocument(document)) {
      updateDiagnostics(document);
    }
  });

  // Map to store timers for document changes
  const changeTimers = new Map<string, NodeJS.Timeout>();

  // Add all disposables
  subscriptions.push(
    didOpenTextDocument,
    didChangeTextDocument,
    didSaveTextDocument,
    didCloseTextDocument,
    diagnosticsCollection,
    // Dispose function to clear all timers
    {
      dispose: () => {
        for (const [, timer] of changeTimers) {
          clearTimeout(timer);
        }
        changeTimers.clear();
      }
    }
  );

  return subscriptions;
}

/**
 * Update diagnostics for a document
 * 
 * @param document - The document to update diagnostics for
 */
async function updateDiagnostics(document: vscode.TextDocument): Promise<void> {
  // Only run on CSS, SCSS, or SASS files
  if (!isStyleDocument(document)) {
    diagnosticsCollection.delete(document.uri);
    return;
  }

  try {
    // Run Stylelint on the document
    const text = document.getText();
    const result = await lintDocument(document, text);

    if (result && result.results && result.results.length > 0) {
      const diagnostics: vscode.Diagnostic[] = [];

      // Create diagnostics for each warning or error
      for (const styleResult of result.results) {
        if (styleResult.warnings && styleResult.warnings.length > 0) {
          for (const warning of styleResult.warnings) {
            // Check if warning is from our plugin
            if (warning.rule && warning.rule.startsWith('plugin/oldfashioned-order')) {
              // Create a diagnostic and add it to the collection
              const diagnostic = createDiagnosticFromWarning(warning, document);
              diagnostics.push(diagnostic);
            }
          }
        }
      }

      // Update the diagnostics collection
      diagnosticsCollection.set(document.uri, diagnostics);
    } else {
      // Clear diagnostics if no issues were found
      diagnosticsCollection.delete(document.uri);
    }
  } catch (error) {
    // Replace console.error with VS Code API
    vscode.window.showErrorMessage(`Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
    // Clear diagnostics on error
    diagnosticsCollection.delete(document.uri);
  }
}

/**
 * Lint a document with Stylelint
 * 
 * @param document - The document to lint
 * @param text - The text to lint
 * @returns The Stylelint linter result
 */
async function lintDocument(document: vscode.TextDocument, text: string): Promise<stylelint.LinterResult> {
  // Get the document syntax (css, scss, sass)
  const syntax = getParseSyntax(document.languageId);

  // Get configuration from user settings
  const sortingOptions = getSortingOptions();
  const formattingOptions = getFormattingOptions();

  // Determine the appropriate custom syntax based on the document type
  let customSyntax: string | undefined;
  if (syntax === 'scss') {
    customSyntax = 'postcss-scss';
  } else if (syntax === 'sass') {
    customSyntax = 'postcss-sass';
  }

  // Create combined options for the stylelint plugin
  const combinedOptions = {
    ...sortingOptions,
    // Add formatting options
    'always-semicolon': formattingOptions.alwaysSemicolon,
    'color-case': formattingOptions.colorCase,
    'block-indent': formattingOptions.blockIndent,
    'color-shorthand': formattingOptions.colorShorthand,
    'element-case': formattingOptions.elementCase,
    'leading-zero': formattingOptions.leadingZero,
    'quotes': formattingOptions.quotes,
    'sort-order-fallback': formattingOptions.sortOrderFallback,
    'space-before-colon': formattingOptions.spaceBeforeColon,
    'space-after-colon': formattingOptions.spaceAfterColon,
    'space-before-combinator': formattingOptions.spaceBeforeCombinator,
    'space-after-combinator': formattingOptions.spaceAfterCombinator,
    'space-between-declarations': formattingOptions.spaceBetweenDeclarations,
    'space-before-opening-brace': formattingOptions.spaceBeforeOpeningBrace,
    'space-after-opening-brace': formattingOptions.spaceAfterOpeningBrace,
    'space-after-selector-delimiter': formattingOptions.spaceAfterSelectorDelimiter,
    'space-before-selector-delimiter': formattingOptions.spaceBeforeSelectorDelimiter,
    'space-before-closing-brace': formattingOptions.spaceBeforeClosingBrace,
    'strip-spaces': formattingOptions.stripSpaces,
    'tab-size': formattingOptions.tabSize,
    'unitless-zero': formattingOptions.unitlessZero,
    'vendor-prefix-align': formattingOptions.vendorPrefixAlign
  };

  // Get the extension path for configBasedir
  const extensionPath = vscode.extensions.getExtension('n8design.vscode-old-fashioned')?.extensionPath || __dirname;
  // For development environments, try to use the local workspace path
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const isDevelopment = extensionPath.includes('old-fashioned/packages/vscode-old-fashioned');

  // Determine the best configBasedir to find the plugin
  let configBasedir = extensionPath;

  // In development, we want to use the workspace root
  if (isDevelopment && workspaceFolders && workspaceFolders.length > 0) {
    // Go up two directories from extension path to get to workspace root
    configBasedir = path.resolve(extensionPath, '../..');
    console.log('Using development workspace path:', configBasedir);
  }

  try {
    console.log('Running stylelint with configBasedir:', configBasedir);

    // In development, the plugin might be in the workspace node_modules
    // In production, the plugin should be bundled with the extension
    return stylelint.lint({
      code: text,
      codeFilename: document.fileName,
      config: {
        plugins: ['stylelint-oldfashioned-order'],
        rules: {
          'plugin/oldfashioned-order': [
            true,
            combinedOptions
          ]
        },
        customSyntax
      },
      // This is the key setting that helps stylelint locate the plugin
      configBasedir: configBasedir
    });
  } catch (err) {
    console.error('Error initializing stylelint:', err);
    throw err;
  }
}