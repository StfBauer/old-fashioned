/**
 * Utilities for the Old Fashioned CSS Sorter
 */
import * as vscode from 'vscode';
import * as path from 'path';

// Define fallback property groups for when the shared package isn't available
const FALLBACK_DEFAULT_GROUPS: string[][] = [
  // Positioning
  ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
  // Box model
  ['display', 'width', 'height', 'margin', 'padding'],
  // Visual
  ['background', 'color', 'border'],
  // Typography
  ['font', 'text-align', 'line-height'],
  // Other
  ['transition', 'opacity', 'cursor']
];

// Safely import from shared package with fallbacks
let DEFAULT_PROPERTY_GROUPS: string[][];
let RATIONAL_ORDER_GROUPS: string[][];
let IDIOMATIC_ORDER_GROUPS: string[][];
let formatConcentric: () => string[][];

try {
  // Try to import from the shared package
  const shared = require('@old-fashioned/shared');

  DEFAULT_PROPERTY_GROUPS = shared.DEFAULT_PROPERTY_GROUPS;
  RATIONAL_ORDER_GROUPS = shared.RATIONAL_ORDER_GROUPS;
  IDIOMATIC_ORDER_GROUPS = shared.IDIOMATIC_ORDER_GROUPS;
  formatConcentric = shared.formatConcentric;

  console.log('Successfully loaded property groups from shared package');
} catch (error) {
  // Fallback to simplified versions
  console.error('Failed to load from shared package:', error);

  DEFAULT_PROPERTY_GROUPS = FALLBACK_DEFAULT_GROUPS;
  RATIONAL_ORDER_GROUPS = FALLBACK_DEFAULT_GROUPS;
  IDIOMATIC_ORDER_GROUPS = FALLBACK_DEFAULT_GROUPS;
  formatConcentric = () => FALLBACK_DEFAULT_GROUPS;
}

/**
 * Get CSS/SCSS parsing syntax for stylelint
 */
export function getParseSyntax(document: vscode.TextDocument): any {
  if (document.languageId === 'scss' || (document.fileName && document.fileName.endsWith('.scss'))) {
    try {
      return require('postcss-scss');
    } catch (error) {
      console.error('Failed to load postcss-scss:', error);
      return null;
    }
  }
  return null;
}

/**
 * Get sorting options based on current VS Code settings
 */
export function getSortingOptions(): {
  strategy: string;
  emptyLinesBetweenGroups: boolean;
  sortPropertiesWithinGroups: boolean;
  algorithm?: string;
  processSassDirectives?: boolean;
} {
  const config = vscode.workspace.getConfiguration('oldFashioned');
  return {
    strategy: config.get('sortingStrategy', 'grouped'),
    emptyLinesBetweenGroups: config.get('emptyLinesBetweenGroups', false),
    sortPropertiesWithinGroups: config.get('sortPropertiesWithinGroups', true),
    algorithm: config.get('algorithm', 'auto'),
    processSassDirectives: config.get('processSassDirectives', true)
  };
}

/**
 * Check if document is a CSS or SCSS file
 */
export function isStyleDocument(document: vscode.TextDocument): boolean {
  return document.languageId === 'css' || document.languageId === 'scss';
}

/**
 * Create a diagnostic from stylelint warning
 */
export function createDiagnosticFromWarning(warning: any): vscode.Diagnostic {
  const range = new vscode.Range(
    new vscode.Position(warning.line - 1, warning.column - 1),
    new vscode.Position(warning.line - 1, warning.column)
  );

  return new vscode.Diagnostic(
    range,
    warning.text,
    vscode.DiagnosticSeverity.Warning
  );
}

/**
 * Get property groups for the specified sorting strategy
 */
export function getPropertyGroups(strategy: string): string[][] {
  switch (strategy) {
    case 'alphabetical':
      // For alphabetical, we don't need groups as it's handled specially
      return [];

    case 'rational-order':
      return RATIONAL_ORDER_GROUPS;

    case 'idiomatic-order':
      return IDIOMATIC_ORDER_GROUPS;

    case 'concentric':
      return formatConcentric();

    case 'grouped':
    default:
      return DEFAULT_PROPERTY_GROUPS;
  }
}