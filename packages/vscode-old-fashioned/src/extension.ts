/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code based on
 * different strategies (alphabetical, concentric, idiomatic).
 * It can also integrate with project-level stylelint configurations.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { sortCssProperties } from './sorting';
import { getFormattingOptions, getSortingOptions, shouldShowNotification, getParseSyntax } from './utils';
import { OldFashionedCodeActionProvider } from './code-actions';

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

    // Register autofix command using stylelint's fix mode
    const autofixCommand = vscode.commands.registerCommand('old-fashioned.autofixWithStylelint', async () => {
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
        // Loaded on demand so a stylelint failure cannot break activation or sorting
        const stylelint = await import('stylelint');
        const { stylelintPlugins, getCustomSyntax } = await import('./stylelint-support');
        const sortingOptions = getSortingOptions();
        const customSyntax = getCustomSyntax(getParseSyntax(document.languageId));

        const result = await stylelint.default.lint({
          code: document.getText(),
          config: {
            plugins: stylelintPlugins,
            rules: {
              'oldfashioned-order/properties-order': [
                sortingOptions.strategy || 'alphabetical',
                {
                  emptyLinesBetweenGroups: sortingOptions.emptyLinesBetweenGroups,
                  sortPropertiesWithinGroups: sortingOptions.sortPropertiesWithinGroups,
                },
              ],
            },
            customSyntax,
          },
          fix: true,
        });

        const fixedCode = result.code;
        if (fixedCode && fixedCode !== document.getText()) {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          await editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, fixedCode);
          });
          if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage('CSS properties sorted using stylelint autofix');
          }
        } else {
          if (shouldShowNotification('info')) {
            vscode.window.showInformationMessage('Properties are already in order');
          }
        }
      } catch (err) {
        console.error('Autofix failed:', err);
        vscode.window.showErrorMessage(
          `Autofix failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    });

    // Register Code Action Provider for CSS/SCSS/SASS
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
      [
        { language: 'css', scheme: 'file' },
        { language: 'scss', scheme: 'file' },
        { language: 'sass', scheme: 'file' },
      ],
      new OldFashionedCodeActionProvider(),
      {
        providedCodeActionKinds: OldFashionedCodeActionProvider.providedCodeActionKinds,
      }
    );

    // Add commands to context subscriptions first
    context.subscriptions.push(sortCommand, openSettingsCommand, autofixCommand, codeActionProvider);

    // Defer diagnostics activation
    setTimeout(() => {
      try {
        console.log('Dynamically importing diagnostics module...');
        // Dynamic import to delay loading the module until we're ready
        import('./diagnostics').then(module => {
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

    // Show a message when the extension is activated, respecting notification level
    const config = vscode.workspace.getConfiguration('oldFashioned');
    const showActivationMessage = config.get<boolean>('showActivationMessage', true);

    if (showActivationMessage && shouldShowNotification('info')) {
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