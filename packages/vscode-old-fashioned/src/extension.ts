/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldschool-order plugin.
 */

import * as vscode from 'vscode';
import { sortCssProperties } from './sorting';
import { getFormattingOptions, getSortingOptions } from './utils';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Old Fashioned CSS Sorter is now active');

  const command = vscode.commands.registerCommand('old-fashioned.sortProperties', async () => {
    console.log('Sort properties command invoked');
    
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log('No active editor found');
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const document = editor.document;
    console.log('Active document language:', document.languageId);
    
    if (document.languageId !== 'css' && document.languageId !== 'scss' && document.languageId !== 'sass') {
      console.log('Document is not a CSS/SCSS/SASS file:', document.languageId);
      vscode.window.showInformationMessage('Not a CSS, SCSS, or SASS file');
      return;
    }

    try {
      // Check if configuration can be accessed
      console.log('Attempting to access extension configuration...');
      const sortingOptions = getSortingOptions();
      const formattingOptions = getFormattingOptions();
      console.log('Retrieved sorting options:', sortingOptions);
      
      // Use our updated sorting implementation from sorting.ts
      await sortCssProperties(editor);
    } catch (err) {
      console.error('Error during CSS sorting:', err);
      vscode.window.showErrorMessage(`Error: ${err}`);
    }
  });

  context.subscriptions.push(command);
}

export function deactivate() { }