/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * stylelint-order property sorting.
 */

import * as vscode from 'vscode';
import { sortCssProperties } from './sorting';
import { initDiagnostics } from './diagnostics';

// Create output channel for logging
export const outputChannel = vscode.window.createOutputChannel('Old Fashioned CSS');

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  // Log startup information
  outputChannel.appendLine('Old Fashioned CSS Sorter extension is now active');
  outputChannel.appendLine(`Working directory: ${process.cwd()}`);

  // Initialize diagnostics
  initDiagnostics(context);

  // Register the sort properties command
  const sortCommand = vscode.commands.registerCommand('old-fashioned.sortProperties', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'css' && document.languageId !== 'scss') {
      vscode.window.showInformationMessage('Not a CSS or SCSS file');
      return;
    }

    try {
      const edits = await sortCssProperties(document);
      if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(document.uri, edits);
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('CSS properties sorted');
      } else {
        vscode.window.showInformationMessage('No changes needed');
      }
    } catch (err) {
      vscode.window.showErrorMessage(`Error: ${err}`);
    }
  });

  // Add subscriptions
  context.subscriptions.push(sortCommand);
  context.subscriptions.push(outputChannel);
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  outputChannel.appendLine('Old Fashioned CSS Sorter extension is now deactivated');
}