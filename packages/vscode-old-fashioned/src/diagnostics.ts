/**
 * Diagnostics provider for Old Fashioned VS Code extension
 * 
 * This file handles diagnostics for CSS property ordering issues
 */

import * as vscode from 'vscode';
import * as stylelint from 'stylelint';
import { getParseSyntax, createDiagnosticFromWarning, isStyleDocument, getSortingOptions } from './utils';

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
            if (warning.rule && warning.rule.startsWith('plugin/oldschool-order')) {
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
  const options = getSortingOptions();

  // Determine the appropriate custom syntax based on the document type
  let customSyntax: string | undefined;
  if (syntax === 'scss') {
    customSyntax = 'postcss-scss';
  } else if (syntax === 'sass') {
    customSyntax = 'postcss-sass';
  }

  // Run Stylelint with our plugin
  return stylelint.lint({
    code: text,
    codeFilename: document.fileName,
    config: {
      plugins: ['stylelint-oldschool-order'],
      rules: {
        'plugin/oldschool-order': [
          true,
          options
        ]
      },
      customSyntax
    }
  });
}