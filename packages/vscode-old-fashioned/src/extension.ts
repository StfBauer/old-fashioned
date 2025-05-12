/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldfashioned-order plugin.
 */

import * as vscode from 'vscode';
import { sortCssProperties } from './sorting';
import { getFormattingOptions, getSortingOptions } from './utils';
import { activateDiagnostics } from './diagnostics';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Old Fashioned CSS Sorter is now active');

  // Register the command for sorting CSS properties
  const sortCommand = vscode.commands.registerCommand('old-fashioned.sortProperties', async () => {
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

  // Register command to open settings
  const openSettingsCommand = vscode.commands.registerCommand('old-fashioned.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'oldFashioned');
  });

  // Activate diagnostics (linting)
  const diagnosticDisposables = activateDiagnostics(context);

  // Add all disposables to the context subscriptions
  context.subscriptions.push(sortCommand, openSettingsCommand, ...diagnosticDisposables);

  // Show a message when the extension is activated
  const config = vscode.workspace.getConfiguration('oldFashioned');
  const showActivationMessage = config.get<boolean>('showActivationMessage', true);

  if (showActivationMessage) {
    vscode.window.showInformationMessage('Old Fashioned CSS Sorter is now active. Use the command "Sort CSS Properties (Old Fashioned)" to sort your CSS.');
  }
}

/**
 * Deactivate the extension
 * Currently there's no special cleanup needed
 */
export function deactivate() {
  console.log('Old Fashioned CSS Sorter is deactivated');
}