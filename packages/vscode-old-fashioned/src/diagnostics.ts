/**
 * Diagnostics for Old Fashioned CSS sorting
 */

import * as vscode from 'vscode';
import * as stylelint from 'stylelint';
import { isStyleDocument, createDiagnosticFromWarning, getParseSyntax, getSortingOptions } from './utils';

/**
 * Manages CSS property sorting diagnostics
 */
export class CssDiagnostics {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('old-fashioned');
    this.disposables.push(this.diagnosticCollection);

    // Setup listeners for document changes
    this.disposables.push(vscode.workspace.onDidOpenTextDocument(this.validateDocument, this));
    this.disposables.push(vscode.workspace.onDidChangeTextDocument((event) => this.validateDocument(event.document), this));
    this.disposables.push(vscode.workspace.onDidSaveTextDocument(this.validateDocument, this));

    // Validate all open CSS/SCSS documents
    vscode.workspace.textDocuments.forEach(this.validateDocument, this);
  }

  /**
   * Validate a document and update diagnostics
   * 
   * @param document - The document to validate
   */
  private async validateDocument(document: vscode.TextDocument): Promise<void> {
    // Only run on CSS, SCSS, or SASS files
    if (!isStyleDocument(document)) {
      this.diagnosticCollection.delete(document.uri);
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
        this.diagnosticCollection.set(document.uri, diagnostics);
      } else {
        // Clear diagnostics if no issues were found
        this.diagnosticCollection.delete(document.uri);
      }
    } catch (error) {
      // Replace console.error with VS Code API
      vscode.window.showErrorMessage(`Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
      // Clear diagnostics on error
      this.diagnosticCollection.delete(document.uri);
    }
  }

  /**
   * Dispose the diagnostics manager
   */
  public dispose() {
    this.disposables.forEach(disposable => disposable.dispose());
    this.diagnosticCollection.dispose();
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