/**
 * Diagnostics provider for Old Fashioned CSS Sorter
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import {
  getParseSyntax,
  createDiagnosticFromWarning,
  isStyleDocument,
  getSortingOptions
} from './utils';
import { outputChannel } from './extension';

// Create a diagnostics collection
const diagnosticCollection = vscode.languages.createDiagnosticCollection('oldFashioned');

/**
 * Define the interface for stylelint lint options
 */
interface StylelintLintOptions {
  code: string;
  codeFilename: string | undefined;
  config: {
    plugins: string[];
    rules: Record<string, any>;
  };
  customSyntax?: any;
}

/**
 * Provide diagnostics for CSS files
 */
export async function provideDiagnostics(document: vscode.TextDocument): Promise<void> {
  // Only process CSS/SCSS files
  if (!isStyleDocument(document)) {
    return;
  }

  try {
    const lintResults = await lintDocument(document);

    if (lintResults && lintResults.warnings) {
      const diagnostics = lintResults.warnings.map(warning =>
        createDiagnosticFromWarning(warning)
      );

      diagnosticCollection.set(document.uri, diagnostics);
    } else {
      diagnosticCollection.set(document.uri, []);
    }
  } catch (error) {
    console.error('Error providing diagnostics:', error);
    outputChannel.appendLine(`Diagnostics error: ${error}`);
    diagnosticCollection.set(document.uri, []);
  }
}

/**
 * Lint document using stylelint
 */
async function lintDocument(document: vscode.TextDocument): Promise<any> {
  const content = document.getText();
  const options = getSortingOptions();
  const syntax = getParseSyntax(document);

  try {
    // Try using stylelint directly
    const stylelint = require('stylelint');

    const lintOptions: StylelintLintOptions = {
      code: content,
      codeFilename: document.fileName,
      config: {
        plugins: ["stylelint-order"],
        rules: {
          "order/properties-order": [] // We're just checking for errors, not sorting
        }
      }
    };

    if (syntax) {
      lintOptions.customSyntax = syntax;
    }

    const result = await stylelint.lint(lintOptions);
    return result;
  } catch (error) {
    outputChannel.appendLine(`Linting error: ${error}`);
    console.error('Error linting document:', error);
    return { warnings: [] };
  }
}

/**
 * Initialize diagnostics
 */
export function initDiagnostics(context: vscode.ExtensionContext): void {
  // Register diagnostics collection
  context.subscriptions.push(diagnosticCollection);

  // Watch for document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      provideDiagnostics(event.document);
    })
  );

  // Watch for document opening
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      provideDiagnostics(document);
    })
  );

  // Process currently open document
  if (vscode.window.activeTextEditor) {
    provideDiagnostics(vscode.window.activeTextEditor.document);
  }
}