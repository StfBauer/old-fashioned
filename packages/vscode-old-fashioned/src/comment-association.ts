/**
 * Comment-Declaration Association
 *
 * Associates CSS comments with the declarations they describe,
 * so comments travel with their properties during sorting.
 */

import * as postcss from 'postcss';
import { sortProperties } from '@old-fashioned/shared';

/**
 * Associates a declaration with the comments that describe it: full-line
 * comments above it and inline comments on the same line after it.
 */
export interface DeclarationWithComments {
  leadingComments: postcss.ChildNode[];
  declaration: postcss.Declaration;
  trailingComments: postcss.ChildNode[];
}

/**
 * Result of categorizing nodes within a CSS rule.
 */
export interface NodeCategorizationResult {
  declarationsWithComments: DeclarationWithComments[];
  customPropsWithComments: DeclarationWithComments[];
  sassVarsWithComments: DeclarationWithComments[];
  topComments: postcss.ChildNode[];
  trailingComments: postcss.ChildNode[];
  mediaAtRules: postcss.ChildNode[];
  includeAtRules: postcss.ChildNode[];
  otherAtRules: postcss.ChildNode[];
  nestedRules: postcss.ChildNode[];
  otherNodes: postcss.ChildNode[];
}

/**
 * Check whether a comment starts on the same line as whatever precedes it.
 */
function isInlineComment(comment: postcss.ChildNode): boolean {
  return !(comment.raws.before || '').includes('\n');
}

/**
 * Walk nodes sequentially and associate each comment with its declaration.
 * An inline comment belongs to the node before it; a full-line comment
 * belongs to the next declaration.
 */
export function categorizeNodesWithComments(nodes: readonly postcss.ChildNode[]): NodeCategorizationResult {
  const result: NodeCategorizationResult = {
    declarationsWithComments: [],
    customPropsWithComments: [],
    sassVarsWithComments: [],
    topComments: [],
    trailingComments: [],
    mediaAtRules: [],
    includeAtRules: [],
    otherAtRules: [],
    nestedRules: [],
    otherNodes: [],
  };

  let pendingComments: postcss.ChildNode[] = [];
  // What an inline comment attaches to: the previous declaration or category
  let previousDeclaration: DeclarationWithComments | undefined;
  let previousCategory: postcss.ChildNode[] | undefined;
  let atBlockStart = true;

  for (const node of nodes) {
    if (node.type === 'comment') {
      if (isInlineComment(node) && atBlockStart) {
        result.topComments.push(node);
      } else if (isInlineComment(node) && previousDeclaration) {
        previousDeclaration.trailingComments.push(node);
      } else if (isInlineComment(node) && previousCategory) {
        previousCategory.push(node);
      } else {
        atBlockStart = false;
        previousDeclaration = undefined;
        previousCategory = undefined;
        pendingComments.push(node);
      }
      continue;
    }

    atBlockStart = false;
    previousDeclaration = undefined;
    previousCategory = undefined;

    if (node.type === 'decl') {
      const decl = node as postcss.Declaration;
      const prop = typeof decl.prop === 'string' ? decl.prop : '';

      previousDeclaration = {
        leadingComments: pendingComments,
        declaration: decl,
        trailingComments: [],
      };
      if (prop.startsWith('--')) {
        result.customPropsWithComments.push(previousDeclaration);
      } else if (prop.startsWith('$')) {
        result.sassVarsWithComments.push(previousDeclaration);
      } else {
        result.declarationsWithComments.push(previousDeclaration);
      }
      pendingComments = [];
    } else if (node.type === 'atrule') {
      result.trailingComments.push(...pendingComments);
      pendingComments = [];

      const atRule = node as postcss.AtRule;
      if (atRule.name === 'media') {
        previousCategory = result.mediaAtRules;
      } else if (atRule.name === 'include') {
        previousCategory = result.includeAtRules;
      } else {
        previousCategory = result.otherAtRules;
      }
      previousCategory.push(node);
    } else if (node.type === 'rule') {
      result.trailingComments.push(...pendingComments);
      pendingComments = [];
      previousCategory = result.nestedRules;
      previousCategory.push(node);
    } else {
      result.trailingComments.push(...pendingComments);
      pendingComments = [];
      previousCategory = result.otherNodes;
      previousCategory.push(node);
    }
  }

  // Any comments left at the end are trailing
  result.trailingComments.push(...pendingComments);

  return result;
}

/**
 * Sort DeclarationWithComments using the shared sortProperties logic.
 * Comments travel with their associated declarations.
 */
export function sortDeclarationsWithComments(
  items: DeclarationWithComments[],
  options: any
): DeclarationWithComments[] {
  if (items.length <= 1) {
    return items;
  }

  const propNames = items.map(item => item.declaration.prop);
  const sortingResult = sortProperties(propNames, options);

  if (!sortingResult.success || !sortingResult.sortedProperties) {
    return items;
  }

  // Build a position map from sorted properties (skip empty line markers)
  const sortedProps = sortingResult.sortedProperties.filter((p: string) => p !== '');
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

  return indexed.map(entry => entry.item);
}

/**
 * Flatten DeclarationWithComments back to a flat node array.
 */
export function flattenDeclarationsWithComments(items: DeclarationWithComments[]): postcss.ChildNode[] {
  const result: postcss.ChildNode[] = [];
  for (const item of items) {
    for (const comment of item.leadingComments) {
      result.push(comment);
    }
    result.push(item.declaration);
    for (const comment of item.trailingComments) {
      result.push(comment);
    }
  }
  return result;
}
