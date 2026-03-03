import stylelint from 'stylelint';
import { sortProperties } from '@old-fashioned/shared';
import { Root, Result, Declaration, ChildNode } from 'postcss';
import {
  associateCommentsWithDeclarations,
  flattenDeclarationsWithComments,
  DeclarationWithComments,
} from '../utils/comment-association';

// Define rule name according to stylelint conventions
export const ruleName = 'oldfashioned-order/properties-order';

// Get the appropriate utils based on stylelint version (compatible with v14-16)
const utils = 'utils' in stylelint ? stylelint.utils : require('stylelint/lib/utils');

// Create rule messages
export const messages = utils.ruleMessages(ruleName, {
  expected: (unfixed: string, fixed: string) =>
    `Expected properties to be sorted (${ruleName}). Current order: ${unfixed}`,
});

/**
 * Rule implementation — detects out-of-order CSS properties and
 * optionally fixes them in autofix mode.
 */
function rule(
  primaryOption: string,
  secondaryOptions?: Record<string, any>,
  context?: { fix?: boolean }
) {
  const options = {
    strategy: primaryOption as any,
    ...(secondaryOptions || {}),
  };

  return (root: Root, result: Result) => {
    // Validate options
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOption,
        possible: ['alphabetical', 'concentric', 'idiomatic', 'custom'],
      },
      {
        actual: secondaryOptions,
        possible: {
          emptyLinesBetweenGroups: [true, false],
          sortPropertiesWithinGroups: [true, false],
        },
        optional: true,
      }
    );

    if (!validOptions) {
      return;
    }

    // Check fix mode from context (v15+) or result.opts (v14 compat)
    const isFixMode =
      (context && context.fix) || (result.opts as any)?.fix === true;

    root.walkRules((ruleNode) => {
      if (!ruleNode.nodes || ruleNode.nodes.length === 0) {
        return;
      }

      // Extract regular declarations (skip --custom-props and $sass-vars)
      const declarations: Declaration[] = [];
      for (const node of ruleNode.nodes) {
        if (node.type === 'decl') {
          const decl = node as Declaration;
          const prop = typeof decl.prop === 'string' ? decl.prop : '';
          if (!prop.startsWith('--') && !prop.startsWith('$')) {
            declarations.push(decl);
          }
        }
      }

      // Nothing to sort if fewer than 2 declarations
      if (declarations.length < 2) {
        return;
      }

      // Get current property order
      const currentOrder = declarations.map((d) => d.prop);

      // Get expected sorted order using shared sorting logic
      const sortingResult = sortProperties(currentOrder, options);

      if (!sortingResult.success || !sortingResult.sortedProperties) {
        return;
      }

      // Filter out empty-line markers from the sorted result
      const expectedOrder = sortingResult.sortedProperties.filter(
        (p: string) => p !== ''
      );

      // Compare current order vs expected order
      const isAlreadySorted = currentOrder.every(
        (prop, i) => prop === expectedOrder[i]
      );

      if (isAlreadySorted) {
        return;
      }

      // --- Fix mode: reorder declarations with comment preservation ---
      if (isFixMode) {
        fixRuleOrder(ruleNode, options);
        return;
      }

      // --- Report mode: emit one violation per rule block ---
      const currentSummary = currentOrder.slice(0, 5).join(', ');
      const expectedSummary = expectedOrder.slice(0, 5).join(', ');

      utils.report({
        message: messages.expected(currentSummary, expectedSummary),
        node: declarations[0],
        result,
        ruleName,
      });
    });
  };
}

/**
 * Fix the property order within a rule node, preserving comments.
 */
function fixRuleOrder(
  ruleNode: { nodes: ChildNode[] },
  options: Record<string, any>
): void {
  const { declarationsWithComments, otherNodes } =
    associateCommentsWithDeclarations(ruleNode.nodes);

  if (declarationsWithComments.length < 2) {
    return;
  }

  // Sort declarations using shared logic
  const sorted = sortDeclarationsForFix(declarationsWithComments, options);

  // Rebuild node list: sorted declarations first, then other nodes
  // We preserve original relative order of non-declaration nodes by
  // reinserting them at their approximate positions.
  const flatSorted = flattenDeclarationsWithComments(sorted);

  // Simple strategy: sorted declarations, then all other nodes in original order
  ruleNode.nodes = [...flatSorted, ...otherNodes];
}

/**
 * Sort DeclarationWithComments using the shared sortProperties logic.
 */
function sortDeclarationsForFix(
  items: DeclarationWithComments[],
  options: Record<string, any>
): DeclarationWithComments[] {
  if (items.length <= 1) {
    return items;
  }

  const propNames = items.map((item) => item.declaration.prop);
  const sortingResult = sortProperties(propNames, options);

  if (!sortingResult.success || !sortingResult.sortedProperties) {
    return items;
  }

  // Build a position map from sorted properties (skip empty line markers)
  const sortedProps = sortingResult.sortedProperties.filter(
    (p: string) => p !== ''
  );
  const positionMap = new Map<string, number[]>();
  sortedProps.forEach((prop: string, index: number) => {
    if (!positionMap.has(prop)) {
      positionMap.set(prop, []);
    }
    positionMap.get(prop)!.push(index);
  });

  // Track usage of positions for duplicate property names
  const usedPositions = new Map<string, number>();

  const indexed = items.map((item, originalIndex) => {
    const prop = item.declaration.prop;
    const positions = positionMap.get(prop);
    let sortIndex: number;

    if (positions && positions.length > 0) {
      const usageCount = usedPositions.get(prop) || 0;
      sortIndex = positions[Math.min(usageCount, positions.length - 1)];
      usedPositions.set(prop, usageCount + 1);
    } else {
      sortIndex = Number.MAX_SAFE_INTEGER;
    }

    return { item, sortIndex, originalIndex };
  });

  // Stable sort: by sortIndex, then originalIndex for ties
  indexed.sort((a, b) => {
    if (a.sortIndex !== b.sortIndex) {
      return a.sortIndex - b.sortIndex;
    }
    return a.originalIndex - b.originalIndex;
  });

  return indexed.map((entry) => entry.item);
}

// Add required meta properties to the rule
rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = {
  url: 'https://github.com/n8design/old-fashioned/tree/main/packages/stylelint-oldfashioned-order',
  fixable: true,
};

export default rule;
