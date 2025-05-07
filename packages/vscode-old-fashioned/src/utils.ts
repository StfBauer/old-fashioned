/**
 * Utility functions for Old Fashioned
 */

import * as vscode from 'vscode';

/**
 * Gets sorting options from VS Code configuration
 */
export function getSortingOptions(): any {
  const config = vscode.workspace.getConfiguration('oldFashioned');

  return {
    strategy: config.get<SortingStrategy>('sortingStrategy', 'grouped'),
    emptyLinesBetweenGroups: config.get<boolean>('emptyLinesBetweenGroups', true),
    sortPropertiesWithinGroups: config.get<boolean>('sortPropertiesWithinGroups', true)
  };
}

/**
 * Determines the appropriate syntax for parsing
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
 * Creates a VS Code diagnostic from a Stylelint warning
 */
export function createDiagnosticFromWarning(
  warning: { line: number; column: number; text: string; rule: string; severity: string },
  document: vscode.TextDocument
): vscode.Diagnostic {
  const range = new vscode.Range(
    new vscode.Position(warning.line - 1, warning.column - 1),
    new vscode.Position(warning.line - 1, warning.column)
  );

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
 */
export function isStyleDocument(document: vscode.TextDocument): boolean {
  return ['css', 'scss', 'sass'].includes(document.languageId);
}