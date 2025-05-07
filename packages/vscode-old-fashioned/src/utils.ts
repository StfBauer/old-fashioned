/**
 * Utility functions for the Old Fashioned VS Code extension
 */

import * as vscode from 'vscode';
import { SortingOptions, SortingStrategy } from '@old-fashioned/shared';

/**
 * Determines the appropriate syntax for parsing based on the language ID
 * 
 * @param languageId - The VS Code language ID
 * @returns The syntax name for Stylelint/PostCSS
 */
export function getParseSyntax(languageId: string): string {
  switch (languageId) {
    case 'scss':
      return 'scss';
    case 'sass':
      return 'sass';
    case 'css':
    default:
      return 'css';
  }
}

/**
 * Gets sorting options from VS Code configuration
 * 
 * @returns The sorting options from VS Code settings
 */
export function getSortingOptions(): SortingOptions {
  const config = vscode.workspace.getConfiguration('oldFashioned');
  
  return {
    strategy: config.get<SortingStrategy>('sortingStrategy', 'grouped'),
    emptyLinesBetweenGroups: config.get<boolean>('emptyLinesBetweenGroups', true),
    sortPropertiesWithinGroups: config.get<boolean>('sortPropertiesWithinGroups', true)
  };
}

/**
 * Creates a VS Code diagnostic from a Stylelint warning
 * 
 * @param warning - The Stylelint warning object
 * @param document - The document containing the warning
 * @returns A VS Code diagnostic
 */
export function createDiagnosticFromWarning(
  warning: { line: number; column: number; text: string; rule: string; severity: string },
  document: vscode.TextDocument
): vscode.Diagnostic {
  // Convert line and column to zero-based
  const line = Math.max(0, warning.line - 1);
  const column = Math.max(0, warning.column - 1);
  
  // Find the range of the property or rule that has the issue
  let endColumn = column;
  
  try {
    const lineText = document.lineAt(line).text;
    endColumn = lineText.length;
    
    // Try to find the end of the property name
    const colonIndex = lineText.indexOf(':', column);
    if (colonIndex > column) {
      endColumn = colonIndex;
    }
  } catch (error) {
    console.error('Error determining diagnostic range:', error);
  }
  
  const range = new vscode.Range(line, column, line, endColumn);
  
  // Create and return the diagnostic
  const diagnostic = new vscode.Diagnostic(
    range,
    warning.text,
    warning.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
  );
  
  diagnostic.source = 'old-fashioned';
  diagnostic.code = warning.rule;
  
  return diagnostic;
}

/**
 * Checks if a document is a style document (CSS, SCSS, SASS)
 * 
 * @param document - The document to check
 * @returns True if the document is a style document
 */
export function isStyleDocument(document: vscode.TextDocument): boolean {
  return ['css', 'scss', 'sass'].includes(document.languageId);
}