/**
 * Shared type definitions for Old Fashioned CSS property sorting tools
 */

/**
 * Property group definition
 */
export interface PropertyGroup {
  /**
   * Name of the property group
   */
  name: string;

  /**
   * List of CSS properties in this group
   */
  properties: string[];

  /**
   * Whether to add an empty line after this group
   */
  emptyLineAfter?: boolean;
}

/**
 * Supported sorting strategies
 */
export type SortingStrategy = 'alphabetical' | 'grouped' | 'concentric' | 'idiomatic' | 'custom';

/**
 * Context for nested CSS rules
 */
export interface NestedRuleContext {
  /**
   * The nesting level of the rule
   */
  nestingLevel: number;

  /**
   * The type of the parent rule (e.g., selector, at-rule)
   */
  parentType: string;

  /**
   * Whether the parent rule is an at-rule (e.g., @media, @supports)
   */
  isAtRule: boolean;
}

/**
 * Sorting options
 */
export interface SortingOptions {
  /**
   * The sorting strategy to use
   */
  strategy: SortingStrategy;

  /**
   * Whether to insert empty lines between property groups
   */
  emptyLinesBetweenGroups?: boolean;

  /**
   * Whether to sort properties alphabetically within groups
   */
  sortPropertiesWithinGroups?: boolean;

  /**
   * Custom property groups when using 'custom' strategy
   */
  propertyGroups?: string[][];

  /**
   * Whether to strip extra spaces from properties and values
   */
  stripSpaces?: boolean;

  /**
   * Whether to enforce tab size consistency
   */
  tabSize?: boolean;

  /**
   * Whether to use unitless zeros (e.g., 0 instead of 0px)
   */
  unitlessZero?: boolean;

  /**
   * Whether to align vendor-prefixed properties together
   */
  vendorPrefixAlign?: boolean;
}

/**
 * Result of a property sorting operation
 */
export interface SortingResult {
  /**
   * Whether the sorting operation was successful
   */
  success: boolean;

  /**
   * The original properties before sorting
   */
  originalProperties?: string[];

  /**
   * The sorted properties
   */
  sortedProperties?: string[];

  /**
   * Error message if the sorting was unsuccessful
   */
  error?: string;
}

/**
 * CSSComb compatibility type
 */
export interface CSSCombConfig {
  /**
   * Sorting order from CSSComb
   */
  'sort-order'?: (string | string[])[];

  /**
   * Whether to add empty lines between groups
   */
  'always-semicolon'?: boolean;

  /**
   * Other CSSComb options we might support
   */
  [key: string]: any;
}

/**
 * Convert CSSComb configuration to Old Fashioned sorting options
 * @param csscombConfig - The CSSComb configuration
 * @returns Old Fashioned sorting options
 */
export function convertCSSCombConfig(csscombConfig: CSSCombConfig): SortingOptions {
  if (!csscombConfig['sort-order']) {
    return {
      strategy: 'grouped',
      emptyLinesBetweenGroups: true,
      sortPropertiesWithinGroups: true
    };
  }

  // Convert CSSComb sort order to our property groups
  const propertyGroups: string[][] = [];

  csscombConfig['sort-order'].forEach(group => {
    if (Array.isArray(group)) {
      propertyGroups.push(group);
    } else if (typeof group === 'string') {
      propertyGroups.push([group]);
    }
  });

  return {
    strategy: 'custom',
    emptyLinesBetweenGroups: true,
    sortPropertiesWithinGroups: true,
    propertyGroups
  };
}