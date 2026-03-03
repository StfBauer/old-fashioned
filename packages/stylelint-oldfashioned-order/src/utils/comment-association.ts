/**
 * Comment-Declaration Association for Stylelint Fix Mode
 *
 * Associates CSS comments with the declarations they describe,
 * so comments travel with their properties during sorting/reordering.
 */

import { ChildNode, Declaration, Comment, AtRule, Rule } from 'postcss';

/**
 * Associates a declaration with any leading comments that describe it.
 */
export interface DeclarationWithComments {
  leadingComments: ChildNode[];
  declaration: Declaration;
}

/**
 * Walk nodes sequentially and associate each comment with the declaration
 * that immediately follows it. A comment "belongs to" the next declaration.
 *
 * Returns only regular declarations (skips --custom-props and $sass-vars).
 * Non-declaration nodes (atrules, nested rules, etc.) are returned separately.
 */
export function associateCommentsWithDeclarations(
  nodes: readonly ChildNode[]
): {
  declarationsWithComments: DeclarationWithComments[];
  otherNodes: ChildNode[];
} {
  const declarationsWithComments: DeclarationWithComments[] = [];
  const otherNodes: ChildNode[] = [];
  let pendingComments: ChildNode[] = [];

  for (const node of nodes) {
    if (node.type === 'comment') {
      pendingComments.push(node);
      continue;
    }

    if (node.type === 'decl') {
      const decl = node as Declaration;
      const prop = typeof decl.prop === 'string' ? decl.prop : '';

      // Skip custom props and SASS variables — they stay in otherNodes
      if (prop.startsWith('--') || prop.startsWith('$')) {
        otherNodes.push(...pendingComments);
        pendingComments = [];
        otherNodes.push(node);
      } else {
        declarationsWithComments.push({
          leadingComments: pendingComments,
          declaration: decl,
        });
        pendingComments = [];
      }
    } else {
      // atrule, rule, or other node type
      otherNodes.push(...pendingComments);
      pendingComments = [];
      otherNodes.push(node);
    }
  }

  // Any remaining pending comments go to otherNodes
  otherNodes.push(...pendingComments);

  return { declarationsWithComments, otherNodes };
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
  }
  return result;
}
