/**
 * Type declarations for VS Code mocks in tests
 */

declare namespace vscode {
  interface ExtensionContext {
    subscriptions: any[];
  }
  
  interface Command {
    title: string;
    command: string;
    arguments?: any[];
  }
  
  interface CodeAction {
    title: string;
    kind: any;
    command?: Command;
  }
  
  interface Range {
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
  }
  
  interface Diagnostic {
    range: Range;
    message: string;
    severity: number;
    source: string;
    code: string;
  }
  
  interface TextEdit {
    range: Range;
    newText: string;
  }
  
  interface WorkspaceEdit {
    replace(uri: any, range: Range, newText: string): void;
  }
  
  interface DiagnosticCollection {
    set(uri: any, diagnostics: Diagnostic[]): void;
    delete(uri: any): void;
    clear(): void;
    dispose(): void;
  }
  
  interface CancellationToken {
    isCancellationRequested: boolean;
  }
  
  interface TextDocument {
    languageId: string;
    getText(): string;
    lineCount: number;
    lineAt(line: number): { text: string };
    uri: any;
    fileName?: string;
  }
  
  interface Position {
    line: number;
    character: number;
  }
  
  interface Selection {
    isEmpty: boolean;
    anchor: Position;
    active: Position;
  }
  
  interface Editor {
    document: TextDocument;
    selection: Selection;
  }
}

declare module 'vscode' {
  export = vscode;
}
