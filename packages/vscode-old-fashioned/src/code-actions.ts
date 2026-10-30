/**
 * Code Action Provider for Old Fashioned CSS Sorter
 *
 * Provides QuickFix actions when diagnostics from old-fashioned are present.
 */

import * as vscode from 'vscode';

const DIAGNOSTIC_SOURCE = 'old-fashioned';
const ORDER_RULE_NAME = 'oldfashioned-order/properties-order';

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
    const orderDiagnostics = ourDiagnostics.filter((d) => d.code === ORDER_RULE_NAME);
    if (orderDiagnostics.length > 0) {
      const sortAction = new vscode.CodeAction(
        'Sort properties (Old Fashioned)',
        vscode.CodeActionKind.QuickFix
      );
      sortAction.command = {
        command: 'old-fashioned.sortProperties',
        title: 'Sort CSS Properties',
      };
      sortAction.diagnostics = orderDiagnostics;
      sortAction.isPreferred = true;
      actions.push(sortAction);
    }

    // Autofix all: use stylelint fix mode
    const autofixAction = new vscode.CodeAction(
      'Fix all auto-fixable issues with Stylelint (Beta) (Old Fashioned)',
      vscode.CodeActionKind.QuickFix
    );
    autofixAction.command = {
      command: 'old-fashioned.autofixWithStylelint',
      title: 'Autofix CSS with Stylelint (Beta)',
    };
    autofixAction.diagnostics = ourDiagnostics;
    actions.push(autofixAction);

    return actions;
  }
}
