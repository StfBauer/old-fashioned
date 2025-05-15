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
 * Get the sorting options from VSCode settings
 * 
 * @returns The sorting options
 */
export function getSortingOptions(): SortingOptions {
  const config = vscode.workspace.getConfiguration('oldFashioned');

  // Get strategy with explicit path and detailed logging
  const strategyRaw = config.get<string>('sorting.strategy');
  console.log('Raw strategy from config:', strategyRaw);

  // Valid strategies now exclude 'grouped' and 'custom'
  const validStrategies = ['alphabetical', 'concentric', 'idiomatic'];
  const validStrategy = validStrategies.includes(strategyRaw || '')
    ? strategyRaw
    : 'alphabetical'; // Default to alphabetical if not valid

  console.log(`Using sorting strategy: ${validStrategy}`);

  // Get other options
  const emptyLinesBetweenGroups = config.get<boolean>('sorting.emptyLinesBetweenGroups', true);
  const sortPropertiesWithinGroups = config.get<boolean>('sorting.sortPropertiesWithinGroups', true);

  return {
    strategy: validStrategy as SortingStrategy,
    emptyLinesBetweenGroups,
    sortPropertiesWithinGroups
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

  // For backward compatibility, check both old and new paths
  const getConfigValue = <T>(newPath: string, oldPath: string, defaultValue: T): T => {
    // Try the new path first
    const newValue = config.get<T>(newPath);
    if (newValue !== undefined) {
      return newValue;
    }
    // Fall back to old path
    const oldValue = config.get<T>(oldPath);
    if (oldValue !== undefined) {
      return oldValue;
    }
    // If neither exists, return default
    return defaultValue;
  };

  return {
    alwaysSemicolon: getConfigValue('formatting.alwaysSemicolon', 'alwaysSemicolon', true),
    colorCase: getConfigValue('formatting.colorCase', 'colorCase', 'lower' as 'lower' | 'upper'),
    blockIndent: getConfigValue('formatting.blockIndent', 'blockIndent', '\t'),
    colorShorthand: getConfigValue('formatting.colorShorthand', 'colorShorthand', true),
    elementCase: getConfigValue('formatting.elementCase', 'elementCase', 'lower' as 'lower' | 'upper'),
    leadingZero: getConfigValue('formatting.leadingZero', 'leadingZero', false),
    quotes: getConfigValue('formatting.quotes', 'quotes', 'double' as 'double' | 'single'),
    sortOrderFallback: getConfigValue('formatting.sortOrderFallback', 'sortOrderFallback', 'abc' as 'abc' | 'none'),
    unitlessZero: getConfigValue('formatting.unitlessZero', 'unitlessZero', true),
    vendorPrefixAlign: getConfigValue('formatting.vendorPrefixAlign', 'vendorPrefixAlign', true),
    stripSpaces: getConfigValue('formatting.stripSpaces', 'stripSpaces', true),

    // Spacing settings
    spaceBeforeColon: getConfigValue('spacing.spaceBeforeColon', 'spaceBeforeColon', ''),
    spaceAfterColon: getConfigValue('spacing.spaceAfterColon', 'spaceAfterColon', ' '),
    spaceBeforeCombinator: getConfigValue('spacing.spaceBeforeCombinator', 'spaceBeforeCombinator', ' '),
    spaceAfterCombinator: getConfigValue('spacing.spaceAfterCombinator', 'spaceAfterCombinator', ' '),
    spaceBetweenDeclarations: getConfigValue('spacing.spaceBetweenDeclarations', 'spaceBetweenDeclarations', '\n'),
    spaceBeforeOpeningBrace: getConfigValue('spacing.spaceBeforeOpeningBrace', 'spaceBeforeOpeningBrace', ''),
    spaceAfterOpeningBrace: getConfigValue('spacing.spaceAfterOpeningBrace', 'spaceAfterOpeningBrace', '\n'),
    spaceAfterSelectorDelimiter: getConfigValue('spacing.spaceAfterSelectorDelimiter', 'spaceAfterSelectorDelimiter', '\n'),
    spaceBeforeSelectorDelimiter: getConfigValue('spacing.spaceBeforeSelectorDelimiter', 'spaceBeforeSelectorDelimiter', ''),
    spaceBeforeClosingBrace: getConfigValue('spacing.spaceBeforeClosingBrace', 'spaceBeforeClosingBrace', '\n'),

    // General settings
    tabSize: getConfigValue('general.tabSize', 'tabSize', true)
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