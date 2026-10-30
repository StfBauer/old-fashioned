import { describe, expect, it } from 'vitest';
import stylelint from 'stylelint';
import postcssScss from 'postcss-scss';
import plugin from '../index';
import { ruleName } from '../rules/oldfashioned-order';

async function fix(code: string): Promise<string> {
  const result = await stylelint.lint({
    code,
    fix: true,
    config: {
      plugins: plugin as any,
      rules: { [ruleName]: ['alphabetical'] },
      customSyntax: postcssScss as any,
    },
  });
  return result.code as string;
}

describe('comment preservation in fix mode', () => {
  it('keeps inline comments on the same line as their own property', async () => {
    const result = await fix(`.test {
  margin: 0; // about margin
  // about color
  color: red; // color inline
}`);

    expect(result).toBe(`.test {
  // about color
  color: red; // color inline
  margin: 0; // about margin
}`);
  });

  it('keeps a comment on the opening brace line at the top of the block', async () => {
    const result = await fix(`.test { // block note
  width: 1px;
  color: red;
}`);

    expect(result).toBe(`.test { // block note
  color: red;
  width: 1px;
}`);
  });

  it('keeps an inline comment after a custom property with that property', async () => {
    const result = await fix(`.test {
  --a: 1; // about a
  width: 1px;
  color: red;
}`);

    expect(result).toContain('--a: 1; // about a');
    expect(result).toMatch(/color: red;\n\s*width: 1px;/);
  });
});
