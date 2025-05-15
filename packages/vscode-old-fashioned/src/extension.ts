/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldfashioned-order plugin.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { sortCssProperties } from './sorting';
import { activateDiagnostics } from './diagnostics';

/**
 * Simple logger that will definitely work
 */
function log(message: string) {
  console.log(`[Old Fashioned] ${message}`);
  // Also try writing to a file for debugging
  const fs = require('fs');
  const path = require('path');
  try {
    const logPath = path.join(__dirname, 'extension-debug.log');
    // Ensure logPath is an absolute path string
    if (typeof logPath === 'string' && logPath.length > 0) {
      fs.appendFileSync(logPath, `${new Date().toISOString()}: ${message}\n`);
    }
  } catch (e) {
    console.error('Failed to write to log file', e);
  }
}

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  log('Extension activation started');

  try {
    // Log basic environment info
    log(`Extension path: ${context.extensionPath}`);
    log(`Extension URI: ${context.extensionUri}`);

    // Register the main sorting command
    const sortCommand = vscode.commands.registerCommand('vscode-old-fashioned.sortCssProperties', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await sortCssProperties(editor);
      } else {
        vscode.window.showErrorMessage('No active editor found.');
      }
    });
    context.subscriptions.push(sortCommand);

    // Activate diagnostics provider
    const diagnosticsDisposables = activateDiagnostics(context);
    diagnosticsDisposables.forEach(d => context.subscriptions.push(d));

    log('Extension activated successfully');
  } catch (error: any) {
    log(`Activation error: ${error?.message || 'Unknown error'}`);
    log(`Error stack: ${error?.stack || 'No stack trace'}`);
    throw error;
  }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  log('Extension deactivated');
}