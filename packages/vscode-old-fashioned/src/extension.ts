/**
 * Old Fashioned VS Code Extension
 * 
 * This extension provides CSS property sorting in VS Code using
 * the stylelint-oldschool-order plugin.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Moves @use, @forward, @import statements to the top of SCSS content
 */
function preprocessScssContent(content: string): string {
  // Extract all directive statements
  const useRegex = /@(use|forward|import)\s+(['"])([^'"]+)(['"])\s*;?/g;
  const directives: string[] = [];

  // Remove directives and save them
  const contentWithoutDirectives = content.replace(useRegex, (match) => {
    directives.push(match.endsWith(';') ? match : match + ';');
    return '';
  });

  // Clean the content from invisible/problematic characters
  const cleanContent = contentWithoutDirectives
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .trim();

  // Combine directives at the top + remaining content
  return directives.join('\n') + (directives.length ? '\n\n' : '') + cleanContent;
}

/**
 * Sort CSS properties in the current document
 */
async function sortCssProperties(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
  try {
    // Get document content
    let content = document.getText();
    const isScss = document.languageId === 'scss' ||
      (document.fileName ? document.fileName.endsWith('.scss') : false);

    // For SCSS files, pre-process to ensure @use statements are at the top
    if (isScss) {
      content = preprocessScssContent(content);
    }

    // Create a temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Clean up old temp files
    try {
      fs.readdirSync(tempDir).forEach(file => {
        fs.unlink(path.join(tempDir, file), () => { });
      });
    } catch (e) {
      // Ignore errors
    }

    // Create temporary files
    const timestamp = Date.now();
    const tempFile = path.join(tempDir, `temp-${timestamp}.${document.languageId}`);
    const configFile = path.join(tempDir, `.stylelintrc-${timestamp}.json`);

    // Create the stylelint config
    const config = {
      "plugins": ["stylelint-order"],
      "rules": {
        "order/properties-order": [
          "position", "top", "right", "bottom", "left", "z-index",
          "display", "visibility", "isolation", "float", "clear", "box-sizing",
          "width", "min-width", "max-width", "height", "min-height", "max-height",
          "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
          "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
          "padding-block", "padding-inline", "padding-inline-start",
          "background", "background-color", "color",
          "font-family", "font-size", "font-weight",
          "content", "transition", "transform", "cursor", "opacity"
        ]
      }
    };

    // Write temporary files
    fs.writeFileSync(tempFile, content);
    fs.writeFileSync(configFile, JSON.stringify(config));

    // Try to run stylelint
    try {
      const cmd = `npx --no stylelint "${tempFile}" --fix --config "${configFile}"`;
      await execAsync(cmd);

      // Read the result
      const sortedContent = fs.readFileSync(tempFile, 'utf8');

      // Apply the changes if content was changed
      if (sortedContent && sortedContent !== document.getText()) {
        return [vscode.TextEdit.replace(
          new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).range.end.character),
          sortedContent
        )];
      }
    } catch (error) {
      console.error('Stylelint error:', error);
      // Fallback to just returning the preprocessed content if stylelint fails
      if (isScss && content !== document.getText()) {
        return [vscode.TextEdit.replace(
          new vscode.Range(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).range.end.character),
          content
        )];
      }
    } finally {
      // Clean up
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sorting CSS:', errorMessage);
    return [];
  }
}

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

  context.subscriptions.push(command);
}

export function deactivate() { }