/**
 * CSS Property Sorting Implementation
 * 
 * This module handles the actual sorting of CSS properties in the editor
 * using strategies from the shared package.
 */

import * as vscode from 'vscode';
import { sortProperties } from '@old-fashioned/shared';
import { SortingStrategy, SortingOptions } from '@old-fashioned/shared';
import { DEFAULT_PROPERTY_GROUPS, IDIOMATIC_PROPERTY_GROUPS } from '@old-fashioned/shared';
import { getSortingOptions, getFormattingOptions } from './utils';
import { getDocumentSortingOptions, ConfigSource } from './config-loader';
import * as postcss from 'postcss';
import * as postcssScss from 'postcss-scss';

/**
 * Text processing result interface
 */
interface TextProcessingResult {
  selection: vscode.Selection;
  text: string;
  isEntireDocument: boolean;
}

/**
 * Sort CSS properties in the active editor
 * 
 * @param editor - The active text editor
 */
export async function sortCssProperties(editor: vscode.TextEditor): Promise<void> {
  // Check if we have a valid editor
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return;
  }

  // Check if the document is a CSS/SCSS/SASS file
  const document = editor.document;
  if (!['css', 'scss', 'sass'].includes(document.languageId)) {
    vscode.window.showErrorMessage('This command only works on CSS, SCSS, or SASS files');
    return;
  }

  // Get the text to process
  const { selection, text, isEntireDocument } = getTextToProcess(editor);

  try {
    // Check for project-level configuration first
    const configWithSource = getDocumentSortingOptions(document);
    const sortingOptions = configWithSource.options;

    // Notify user about configuration source (optional)
    if (configWithSource.source === ConfigSource.PROJECT) {
      console.log(`Using project-level stylelint configuration from: ${configWithSource.configPath}`);
    } else {
      console.log('Using VS Code extension settings for sorting');
    }

    // Show progress indicator
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Sorting CSS properties...",
      cancellable: false
    }, async () => {
      // Get formatting configuration, use try/catch to prevent settings UI from opening
      let formattingOptions;

      try {
        formattingOptions = getFormattingOptions();
      } catch (error) {
        console.error('Error getting formatting options:', error);
        // Use default formatting values
        formattingOptions = {
          alwaysSemicolon: true,
          colorCase: 'lower' as 'lower' | 'upper',
          blockIndent: '\t',
          colorShorthand: true,
          elementCase: 'lower' as 'lower' | 'upper',
          leadingZero: false,
          quotes: 'double' as 'double' | 'single',
          sortOrderFallback: 'abc' as 'abc' | 'none',
          spaceBeforeColon: '',
          spaceAfterColon: ' ',
          spaceBeforeCombinator: ' ',
          spaceAfterCombinator: ' ',
          spaceBetweenDeclarations: '\n',
          spaceBeforeOpeningBrace: '',
          spaceAfterOpeningBrace: '\n',
          spaceAfterSelectorDelimiter: '\n',
          spaceBeforeSelectorDelimiter: '',
          spaceBeforeClosingBrace: '\n',
          stripSpaces: true,
          tabSize: true,
          unitlessZero: true,
          vendorPrefixAlign: true
        };
      }

      // Parse and sort the CSS/SCSS - use the project configuration we detected earlier
      const sortedText = sortCssText(text, document.languageId, {
        ...configWithSource.options, // Use the project-level config if available
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
      });

      if (sortedText !== text) {
        // Apply the changes to the document
        const edit = new vscode.WorkspaceEdit();

        if (isEntireDocument) {
          // Replace entire document content
          const entireRange = new vscode.Range(
            0, 0,
            document.lineCount - 1,
            document.lineAt(document.lineCount - 1).text.length
          );
          edit.replace(document.uri, entireRange, sortedText);
        } else {
          // Replace just the selected range
          edit.replace(document.uri, selection, sortedText);
        }

        // Apply the edit
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('CSS properties sorted successfully');
      } else {
        vscode.window.showInformationMessage('CSS properties are already properly sorted');
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Error sorting properties: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Sort CSS/SCSS text by parsing it and reordering properties
 * 
 * @param cssText - The CSS/SCSS text to sort
 * @param languageId - The language ID (css, scss, sass)
 * @param options - Sorting options
 * @returns Sorted CSS/SCSS text
 */
function sortCssText(cssText: string, languageId: string, options: any): string {
  try {
    let root;
    // Choose parser based on language
    if (languageId === 'css') {
      root = postcss.parse(cssText);
    } else {
      // For SCSS/SASS, use the SCSS parser
      root = postcssScss.parse(cssText);
    }

    // Process each rule
    root.walkRules((rule) => {
      const declarations = rule.nodes
        .filter((node: any) => node.type === 'decl')
        .map((node: any) => node.prop);

      if (declarations.length > 0) {
        const sortingResult = sortProperties(declarations, options);

        if (sortingResult.success && sortingResult.sortedProperties) {
          // Create a map of property index in the sorted array
          const sortedIndexMap = new Map<string, number>();
          sortingResult.sortedProperties.forEach((prop, index) => {
            if (prop !== '') { // Skip empty line markers
              sortedIndexMap.set(prop, index);
            }
          });

          // Sort the actual declaration nodes
          const sortedDecls = [...rule.nodes]
            .filter((node: any) => node.type === 'decl')
            .sort((a: any, b: any) => {
              const indexA = sortedIndexMap.get(a.prop) ?? Number.MAX_SAFE_INTEGER;
              const indexB = sortedIndexMap.get(b.prop) ?? Number.MAX_SAFE_INTEGER;
              return indexA - indexB;
            });

          const nonDecls = rule.nodes.filter((node: any) => node.type !== 'decl');

          // Replace with sorted declarations (we'll handle empty lines in the formatter)
          rule.nodes = [...sortedDecls, ...nonDecls];
        }
      }
    });

    // Stringify the result
    const result = root.toString();

    // If empty lines between groups is enabled, process the result to add empty lines
    // between custom properties and SCSS variables
    if (options.emptyLinesBetweenGroups) {
      return processDeclarationGroups(result, options.strategy);
    }

    // Otherwise just add the debug marker
    return `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${options.strategy}) */\n${result}`;
  } catch (error) {
    console.error('Error parsing CSS:', error);
    return cssText; // Return original text if parsing fails
  }
}

/**
 * Get the text to process (selection or entire document)
 * 
 * @param editor - The text editor
 * @returns Object containing selection, text, and flag indicating if it's the entire document
 */
function getTextToProcess(editor: vscode.TextEditor): TextProcessingResult {
  const document = editor.document;
  const selection = editor.selection;
  let text: string;
  let isEntireDocument = false;

  if (selection.isEmpty) {
    // No text selected, process entire document
    const fullRange = new vscode.Range(
      0, 0,
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    );
    text = document.getText();
    isEntireDocument = true;
  } else {
    // Process only the selected text
    text = document.getText(selection);
    isEntireDocument = false;
  }

  return { selection, text, isEntireDocument };
}

/**
 * Get property groups based on the strategy
 */
function getPropertyGroups(strategy: string): string[][] | null {
  switch (strategy) {
    case 'grouped':
      return DEFAULT_PROPERTY_GROUPS;
    case 'idiomatic':
      return IDIOMATIC_PROPERTY_GROUPS;
    case 'concentric':
      // Concentric is not group-based
      return null;
    case 'alphabetical':
      // Alphabetical is not group-based
      return null;
    default:
      return null;
  }
}

/**
 * Process the CSS text to add empty lines between different property groups
 * 
 * @param cssText - CSS text to process
 * @param strategy - The sorting strategy being used
 * @returns Processed CSS text with empty lines added
 */
function processDeclarationGroups(cssText: string, strategy: string): string {
  // First, split the text and clean up any duplicate empty lines
  const lines = cssText.split('\n');
  const cleanedLines: string[] = [];

  // Remove all blank lines first
  for (const line of lines) {
    if (line.trim() !== '' || cleanedLines.length === 0 || cleanedLines[cleanedLines.length - 1].trim() !== '') {
      cleanedLines.push(line);
    }
  }

  // Process the cleaned lines to add exactly one blank line between groups
  const result: string[] = [];
  let inCustomProps = false;
  let inScssVars = false;

  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i];
    const trimmed = line.trim();

    // Skip empty lines - we'll add them back as needed
    if (trimmed === '') {
      continue;
    }

    // Check for rule boundaries
    const isRuleStart = trimmed.includes('{');
    const isRuleEnd = trimmed.includes('}');

    if (isRuleStart || isRuleEnd) {
      // Reset tracking when entering or leaving a rule
      if (isRuleStart) {
        inCustomProps = false;
        inScssVars = false;
      }
      result.push(line);
      continue;
    }

    // Check for property type
    const isCustomProp = trimmed.match(/^\s*--[a-zA-Z0-9-_]+\s*:/);
    const isScssVar = trimmed.match(/^\s*\$[a-zA-Z0-9-_]+\s*:/);

    // Check for transitions between groups
    if (inCustomProps && !isCustomProp) {
      // We're leaving custom props
      result.push('');
      inCustomProps = false;
    }

    if (!inScssVars && isScssVar) {
      // We're entering SCSS vars
      if (result.length > 0 && result[result.length - 1].trim() !== '') {
        result.push('');
      }
      inScssVars = true;
    } else if (inScssVars && !isScssVar) {
      // We're leaving SCSS vars
      result.push('');
      inScssVars = false;
    }

    // Update state based on current line
    if (isCustomProp) {
      inCustomProps = true;
    }

    // Add the current line
    result.push(line);
  }

  return `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${strategy}) */\n${result.join('\n')}`;
}