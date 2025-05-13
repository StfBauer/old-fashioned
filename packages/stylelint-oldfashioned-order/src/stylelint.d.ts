declare module 'stylelint' {
  import { Node, Root } from 'postcss';
  
  export interface Plugin {
    ruleName: string;
    rule: Rule<any, any>;
  }
  
  export interface Rule<PrimaryOptions, SecondaryOptions> {
    (primaryOption?: PrimaryOptions, secondaryOption?: SecondaryOptions): RuleFunction;
    ruleName?: string;
    messages?: Record<string, Function>;
  }
  
  export type RuleFunction = (root: Root, result: PostcssResult) => void;
  
  export interface PostcssResult {
    opts?: {
      fix?: boolean;
      syntax?: string;
      customSyntax?: string;
      from?: string;
      [key: string]: any;
    };
    stylelint: {
      disabledRanges: Record<string, any>;
      ruleSeverities: Record<string, any>;
      customMessages: Record<string, any>;
      [key: string]: any;
    };
    warn(message: string, options?: { node?: Node; word?: string; index?: number }): void;
    [key: string]: any;
  }
  
  export namespace utils {
    function report(problem: { 
      ruleName: string;
      result: PostcssResult;
      message: string;
      node: Node;
      index?: number;
      word?: string;
      line?: number;
      column?: number;
      endLine?: number;
      endColumn?: number;
    }): void;
    
    function ruleMessages(ruleName: string, messages: Record<string, Function>): Record<string, Function>;
    
    function validateOptions(
      result: PostcssResult, 
      ruleName: string, 
      options: { 
        actual: any;
        possible: any;
        optional?: boolean;
      }
    ): boolean;
    
    function checkAgainstRule(
      options: {
        ruleName: string;
        ruleSettings: any;
        root: Root;
        result: PostcssResult;
        context: any;
      },
      callback: (warning: any) => void
    ): void;
  }
  
  export function createPlugin(ruleName: string, rule: Rule<any, any>): Plugin;
}
