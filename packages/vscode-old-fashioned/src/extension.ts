/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldschool-order plugin.
 */

import * as vscode from 'vscode';
import { sortCssProperties } from './sorting';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Old Fashioned CSS Sorter is now active');

  const command = vscode.commands.registerCommand('old-fashioned.sortProperties', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'css' && document.languageId !== 'scss' && document.languageId !== 'sass') {
      vscode.window.showInformationMessage('Not a CSS, SCSS, or SASS file');
      return;
    }

    try {
      // Use our updated sorting implementation from sorting.ts
      await sortCssProperties(editor);
    } catch (err) {
      vscode.window.showErrorMessage(`Error: ${err}`);
    }
  });

  context.subscriptions.push(command);
}

export function deactivate() { }