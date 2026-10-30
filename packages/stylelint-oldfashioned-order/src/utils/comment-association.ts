/**
 * Comment-Declaration Association for Stylelint Fix Mode
 *
 * Associates CSS comments with the declarations they describe,
 * so comments travel with their properties during sorting/reordering.
 */

import { ChildNode, Declaration, Comment, AtRule, Rule } from 'postcss';

/**
 * Associates a declaration with the comments that describe it: full-line
 * comments above it and inline comments on the same line after it.
 */
export interface DeclarationWithComments {
  leadingComments: ChildNode[];
  declaration: Declaration;
  trailingComments: ChildNode[];
}

/**
 * Check whether a comment starts on the same line as whatever precedes it.
 */
function isInlineComment(comment: ChildNode): boolean {
  return !(comment.raws.before || '').includes('\n');
}

/**
 * Walk nodes sequentially and associate each comment with its declaration.
 * An inline comment belongs to the node before it; a full-line comment
 * belongs to the next declaration.
 *
 * Returns only regular declarations (skips --custom-props and $sass-vars).
 * Non-declaration nodes (atrules, nested rules, etc.) are returned separately.
 */
export function associateCommentsWithDeclarations(
  nodes: readonly ChildNode[]
): {
  declarationsWithComments: DeclarationWithComments[];
  topComments: ChildNode[];
  otherNodes: ChildNode[];
} {
  const declarationsWithComments: DeclarationWithComments[] = [];
  const topComments: ChildNode[] = [];
  const otherNodes: ChildNode[] = [];
  let pendingComments: ChildNode[] = [];
  let previousDeclaration: DeclarationWithComments | undefined;
  let previousInOtherNodes = false;
  let atBlockStart = true;

  for (const node of nodes) {
    if (node.type === 'comment') {
      if (isInlineComment(node) && atBlockStart) {
        topComments.push(node);
      } else if (isInlineComment(node) && previousDeclaration) {
        previousDeclaration.trailingComments.push(node);
      } else if (isInlineComment(node) && previousInOtherNodes) {
        otherNodes.push(node);
      } else {
        atBlockStart = false;
        previousDeclaration = undefined;
        previousInOtherNodes = false;
        pendingComments.push(node);
      }
      continue;
    }

    atBlockStart = false;
    previousDeclaration = undefined;
    previousInOtherNodes = false;

    if (node.type === 'decl') {
      const decl = node as Declaration;
      const prop = typeof decl.prop === 'string' ? decl.prop : '';

      // Skip custom props and SASS variables — they stay in otherNodes
      if (prop.startsWith('--') || prop.startsWith('$')) {
        otherNodes.push(...pendingComments);
        pendingComments = [];
        otherNodes.push(node);
        previousInOtherNodes = true;
      } else {
        previousDeclaration = {
          leadingComments: pendingComments,
          declaration: decl,
          trailingComments: [],
        };
        declarationsWithComments.push(previousDeclaration);
        pendingComments = [];
      }
    } else {
      // atrule, rule, or other node type
      otherNodes.push(...pendingComments);
      pendingComments = [];
      otherNodes.push(node);
      previousInOtherNodes = true;
    }
  }

  // Any remaining pending comments go to otherNodes
  otherNodes.push(...pendingComments);

  return { declarationsWithComments, topComments, otherNodes };
}

/**
 * Flatten DeclarationWithComments back to a flat node array.
 */
export function flattenDeclarationsWithComments(
  items: DeclarationWithComments[]
): ChildNode[] {
  const result: ChildNode[] = [];
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
