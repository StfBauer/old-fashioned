import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sortCssProperties } from '../sorting';
import { getSortingOptions, getParseSyntax, createDiagnosticFromWarning } from '../utils';

// Create vscode type
type VSCodeMock = {
  window: any;
  commands: any;
  workspace: any;
  languages: any;
  CancellationTokenSource: any;
  Range: any;
  Position: any;
  Selection: any;
  CodeAction: any;
  CodeActionKind: any;
  DiagnosticSeverity: any;
  Diagnostic: any;
  TextEdit: any;
  WorkspaceEdit: any;
  ProgressLocation: any;
  ExtensionContext: any;
};

// Mock VS Code APIs with proper type signatures
const vscode = vi.hoisted(() => {
  const mockVSCode: VSCodeMock = {
    window: {
      activeTextEditor: null,
      showErrorMessage: vi.fn(),
      showInformationMessage: vi.fn(),
      withProgress: vi.fn((options, task) => task())
    },
    commands: {
      registerCommand: vi.fn(),
      executeCommand: vi.fn()
    },
    workspace: {
      getConfiguration: vi.fn(() => ({
        get: (key: string, defaultValue: any) => defaultValue
      })),
      onDidOpenTextDocument: vi.fn(),
      onDidChangeTextDocument: vi.fn(),
      onDidSaveTextDocument: vi.fn(),
      onDidCloseTextDocument: vi.fn(),
      textDocuments: [] as any[],
      applyEdit: vi.fn()
    },
    languages: {
      registerCodeActionsProvider: vi.fn(),
      registerDocumentFormattingEditProvider: vi.fn(),
      createDiagnosticCollection: vi.fn(() => ({
        set: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        dispose: vi.fn()
      }))
    },
    CancellationTokenSource: class {
      token = { isCancellationRequested: false };
      cancel() {
        this.token.isCancellationRequested = true;
      }
      dispose() {}
    },
    Range: class {
      constructor(
        public startLine: number, 
        public startChar: number, 
        public endLine: number, 
        public endChar: number
      ) {}
    },
    Position: class {
      constructor(public line: number, public character: number) {}
    },
    Selection: class {
      constructor(
        public anchor: any, 
        public active: any
      ) {}
      isEmpty = false
    },
    CodeAction: class {
      constructor(public title: string, public kind: any) {}
      command: any = undefined;
    },
    CodeActionKind: {
      QuickFix: 'quickfix'
    },
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3
    },
    Diagnostic: class {
      constructor(public range: any, public message: string, public severity: number) {}
      source: string = ''
      code: string = ''
    },
    TextEdit: {
      replace: vi.fn((range, text) => ({ range, newText: text }))
    },
    WorkspaceEdit: class {
      replace = vi.fn()
    },
    ProgressLocation: {
      Notification: 1
    },
    ExtensionContext: class {
      subscriptions: any[] = []
    }
  };
  return mockVSCode;
});

vi.mock('vscode', () => vscode);

// Mock the extension module
const mockExtension = {
  activate: vi.fn(),
  deactivate: vi.fn()
};

vi.mock('../extension', () => mockExtension);

// Mock stylelint
const mockStylelint = vi.hoisted(() => ({
  default: {
    lint: vi.fn().mockResolvedValue({
      output: 'sorted-css',
      results: [
        {
          warnings: [
            { 
              line: 1, 
              column: 1, 
              rule: 'plugin/oldschool-order',
              severity: 'warning', 
              text: 'Expected order to be: display, width, color'
            }
          ]
        }
      ]
    })
  }
}));

vi.mock('stylelint', () => mockStylelint);

describe('Extension', () => {
  let context: any;
  
  beforeEach(() => {
    context = new vscode.ExtensionContext();
    vi.clearAllMocks();
  });
  
  describe('activate', () => {
    it('should register commands and providers', () => {
      mockExtension.activate(context);
      
      expect(vscode.commands.registerCommand).toHaveBeenCalled();
      expect(vscode.languages.registerCodeActionsProvider).toHaveBeenCalled();
      expect(vscode.languages.registerDocumentFormattingEditProvider).toHaveBeenCalled();
    });
  });
  
  describe('sortCssProperties', () => {
    it('should show error when no active editor', async () => {
      await sortCssProperties((vscode as any).window.activeTextEditor);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor found');
    });
    
    it('should sort CSS properties when editor available', async () => {
      const mockEditor = {
        document: {
          languageId: 'css',
          getText: () => '.test { color: red; display: block; }',
          lineCount: 1,
          lineAt: (line: number) => ({ text: '.test { color: red; display: block; }' }),
          uri: 'file:///test.css',
          fileName: '/test.css'
        },
        selection: {
          isEmpty: true
        }
      };
      
      await sortCssProperties(mockEditor as any);
      
      expect(vscode.window.withProgress).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });
  });
});

describe('VS Code extension', () => {
  describe('utils', () => {
    it('should return correct parse syntax for CSS', () => {
      expect(getParseSyntax('css')).toBe('css');
    });
    
    it('should return correct parse syntax for SCSS', () => {
      expect(getParseSyntax('scss')).toBe('scss');
    });
    
    it('should return correct parse syntax for SASS', () => {
      expect(getParseSyntax('sass')).toBe('sass');
    });
    
    it('should return default sorting options', () => {
      const options = getSortingOptions();
      expect(options.strategy).toBe('grouped');
      expect(options.emptyLinesBetweenGroups).toBe(true);
      expect(options.sortPropertiesWithinGroups).toBe(true);
    });
    
    it('should create a diagnostic from a warning', () => {
      const warning = {
        line: 1,
        column: 1,
        text: 'Properties should be sorted',
        rule: 'plugin/oldschool-order',
        severity: 'warning'
      };
      
      const document = {
        lineAt: vi.fn().mockReturnValue({ text: 'color: red;' })
      };
      
      const diagnostic = createDiagnosticFromWarning(warning, document as any);
      
      expect(diagnostic).toBeDefined();
      expect(diagnostic.source).toBe('old-fashioned');
      expect(diagnostic.code).toBe('plugin/oldschool-order');
    });
  });
  
  describe('sorting', () => {
    it('should show an error message when no editor is active', async () => {
      const vscode = await import('vscode');
      
      await sortCssProperties(undefined as any);
      
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No active editor found');
    });
    
    it('should show an error for non-CSS files', async () => {
      const vscode = await import('vscode');
      
      const editor = {
        document: {
          languageId: 'javascript'
        }
      };
      
      await sortCssProperties(editor as any);
      
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('This command only works on CSS, SCSS, or SASS files');
    });
    
    it('should sort CSS properties for the entire document', async () => {
      const vscode = await import('vscode');
      const stylelint = await import('stylelint');
      
      const editor = {
        document: {
          languageId: 'css',
          getText: vi.fn().mockReturnValue('.test { color: red; display: block; }'),
          lineAt: vi.fn().mockReturnValue({ text: '.test { color: red; display: block; }' }),
          lineCount: 1,
          uri: { toString: () => 'file:///test.css' }
        },
        selection: {
          isEmpty: true
        }
      };
      
      await sortCssProperties(editor as any);
      
      expect(stylelint.default.lint).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('CSS properties sorted successfully');
    });
  });
});
