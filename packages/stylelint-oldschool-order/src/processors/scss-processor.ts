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
    // Process SCSS variables in rules
    processScssVariables(rule);

    // Process nested SCSS rules
    processNestedRules(rule);

    // Process SCSS mixins and includes
    processScssDirectives(rule);
  };
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
