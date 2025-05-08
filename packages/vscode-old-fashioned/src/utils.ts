/**
 * Utility functions for the Old Fashioned VS Code extension
 */

import * as vscode from 'vscode';
import { SortingOptions, SortingStrategy } from '@old-fashioned/shared';

/**
 * Interface for CSS formatting options
 */
export interface FormattingOptions {
  alwaysSemicolon: boolean;
  colorCase: 'lower' | 'upper';
  blockIndent: string;
  colorShorthand: boolean;
  elementCase: 'lower' | 'upper';
  leadingZero: boolean;
  quotes: 'double' | 'single';
  sortOrderFallback: 'abc' | 'none';
  spaceBeforeColon: string;
  spaceAfterColon: string;
  spaceBeforeCombinator: string;
  spaceAfterCombinator: string;
  spaceBetweenDeclarations: string;
  spaceBeforeOpeningBrace: string;
  spaceAfterOpeningBrace: string;
  spaceAfterSelectorDelimiter: string;
  spaceBeforeSelectorDelimiter: string;
  spaceBeforeClosingBrace: string;
  stripSpaces: boolean;
  tabSize: boolean;
  unitlessZero: boolean;
  vendorPrefixAlign: boolean;
}

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
 * Gets formatting options from VS Code configuration
 * 
 * @returns The formatting options from VS Code settings
 */
export function getFormattingOptions(): FormattingOptions {
  const config = vscode.workspace.getConfiguration('oldFashioned');
  console.log('Accessed oldFashioned configuration:', config);
  
  // Log a specific setting to see if it's accessible
  const alwaysSemicolon = config.get<boolean>('alwaysSemicolon', true);
  console.log('alwaysSemicolon setting:', alwaysSemicolon);
  
  return {
    alwaysSemicolon: config.get<boolean>('alwaysSemicolon', true),
    colorCase: config.get<'lower' | 'upper'>('colorCase', 'lower'),
    blockIndent: config.get<string>('blockIndent', '\t'),
    colorShorthand: config.get<boolean>('colorShorthand', true),
    elementCase: config.get<'lower' | 'upper'>('elementCase', 'lower'),
    leadingZero: config.get<boolean>('leadingZero', false),
    quotes: config.get<'double' | 'single'>('quotes', 'double'),
    sortOrderFallback: config.get<'abc' | 'none'>('sortOrderFallback', 'abc'),
    spaceBeforeColon: config.get<string>('spaceBeforeColon', ''),
    spaceAfterColon: config.get<string>('spaceAfterColon', ' '),
    spaceBeforeCombinator: config.get<string>('spaceBeforeCombinator', ' '),
    spaceAfterCombinator: config.get<string>('spaceAfterCombinator', ' '),
    spaceBetweenDeclarations: config.get<string>('spaceBetweenDeclarations', '\n'),
    spaceBeforeOpeningBrace: config.get<string>('spaceBeforeOpeningBrace', ''),
    spaceAfterOpeningBrace: config.get<string>('spaceAfterOpeningBrace', '\n'),
    spaceAfterSelectorDelimiter: config.get<string>('spaceAfterSelectorDelimiter', '\n'),
    spaceBeforeSelectorDelimiter: config.get<string>('spaceBeforeSelectorDelimiter', ''),
    spaceBeforeClosingBrace: config.get<string>('spaceBeforeClosingBrace', '\n'),
    stripSpaces: config.get<boolean>('stripSpaces', true),
    tabSize: config.get<boolean>('tabSize', true),
    unitlessZero: config.get<boolean>('unitlessZero', true),
    vendorPrefixAlign: config.get<boolean>('vendorPrefixAlign', true)
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