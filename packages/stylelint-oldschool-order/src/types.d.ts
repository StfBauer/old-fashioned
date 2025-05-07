import { Root } from 'postcss';
import { SortingOptions } from '@old-fashioned/shared';

declare module 'postcss-scss' {
  import { Syntax } from 'postcss';
  const scss: Syntax;
  export = scss;
}

declare module 'postcss-sass' {
  import { Syntax } from 'postcss';
  const sass: Syntax;
  export = sass;
}

declare module 'stylelint' {
  import { Root, Result as PostcssResult } from 'postcss';

  export interface Plugin {
    ruleName: string;
    rule: Rule<any, any>;
  }

  export type Rule<PrimaryOptions, SecondaryOptions> =
    ((primaryOption?: PrimaryOptions, secondaryOption?: SecondaryOptions) => RuleFunction) & {
      ruleName?: string;
      messages?: Record<string, Function>;
    };

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
    warn(message: string, options?: any): void;
    [key: string]: any;
  }

  export namespace utils {
    function report(problem: {
      ruleName: string;
      result: PostcssResult;
      message: string;
      node: any;
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
  }

  export function createPlugin(ruleName: string, rule: Rule<any, any>): Plugin;
}

declare module '@old-fashioned/shared' {
  export interface PropertyGroup {
    name: string;
    properties: string[];
    emptyLineAfter?: boolean;
  }

  export type SortingStrategy = 'alphabetical' | 'grouped' | 'concentric' | 'custom';

  export interface SortingOptions {
    strategy: SortingStrategy;
    emptyLinesBetweenGroups: boolean;
    sortPropertiesWithinGroups: boolean;
    propertyGroups?: string[][];
  }

  export interface SortingResult {
    success: boolean;
    originalProperties: string[];
    sortedProperties: string[];
    error?: string;
  }

  export const DEFAULT_PROPERTY_GROUPS: string[][];

  export function sortProperties(
    properties: string[],
    options: SortingOptions
  ): SortingResult;

  export function sortPropertiesAlphabetically(
    properties: string[]
  ): SortingResult;

  export function sortPropertiesByGroups(
    properties: string[],
    options: SortingOptions
  ): SortingResult;

  export function sortPropertiesConcentrically(
    properties: string[]
  ): SortingResult;

  export function sortPropertiesCustom(
    properties: string[],
    propertyGroups: string[][],
    options: SortingOptions
  ): SortingResult;

  export function isCSSProperty(property: string): boolean;

  export function validatePropertyArray(properties: string[]): boolean;

  export interface CSSCombConfig {
    'sort-order'?: (string | string[])[];
    'always-semicolon'?: boolean;
    [key: string]: any;
  }

  export function convertCSSCombConfig(csscombConfig: CSSCombConfig): SortingOptions;
}
