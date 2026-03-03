/**
 * Tests for comment preservation during CSS property sorting.
 * Verifies that comments stay associated with their declarations
 * when properties are reordered.
 */

import { describe, it, expect } from 'vitest';
import * as postcss from 'postcss';
import * as postcssScss from 'postcss-scss';
import {
  categorizeNodesWithComments,
  sortDeclarationsWithComments,
  flattenDeclarationsWithComments,
} from '../src/comment-association';

/**
 * Helper: parse CSS, sort a rule's declarations with comment preservation,
 * and return the stringified result.
 */
function sortWithComments(css: string, options: any = { strategy: 'alphabetical' }, lang: string = 'css'): string {
  const root = lang === 'css' ? postcss.parse(css) : postcssScss.parse(css);

  root.walkRules((rule) => {
    const categorized = categorizeNodesWithComments(rule.nodes);
    const sortedDecls = sortDeclarationsWithComments(
      categorized.declarationsWithComments,
      options
    );

    rule.nodes = [
      ...categorized.topComments,
      ...flattenDeclarationsWithComments(categorized.customPropsWithComments),
      ...flattenDeclarationsWithComments(categorized.sassVarsWithComments),
      ...flattenDeclarationsWithComments(sortedDecls),
      ...categorized.includeAtRules,
      ...categorized.otherAtRules,
      ...categorized.trailingComments,
      ...categorized.nestedRules,
      ...categorized.otherNodes,
      ...categorized.mediaAtRules,
    ];
  });

  return root.toString();
}

describe('Comment Preservation', () => {

  it('should keep a full-line comment above its declaration after sort', () => {
    const input = `.test {
  /* Color description */
  color: red;
  background: white;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const bgIndex = lines.findIndex(l => l.startsWith('background'));
    const colorCommentIndex = lines.findIndex(l => l.includes('Color description'));
    const colorIndex = lines.findIndex(l => l.startsWith('color'));

    // background comes before color alphabetically
    expect(bgIndex).toBeLessThan(colorIndex);
    // comment stays directly above color
    expect(colorCommentIndex).toBe(colorIndex - 1);
  });

  it('should keep multiple consecutive comments above their declaration', () => {
    const input = `.test {
  /* First comment */
  /* Second comment */
  color: red;
  background: white;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const colorIndex = lines.findIndex(l => l.startsWith('color'));
    const firstComment = lines.findIndex(l => l.includes('First comment'));
    const secondComment = lines.findIndex(l => l.includes('Second comment'));

    // Both comments stay before color, in order
    expect(firstComment).toBeLessThan(secondComment);
    expect(secondComment).toBe(colorIndex - 1);
  });

  it('should move comments with their declarations when sorted', () => {
    const input = `.test {
  /* Z property comment */
  z-index: 1;
  /* Background comment */
  background: blue;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const bgCommentIndex = lines.findIndex(l => l.includes('Background comment'));
    const bgIndex = lines.findIndex(l => l.startsWith('background'));
    const zCommentIndex = lines.findIndex(l => l.includes('Z property comment'));
    const zIndex = lines.findIndex(l => l.startsWith('z-index'));

    // background should come before z-index alphabetically
    expect(bgIndex).toBeLessThan(zIndex);
    // Each comment stays with its declaration
    expect(bgCommentIndex).toBe(bgIndex - 1);
    expect(zCommentIndex).toBe(zIndex - 1);
  });

  it('should keep a comment above the first declaration with that declaration after sort', () => {
    const input = `.test {
  /* Describes color */
  color: red;
  background: white;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const comment = lines.findIndex(l => l.includes('Describes color'));
    const colorIndex = lines.findIndex(l => l.startsWith('color'));

    // background sorts first; the comment stays with color, not pinned at the top
    expect(comment).toBe(colorIndex - 1);
  });

  it('should preserve comments above CSS custom properties', () => {
    const input = `.test {
  color: red;
  /* Theme color */
  --primary: blue;
  background: white;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const themeComment = lines.findIndex(l => l.includes('Theme color'));
    const customPropIndex = lines.findIndex(l => l.startsWith('--primary'));

    // Comment stays with custom property
    expect(themeComment).toBe(customPropIndex - 1);
  });

  it('should handle SCSS single-line comments', () => {
    const input = `.test {
  // Z-index comment
  z-index: 1;
  // Background comment
  background: blue;
}`;

    const result = sortWithComments(input, { strategy: 'alphabetical' }, 'scss');
    const lines = result.split('\n').map(l => l.trim());
    const bgCommentIndex = lines.findIndex(l => l.includes('Background comment'));
    const bgIndex = lines.findIndex(l => l.startsWith('background'));
    const zCommentIndex = lines.findIndex(l => l.includes('Z-index comment'));
    const zIndex = lines.findIndex(l => l.startsWith('z-index'));

    expect(bgIndex).toBeLessThan(zIndex);
    expect(bgCommentIndex).toBe(bgIndex - 1);
    expect(zCommentIndex).toBe(zIndex - 1);
  });

  it('should handle trailing comments after all declarations', () => {
    const input = `.test {
  color: red;
  background: white;
  /* Trailing note */
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const trailingIndex = lines.findIndex(l => l.includes('Trailing note'));
    const bgIndex = lines.findIndex(l => l.startsWith('background'));
    const colorIndex = lines.findIndex(l => l.startsWith('color'));

    // Trailing comment comes after all declarations
    expect(trailingIndex).toBeGreaterThan(bgIndex);
    expect(trailingIndex).toBeGreaterThan(colorIndex);
  });

  it('should handle empty rules with only comments', () => {
    const input = `.test {
  /* Only a comment */
}`;

    const result = sortWithComments(input);
    expect(result).toContain('Only a comment');
  });

  it('should handle rules with no comments', () => {
    const input = `.test {
  z-index: 1;
  color: red;
  background: white;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());
    const bgIndex = lines.findIndex(l => l.startsWith('background'));
    const colorIndex = lines.findIndex(l => l.startsWith('color'));
    const zIndex = lines.findIndex(l => l.startsWith('z-index'));

    expect(bgIndex).toBeLessThan(colorIndex);
    expect(colorIndex).toBeLessThan(zIndex);
  });

  it('should preserve interleaved comments between groups', () => {
    const input = `.test {
  /* Width comment */
  width: 100px;
  /* Display comment */
  display: flex;
  /* Color comment */
  color: red;
}`;

    const result = sortWithComments(input);
    const lines = result.split('\n').map(l => l.trim());

    // Alphabetical: color < display < width
    const colorComment = lines.findIndex(l => l.includes('Color comment'));
    const colorIndex = lines.findIndex(l => l.startsWith('color'));
    const displayComment = lines.findIndex(l => l.includes('Display comment'));
    const displayIndex = lines.findIndex(l => l.startsWith('display'));
    const widthComment = lines.findIndex(l => l.includes('Width comment'));
    const widthIndex = lines.findIndex(l => l.startsWith('width'));

    expect(colorIndex).toBeLessThan(displayIndex);
    expect(displayIndex).toBeLessThan(widthIndex);
    expect(colorComment).toBe(colorIndex - 1);
    expect(displayComment).toBe(displayIndex - 1);
    expect(widthComment).toBe(widthIndex - 1);
  });
});
