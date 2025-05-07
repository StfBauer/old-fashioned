/**
 * Property sorting implementation for Old Fashioned VS Code extension
 * 
 * This file handles the actual sorting of CSS properties in the editor
 */

import * as vscode from 'vscode';
import * as stylelint from 'stylelint';
import { getParseSyntax, getSortingOptions } from './utils';

/**
 * Text processing result interface
 */
interface TextProcessingResult {
  selection: vscode.Selection;
  text: string;
  isEntireDocument: boolean;
}

/**
 * Sort CSS properties in the active text editor
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
    // Show progress indicator
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Sorting CSS properties...",
      cancellable: false
    }, async () => {
      // Run Stylelint with the fix option
      const options = getSortingOptions();
      const syntax = getParseSyntax(document.languageId);

      // Determine the appropriate custom syntax
      let customSyntax: string | undefined;
      if (syntax === 'scss') {
        customSyntax = 'postcss-scss';
      } else if (syntax === 'sass') {
        customSyntax = 'postcss-sass';
      }

      const result = await stylelint.lint({
        code: text,
        codeFilename: document.fileName,
        fix: true,
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

      if (result && result.output && result.output !== text) {
        // Apply the changes to the document
        const edit = new vscode.WorkspaceEdit();

        if (isEntireDocument) {
          // Replace entire document content
          const entireRange = new vscode.Range(
            0, 0,
            document.lineCount - 1,
            document.lineAt(document.lineCount - 1).text.length
          );
          edit.replace(document.uri, entireRange, result.output);
        } else {
          // Replace just the selected range
          edit.replace(document.uri, selection, result.output);
        }

        // Apply the edit
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('CSS properties sorted successfully');
      } else {
        vscode.window.showInformationMessage('CSS properties are already properly sorted');
      }
    });
  } catch (error) {
    // Use VS Code API instead of console
    vscode.window.showErrorMessage(`Error sorting properties: ${error instanceof Error ? error.message : String(error)}`);
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

  // If there's a selection, use that
  if (!selection.isEmpty) {
    return {
      selection,
      text: document.getText(selection),
      isEntireDocument: false
    };
  }

  // Otherwise, use the entire document
  return {
    selection: new vscode.Selection(
      0, 0,
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    ),
    text: document.getText(),
    isEntireDocument: true
  };
}