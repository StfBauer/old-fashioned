/**
 * Code Action Provider for Old Fashioned CSS Sorter
 *
 * Provides QuickFix actions when diagnostics from old-fashioned are present.
 */

import * as vscode from 'vscode';

const DIAGNOSTIC_SOURCE = 'old-fashioned';

export class OldFashionedCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    // Filter diagnostics from our extension
    const ourDiagnostics = context.diagnostics.filter(
      (d) => d.source === DIAGNOSTIC_SOURCE
    );

    if (ourDiagnostics.length === 0) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    // Single fix: sort properties in the current rule block
    const sortAction = new vscode.CodeAction(
      'Sort properties (Old Fashioned)',
      vscode.CodeActionKind.QuickFix
    );
    sortAction.command = {
      command: 'old-fashioned.sortProperties',
      title: 'Sort CSS Properties',
    };
    sortAction.diagnostics = ourDiagnostics;
    sortAction.isPreferred = true;
    actions.push(sortAction);

    // Autofix all: use stylelint fix mode
    const autofixAction = new vscode.CodeAction(
      'Fix all property order issues (Old Fashioned)',
      vscode.CodeActionKind.QuickFix
    );
    autofixAction.command = {
      command: 'old-fashioned.autofixWithStylelint',
      title: 'Autofix CSS Property Order',
    };
    autofixAction.diagnostics = ourDiagnostics;
    actions.push(autofixAction);

    return actions;
  }
}
