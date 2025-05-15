/**
 * CSS Property Sorting Implementation
 * 
 * This module handles the actual sorting of CSS properties in the editor
 * using strategies from the shared package.
 */

import * as vscode from 'vscode';
import { sortProperties } from '@old-fashioned/shared';
import { SortingStrategy, SortingOptions } from '@old-fashioned/shared';
import { CONCENTRIC_PROPERTY_ORDER, IDIOMATIC_PROPERTY_GROUPS } from '@old-fashioned/shared';
import { addEmptyLinesBetweenGroups } from './formatter';
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
 * @param sortingOptions - The sorting options
 * @param formattingOptions - The formatting options
 */
export async function sortCssProperties(
  editor: vscode.TextEditor,
  sortingOptions?: SortingOptions,
  formattingOptions?: any
): Promise<void> {
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
    // Use provided sorting options or get from settings
    const options = sortingOptions || getSortingOptions();
    console.log(`Using sorting options:`, JSON.stringify(options, null, 2));

    // Use provided formatting options or get from settings
    const formatting = formattingOptions || getFormattingOptions();

    // Show progress indicator
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Sorting CSS properties with ${options.strategy} strategy...`,
      cancellable: false
    }, async () => {
      // Parse and sort the CSS/SCSS
      const sortedText = sortCssText(text, document.languageId, {
        ...options,
        // Add formatting options 
        'always-semicolon': formatting.alwaysSemicolon,
        'color-case': formatting.colorCase,
        'block-indent': formatting.blockIndent,
        'color-shorthand': formatting.colorShorthand,
        'element-case': formatting.elementCase,
        'leading-zero': formatting.leadingZero,
        'quotes': formatting.quotes,
        'sort-order-fallback': formatting.sortOrderFallback,
        'space-before-colon': formatting.spaceBeforeColon,
        'space-after-colon': formatting.spaceAfterColon,
        'space-before-combinator': formatting.spaceBeforeCombinator,
        'space-after-combinator': formatting.spaceAfterCombinator,
        'space-between-declarations': formatting.spaceBetweenDeclarations,
        'space-before-opening-brace': formatting.spaceBeforeOpeningBrace,
        'space-after-opening-brace': formatting.spaceAfterOpeningBrace,
        'space-after-selector-delimiter': formatting.spaceAfterSelectorDelimiter,
        'space-before-selector-delimiter': formatting.spaceBeforeSelectorDelimiter,
        'space-before-closing-brace': formatting.spaceBeforeClosingBrace,
        'strip-spaces': formatting.stripSpaces,
        'tab-size': formatting.tabSize,
        'unitless-zero': formatting.unitlessZero,
        'vendor-prefix-align': formatting.vendorPrefixAlign
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
        vscode.window.showInformationMessage(`CSS properties sorted successfully using ${options.strategy} strategy`);
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
    // Ensure we have a strategy and it's a valid one
    const strategy = options.strategy || 'alphabetical';
    console.log(`Sorting ${languageId} file with strategy: ${strategy}`);

    // For SCSS/SASS, ensure proper module directive ordering at the file level
    if (languageId === 'scss' || languageId === 'sass') {
      cssText = ensureSassModuleDirectiveOrder(cssText);
    }

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
      // Separate different types of nodes within this rule
      const declarations: any[] = [];
      const customProps: any[] = [];
      const sassVars: any[] = [];
      const mediaAtRules: any[] = [];
      const includeAtRules: any[] = [];
      const otherAtRules: any[] = [];
      const nestedRules: any[] = [];
      const comments: any[] = [];
      const otherNodes: any[] = [];

      // Sort the rule's nodes into categories
      rule.nodes.forEach((node: any) => {
        if (node.type === 'decl') {
          // Check if it's a custom property or SASS variable
          if (typeof node.prop === 'string') {
            if (node.prop.startsWith('--')) {
              customProps.push(node);
            } else if (node.prop.startsWith('$')) {
              sassVars.push(node);
            } else {
              declarations.push(node);
            }
          } else {
            declarations.push(node);
          }
        } else if (node.type === 'atrule') {
          if (node.name === 'media') {
            mediaAtRules.push(node);
          } else if (node.name === 'include') {
            includeAtRules.push(node);
          } else {
            otherAtRules.push(node);
          }
        } else if (node.type === 'rule') {
          nestedRules.push(node);
        } else if (node.type === 'comment') {
          comments.push(node);
        } else {
          otherNodes.push(node);
        }
      });

      // Sort declarations if we have any
      if (declarations.length > 0) {
        // Extract property names for sorting
        const declProps = declarations.map((decl: any) => decl.prop);

        // Sort the properties
        const sortingResult = sortProperties(declProps, options);

        if (sortingResult.success && sortingResult.sortedProperties) {
          // Create a map of property index in the sorted array
          const sortedIndexMap = new Map<string, number>();
          // Fix the forEach call with explicit types
          sortingResult.sortedProperties.forEach((prop: string, index: number) => {
            if (prop !== '') { // Skip empty line markers
              sortedIndexMap.set(prop, index);
            }
          });

          // Sort the declarations
          declarations.sort((a: any, b: any) => {
            const indexA = sortedIndexMap.get(a.prop) ?? Number.MAX_SAFE_INTEGER;
            const indexB = sortedIndexMap.get(b.prop) ?? Number.MAX_SAFE_INTEGER;
            return indexA - indexB;
          });
        }
      }

      // Filter comments to find those that were at the beginning
      const topComments = comments.filter((comment: any) => {
        const commentIndex = rule.nodes.indexOf(comment);
        // Consider a comment as "top" if it appears before any non-comment node
        for (let i = 0; i < commentIndex; i++) {
          if (rule.nodes[i].type !== 'comment') {
            return false;
          }
        }
        return true;
      });

      // Filter out top comments from the main comments array
      const remainingComments = comments.filter((comment: any) => !topComments.includes(comment));

      // Rebuild the rule's nodes in the correct order
      rule.nodes = [
        ...topComments,
        ...customProps,
        ...sassVars,
        ...declarations,
        ...includeAtRules,
        ...otherAtRules,
        ...remainingComments,
        ...nestedRules,
        ...otherNodes,
        ...mediaAtRules  // Media queries at the very end
      ];
    });

    // Make SASS module directives at the top level appear in the correct order
    if (languageId === 'scss' || languageId === 'sass') {
      const useNodes: any[] = [];
      const forwardNodes: any[] = [];
      const otherNodes: any[] = [];

      root.nodes.forEach((node: any) => {
        if (node.type === 'atrule') {
          if (node.name === 'use') {
            useNodes.push(node);
          } else if (node.name === 'forward') {
            forwardNodes.push(node);
          } else {
            otherNodes.push(node);
          }
        } else {
          otherNodes.push(node);
        }
      });

      if (useNodes.length > 0 || forwardNodes.length > 0) {
        // Rebuild the root with the correct order
        root.nodes = [...useNodes, ...forwardNodes, ...otherNodes];
      }
    }

    // Stringify the result
    let result = root.toString();

    // If empty lines between groups is enabled, use the formatter to add them
    if (options.emptyLinesBetweenGroups) {
      return addEmptyLinesBetweenGroups(result, strategy);
    }

    // Otherwise just add the debug marker
    return `/* DEBUG: Old Fashioned formatter applied on ${new Date().toLocaleString()} (strategy: ${strategy}) */\n${result}`;
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
 * Ensure SASS module directives (@use and @forward) are in the correct order at the file level
 * 
 * @param sassText - The SASS/SCSS text content
 * @returns Text with module directives properly ordered
 */
function ensureSassModuleDirectiveOrder(sassText: string): string {
  // This is a simple preprocessing step for top-level module directives
  const lines = sassText.split('\n');
  const useDirectives: string[] = [];
  const forwardDirectives: string[] = [];
  const otherLines: string[] = [];

  let inComment = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Track comment blocks
    if (trimmedLine.startsWith('/*') && !trimmedLine.includes('*/')) {
      inComment = true;
      otherLines.push(line);
      continue;
    }

    if (inComment) {
      if (trimmedLine.includes('*/')) {
        inComment = false;
      }
      otherLines.push(line);
      continue;
    }

    // Skip single-line comments
    if (trimmedLine.startsWith('//')) {
      otherLines.push(line);
      continue;
    }

    // Only process top-level directives (not indented)
    if (line.startsWith('@use ')) {
      useDirectives.push(line);
    } else if (line.startsWith('@forward ')) {
      forwardDirectives.push(line);
    } else {
      otherLines.push(line);
    }
  }

  // Only reorder if we found directives to reorder
  if (useDirectives.length > 0 || forwardDirectives.length > 0) {
    // Add empty lines between directive groups if needed
    const result: string[] = [...useDirectives];

    if (useDirectives.length > 0 && forwardDirectives.length > 0) {
      result.push('');
    }

    result.push(...forwardDirectives);

    if ((useDirectives.length > 0 || forwardDirectives.length > 0) && otherLines.length > 0) {
      result.push('');
    }

    result.push(...otherLines);

    return result.join('\n');
  }

  // No directives to reorder, return original text
  return sassText;
}