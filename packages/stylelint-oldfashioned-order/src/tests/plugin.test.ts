import { describe, expect, it } from 'vitest';
import stylelint from 'stylelint';
import plugin from '../index';
import { ruleName } from '../rules/oldfashioned-order';

/**
 * Helper to lint CSS using our plugin with stylelint.
 */
async function lint(
  code: string,
  strategy: string,
  options: {
    secondaryOptions?: Record<string, any>;
    fix?: boolean;
    customSyntax?: string;
  } = {}
) {
  const config: any = {
    plugins: plugin,
    rules: {
      [ruleName]: options.secondaryOptions
        ? [strategy, options.secondaryOptions]
        : [strategy],
    },
  };

  if (options.customSyntax) {
    config.customSyntax = options.customSyntax;
  }

  return stylelint.lint({
    code,
    config,
    fix: options.fix || false,
  });
}

describe('stylelint-oldfashioned-order plugin', () => {
  it('should export a rule', () => {
    expect(plugin).toBeDefined();
    expect(plugin).toHaveLength(1);
    expect(plugin[0].ruleName).toBe('oldfashioned-order/properties-order');
  });

  describe('violation detection — alphabetical strategy', () => {
    it('should detect out-of-order properties', async () => {
      const result = await lint(
        `.test {
          color: red;
          background: white;
          width: 100px;
        }`,
        'alphabetical'
      );

      expect(result.results[0].warnings).toHaveLength(1);
      expect(result.results[0].warnings[0].rule).toBe(ruleName);
    });

    it('should report no warnings when already sorted', async () => {
      const result = await lint(
        `.test {
          background: white;
          color: red;
          width: 100px;
        }`,
        'alphabetical'
      );

      expect(result.results[0].warnings).toHaveLength(0);
    });

    it('should report no warnings for a single property', async () => {
      const result = await lint(
        `.test {
          color: red;
        }`,
        'alphabetical'
      );

      expect(result.results[0].warnings).toHaveLength(0);
    });

    it('should report no warnings for an empty rule', async () => {
      const result = await lint(`.test {}`, 'alphabetical');

      expect(result.results[0].warnings).toHaveLength(0);
    });

    it('should skip custom properties (--var)', async () => {
      const result = await lint(
        `.test {
          --my-color: red;
          background: white;
          color: blue;
        }`,
        'alphabetical'
      );

      expect(result.results[0].warnings).toHaveLength(0);
    });
  });

  describe('violation detection — concentric strategy', () => {
    it('should detect out-of-order properties (concentric)', async () => {
      const result = await lint(
        `.test {
          color: red;
          display: block;
          position: absolute;
        }`,
        'concentric'
      );

      // position and display should come before color in concentric
      expect(result.results[0].warnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('violation detection — idiomatic strategy', () => {
    it('should detect out-of-order properties (idiomatic)', async () => {
      const result = await lint(
        `.test {
          color: red;
          display: block;
          position: absolute;
        }`,
        'idiomatic'
      );

      // position and display should come before color in idiomatic
      expect(result.results[0].warnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('autofix — alphabetical strategy', () => {
    it('should reorder properties alphabetically', async () => {
      const result = await lint(
        `.test {
          color: red;
          background: white;
          width: 100px;
        }`,
        'alphabetical',
        { fix: true }
      );

      const output = result.code || result.output;
      // After fix, background should come before color
      const bgIndex = output.indexOf('background');
      const colorIndex = output.indexOf('color');
      expect(bgIndex).toBeLessThan(colorIndex);
    });

    it('should not modify already sorted properties', async () => {
      const code = `.test {
          background: white;
          color: red;
          width: 100px;
        }`;

      const result = await lint(code, 'alphabetical', { fix: true });

      const output = result.code || result.output;
      const bgIndex = output.indexOf('background');
      const colorIndex = output.indexOf('color');
      const widthIndex = output.indexOf('width');
      expect(bgIndex).toBeLessThan(colorIndex);
      expect(colorIndex).toBeLessThan(widthIndex);
    });
  });

  describe('autofix — comment preservation', () => {
    it('should preserve comments above declarations during fix', async () => {
      const result = await lint(
        `.test {
          /* Text color */
          color: red;
          /* Background */
          background: white;
        }`,
        'alphabetical',
        { fix: true }
      );

      const output = result.code || result.output;
      // After sort: background (with its comment) should come before color
      const bgCommentIndex = output.indexOf('/* Background */');
      const bgIndex = output.indexOf('background');
      const colorCommentIndex = output.indexOf('/* Text color */');
      const colorIndex = output.indexOf('color');

      expect(bgCommentIndex).toBeLessThan(bgIndex);
      expect(bgIndex).toBeLessThan(colorCommentIndex);
      expect(colorCommentIndex).toBeLessThan(colorIndex);
    });

    it('should keep multiple consecutive comments with their declaration', async () => {
      const result = await lint(
        `.test {
          /* width is important */
          /* Keep it at 100px */
          width: 100px;
          background: white;
        }`,
        'alphabetical',
        { fix: true }
      );

      const output = result.code || result.output;
      const bgIndex = output.indexOf('background');
      const firstComment = output.indexOf('/* width is important */');
      const secondComment = output.indexOf('/* Keep it at 100px */');
      const widthIndex = output.indexOf('width: 100px');

      // background should come first (alphabetically)
      expect(bgIndex).toBeLessThan(firstComment);
      // Both comments should stay before width declaration
      expect(firstComment).toBeLessThan(secondComment);
      expect(secondComment).toBeLessThan(widthIndex);
    });
  });

  describe('SCSS support', () => {
    it('should handle SCSS syntax without errors', async () => {
      const result = await lint(
        `.test {
          $variable: value;
          color: red;
          background: white;
          width: 100px;
        }`,
        'alphabetical',
        { customSyntax: 'postcss-scss' }
      );

      expect(result).toBeDefined();
      // SCSS variables are skipped; remaining props should trigger a warning
      expect(result.results[0].warnings).toHaveLength(1);
    });

    it('should skip SCSS variables during sorting', async () => {
      const result = await lint(
        `.test {
          $primary: blue;
          background: white;
          color: red;
        }`,
        'alphabetical',
        { customSyntax: 'postcss-scss' }
      );

      // Already sorted (background, color) — no warnings
      expect(result.results[0].warnings).toHaveLength(0);
    });
  });

  describe('option validation', () => {
    it('should reject invalid strategy', async () => {
      const result = await lint(`.test { color: red; }`, 'invalid-strategy' as any);

      // Should have an invalidOptionWarning
      expect(
        result.results[0].invalidOptionWarnings.length > 0 ||
          result.results[0].warnings.some(
            (w: any) => w.text && w.text.includes('Invalid option')
          )
      ).toBe(true);
    });
  });
});
