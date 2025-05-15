/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldfashioned-order plugin.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { sortCssProperties } from './sorting';
import { getFormattingOptions, getSortingOptions } from './utils';
// Import diagnostics in a way that allows us to control when it's loaded
// This helps prevent immediate activation failures
const diagnosticsModule = './diagnostics';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  try {
    console.log('Old Fashioned CSS Sorter activation starting...');
    console.log('Extension path:', context.extensionPath);
    console.log('Extension URI:', context.extensionUri.toString());

    // Ensure the extension path exists before proceeding
    if (!context.extensionPath || !fs.existsSync(context.extensionPath)) {
      console.error('Invalid extension path:', context.extensionPath);
      throw new Error('Extension path is invalid or does not exist');
    }

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
        console.log('Retrieved sorting options:', JSON.stringify(sortingOptions, null, 2));

        // Give feedback to the user about which strategy is being used
        vscode.window.showInformationMessage(`Sorting CSS properties using '${sortingOptions.strategy}' strategy`);

        // Pass the sorting options directly to ensure they're not lost
        await sortCssProperties(editor, sortingOptions, formattingOptions);

        // Format document after sorting
        console.log('Formatting document after sorting...');
        await vscode.commands.executeCommand('editor.action.formatDocument');
        console.log('Document formatting complete');
      } catch (err) {
        console.error('Error during CSS sorting or formatting:', err);
        vscode.window.showErrorMessage(`Error: ${err}`);
      }
    });

    // Register command to open settings
    const openSettingsCommand = vscode.commands.registerCommand('old-fashioned.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'oldFashioned');
    });

    // Add commands to context subscriptions first
    context.subscriptions.push(sortCommand, openSettingsCommand);

    // Defer diagnostics activation
    setTimeout(() => {
      try {
        console.log('Dynamically importing diagnostics module...');
        // Dynamic import to delay loading the module until we're ready
        import(diagnosticsModule).then(module => {
          console.log('Diagnostics module loaded successfully');
          const diagnosticDisposables = module.activateDiagnostics(context);
          diagnosticDisposables.forEach((disposable: vscode.Disposable) => context.subscriptions.push(disposable));
          console.log('Diagnostics activated successfully');
        }).catch(error => {
          console.error('Failed to import diagnostics module:', error);
        });
      } catch (diagErr) {
        console.error('Error activating diagnostics (non-fatal):', diagErr);
      }
    }, 2000); // Increased delay to ensure VS Code is fully initialized

    // Show a message when the extension is activated
    const config = vscode.workspace.getConfiguration('oldFashioned');
    const showActivationMessage = config.get<boolean>('showActivationMessage', true);

    if (showActivationMessage) {
      vscode.window.showInformationMessage('Old Fashioned CSS Sorter is now active. Use the command "Sort CSS Properties (Old Fashioned)" to sort your CSS.');
    }

    console.log('Old Fashioned CSS Sorter activation completed successfully');
  } catch (err) {
    console.error('Error during extension activation:', err);
    vscode.window.showErrorMessage(`Activation error: ${err instanceof Error ? err.message : String(err)}`);
    // Don't re-throw the error - this will let the extension activate even with issues
    // This prevents the "Extension activation failed" message
    // throw err;
  }
}

/**
 * Deactivate the extension
 * Currently there's no special cleanup needed
 */
export function deactivate() {
  console.log('Old Fashioned CSS Sorter is deactivated');
}