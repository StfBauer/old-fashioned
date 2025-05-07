/**
 * Custom type definitions to enhance VS Code API type compatibility
 */

import * as vscode from 'vscode';

declare module 'vscode' {
  export interface Command {
    title: string;
    command: string;
    arguments?: any[];
  }
  
  export interface CodeActionProvider {
    provideCodeActions(
      document: vscode.TextDocument,
      range: vscode.Range | vscode.Selection,
      context: vscode.CodeActionContext,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]>;
  }
}

declare module 'stylelint' {
  interface LinterResult {
    results: {
      warnings: {
        line: number;
        column: number;
        rule: string;
        severity: string;
        text: string;
      }[];
      ignored?: boolean;
      errored?: boolean;
      output?: string;
      source?: string;
    }[];
    output?: string;
    errored?: boolean;
  }
  
  interface LintOptions {
    code?: string;
    codeFilename?: string;
    config?: any;
    configFile?: string;
    fix?: boolean;
    customSyntax?: string | any;
  }
  
  function lint(options: LintOptions): Promise<LinterResult>;
  
  export default {
    lint
  };
}
