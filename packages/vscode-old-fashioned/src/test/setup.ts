/**
 * Test setup for VS Code extension tests
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Mock VS Code API
const vscodeStub = {
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    activeTextEditor: undefined,
    onDidChangeActiveTextEditor: vi.fn(),
    createTextEditorDecorationType: vi.fn(),
  },
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
      has: vi.fn(),
      update: vi.fn(),
    })),
    onDidChangeTextDocument: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
  },
  languages: {
    registerCodeActionsProvider: vi.fn(),
    createDiagnosticCollection: vi.fn(() => ({
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  Range: class {
    constructor(
      public start: { line: number; character: number },
      public end: { line: number; character: number }
    ) {}
  },
  Position: class {
    constructor(public line: number, public character: number) {}
  },
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3,
  },
  Diagnostic: class {
    constructor(
      public range: any,
      public message: string,
      public severity?: number
    ) {}
    source?: string;
    code?: string | number;
  },
  CodeActionKind: {
    QuickFix: 'quickfix',
    Refactor: 'refactor',
    Empty: '',
  },
  CodeAction: class {
    constructor(public title: string, public kind: any) {}
    command?: any;
    diagnostics?: any[];
    isPreferred?: boolean;
  },
  Uri: {
    file: (path: string) => ({ path }),
    parse: (uri: string) => ({ path: uri }),
  },
  EventEmitter: class {
    constructor() {}
    event = vi.fn();
    fire = vi.fn();
    dispose = vi.fn();
  },
  ExtensionContext: class {
    subscriptions: any[] = [];
    constructor() {}
  },
};

// Create the mock before tests run
beforeAll(() => {
  vi.mock('vscode', () => vscodeStub);
});

// Clean up after tests
afterAll(() => {
  vi.clearAllMocks();
});