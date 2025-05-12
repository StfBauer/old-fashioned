/**
 * SCSS-specific processing for Old Fashioned Stylelint plugin
 * 
 * This processor handles SCSS-specific syntax like variables, mixins, and nested rules
 */

import { Rule, Node, Declaration, Comment, AtRule } from 'postcss';
import { SortingOptions } from '@old-fashioned/shared';

/**
 * Get a processor function that handles SCSS-specific syntax
 */
export function getScssProcessor(options: SortingOptions) {
  return (rule: Rule): void => {
    // Process SCSS top-level at-rules (@use, @forward, @property)
    processTopLevelAtRules(rule);

    // Process SCSS variables in rules
    processScssVariables(rule);

    // Process nested SCSS rules
    processNestedRules(rule);

    // Process SCSS mixins and includes
    processScssDirectives(rule);
  };
}

/**
 * Process top-level at-rules, making sure they're in the correct order:
 * 1. @use directives
 * 2. @forward directives
 * 3. @property directives
 */
function processTopLevelAtRules(rule: Rule): void {
  const useDirectives: AtRule[] = [];
  const forwardDirectives: AtRule[] = [];
  const propertyRules: AtRule[] = [];
  const cssVariables: Declaration[] = [];
  const otherNodes: Node[] = [];

  // First pass: categorize all nodes
  rule.nodes?.forEach(node => {
    if (node.type === 'atrule') {
      const atRule = node as AtRule;
      if (atRule.name === 'use') {
        useDirectives.push(atRule);
      } else if (atRule.name === 'forward') {
        forwardDirectives.push(atRule);
      } else if (atRule.name === 'property') {
        propertyRules.push(atRule);
      } else {
        otherNodes.push(node);
      }
    } else if (node.type === 'decl' && (node as Declaration).prop.startsWith('--')) {
      // Collect CSS variables (custom properties)
      cssVariables.push(node as Declaration);
    } else {
      otherNodes.push(node);
    }
  });

  // If we have any of the special at-rules or CSS variables, reorder them
  if (useDirectives.length > 0 || forwardDirectives.length > 0 || propertyRules.length > 0 || cssVariables.length > 0) {
    // Remove all nodes
    rule.removeAll();

    // Add back in the correct order:
    // 1. @use and @forward directives
    useDirectives.forEach(node => rule.append(node));
    forwardDirectives.forEach(node => rule.append(node));

    // Add an empty line after @use/@forward if they exist and we have @property rules
    if ((useDirectives.length > 0 || forwardDirectives.length > 0) &&
      (propertyRules.length > 0 || cssVariables.length > 0)) {
      rule.append({ type: 'comment', text: ' ' } as Comment);
    }

    // 2. @property rules
    propertyRules.forEach(node => rule.append(node));

    // Add an empty line after @property rules if they exist and we have CSS variables
    if (propertyRules.length > 0 && cssVariables.length > 0) {
      rule.append({ type: 'comment', text: ' ' } as Comment);
    }

    // 3. CSS variables (custom properties)
    cssVariables.forEach(node => rule.append(node));

    // Add an empty line after CSS variables if they exist and we have other nodes
    if (cssVariables.length > 0 && otherNodes.length > 0) {
      rule.append({ type: 'comment', text: ' ' } as Comment);
    } else if (propertyRules.length > 0 && cssVariables.length === 0 && otherNodes.length > 0) {
      // Add an empty line after @property rules if there are no CSS variables but other nodes exist
      rule.append({ type: 'comment', text: ' ' } as Comment);
    }

    // 4. All other nodes
    otherNodes.forEach(node => rule.append(node));
  }
}

/**
 * Process SCSS variables ($var: value) which should be grouped at the top
 */
function processScssVariables(rule: Rule): void {
  const variables: Node[] = [];
  const nonVariables: Node[] = [];

  rule.nodes?.forEach(node => {
    if (node.type === 'decl' && (node as Declaration).prop.startsWith('$')) {
      variables.push(node);
    } else {
      nonVariables.push(node);
    }
  });

  // If we found variables, reorder nodes to put variables at the top
  if (variables.length > 0) {
    // Remove all nodes
    rule.removeAll();

    // Add back variables first, then other declarations
    variables.forEach(node => rule.append(node));

    // Add an empty line between variables and other declarations if needed
    if (nonVariables.length > 0) {
      rule.append({ type: 'comment', text: ' ' } as Comment);
    }

    nonVariables.forEach(node => rule.append(node));
  }
}

/**
 * Process nested SCSS rules
 */
function processNestedRules(rule: Rule): void {
  // Find all nested rules
  const nestedRules: Rule[] = [];
  rule.each(node => {
    if (node.type === 'rule') {
      nestedRules.push(node as Rule);
    }
  });

  // Process each nested rule recursively
  nestedRules.forEach(nestedRule => {
    processTopLevelAtRules(nestedRule); // Process @property in nested rules too
    processScssVariables(nestedRule);
    processNestedRules(nestedRule);
    processScssDirectives(nestedRule);
  });
}

/**
 * Process SCSS directives like @include, @extend, etc.
 */
function processScssDirectives(rule: Rule): void {
  const includes: AtRule[] = [];
  const extends_: AtRule[] = [];
  const otherAtRules: AtRule[] = [];
  const declarations: Declaration[] = [];
  const otherNodes: Node[] = [];

  rule.nodes?.forEach(node => {
    if (node.type === 'atrule') {
      const atRule = node as AtRule;
      if (atRule.name === 'include') {
        includes.push(atRule);
      } else if (atRule.name === 'extend') {
        extends_.push(atRule);
      } else {
        otherAtRules.push(atRule);
      }
    } else if (node.type === 'decl') {
      declarations.push(node as Declaration);
    } else if (node.type !== 'rule') { // Skip nested rules as they're handled separately
      otherNodes.push(node);
    }
  });

  // If we need to reorder, remove all nodes and add them back in the correct order
  if (includes.length > 0 || extends_.length > 0) {
    // Save nested rules first (we don't want to reorder these)
    const nestedRules: Rule[] = [];
    rule.each(node => {
      if (node.type === 'rule') {
        nestedRules.push(node as Rule);
        node.remove();
      }
    });

    // Remove all nodes except nested rules (which were already removed)
    rule.removeAll();

    // Add back in preferred order:
    // 1. @extend directives
    extends_.forEach(node => rule.append(node));

    // 2. @include directives
    includes.forEach(node => rule.append(node));

    // 3. Other at-rules
    otherAtRules.forEach(node => rule.append(node));

    // 4. Declarations (which will be handled by the main sorting algorithm)
    declarations.forEach(node => rule.append(node));

    // 5. Other nodes
    otherNodes.forEach(node => rule.append(node));

    // 6. Nested rules at the end
    nestedRules.forEach(node => rule.append(node));
  }
}
