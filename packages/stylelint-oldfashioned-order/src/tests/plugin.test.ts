import { describe, it, expect, beforeEach } from 'vitest';
import stylelint from 'stylelint';
// Use require instead of import for CommonJS module
const plugin = require('../index');

describe('stylelint-oldfashioned-order plugin', () => {
  describe('basic functionality', () => {
    it('should detect unordered properties with alphabetical strategy', async () => {
      const result = await stylelint.lint({
        code: `
          .test {
            width: 100px;
            background: blue;
            color: red;
          }
        `,
        config: {
          plugins: [plugin],
          rules: {
            'plugin/oldfashioned-order': [
              true,
              {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
              }
            ]
          }
        }
      });

      expect(result.errored).toBe(true);
      expect(result.results[0].warnings.length).toBeGreaterThan(0);
      expect(result.results[0].warnings[0].rule).toBe('plugin/oldfashioned-order');
    });

    it('should auto-fix unordered properties with alphabetical strategy', async () => {
      const result = await stylelint.lint({
        code: `
          .test {
            width: 100px;
            background: blue;
            color: red;
          }
        `,
        config: {
          plugins: [plugin],
          rules: {
            'plugin/oldfashioned-order': [
              true,
              {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
              }
            ]
          }
        },
        fix: true
      });

      expect(result.output).toContain('background');
      expect(result.output.indexOf('background')).toBeLessThan(result.output.indexOf('color'));
      expect(result.output.indexOf('color')).toBeLessThan(result.output.indexOf('width'));
    });

    it('should handle SCSS syntax', async () => {
      const result = await stylelint.lint({
        code: `
          .test {
            $color: red;
            width: 100px;
            background: blue;
            color: $color;
          }
        `,
        config: {
          plugins: [plugin],
          rules: {
            'plugin/oldfashioned-order': [
              true,
              {
                strategy: 'alphabetical',
                emptyLinesBetweenGroups: false,
                sortPropertiesWithinGroups: true
              }
            ]
          }
        },
        customSyntax: 'postcss-scss',
        fix: true
      });

      // SCSS variables should be preserved at the top
      expect(result.output).toContain('$color');
      expect(result.output.indexOf('$color')).toBeLessThan(result.output.indexOf('background'));

      // Properties should be sorted alphabetically
      expect(result.output.indexOf('background')).toBeLessThan(result.output.indexOf('color'));
      expect(result.output.indexOf('color')).toBeLessThan(result.output.indexOf('width'));
    });

    it('should add empty lines between groups when requested', async () => {
      const result = await stylelint.lint({
        code: `
          .test {
            color: red;
            position: absolute;
            width: 100px;
          }
        `,
        config: {
          plugins: [plugin],
          rules: {
            'plugin/oldfashioned-order': [
              true,
              {
                strategy: 'grouped',
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: false
              }
            ]
          }
        },
        fix: true
      });

      // Should have empty lines between different groups
      expect(result.output).toMatch(/position: absolute;[\s\n]+.*width: 100px;/);
      expect(result.output).toMatch(/width: 100px;[\s\n]+.*color: red;/);
    });
  });
});
