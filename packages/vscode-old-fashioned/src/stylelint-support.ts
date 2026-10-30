/**
 * Stylelint setup shared by diagnostics and autofix
 *
 * The extension is bundled, so stylelint cannot resolve plugins or syntaxes by
 * package name at runtime. They are imported here and passed as objects.
 */
import postcssSass from 'postcss-sass';
import postcssScss from 'postcss-scss';
import oldFashionedPlugin from 'stylelint-oldfashioned-order';

export const oldFashionedRuleName = 'oldfashioned-order/properties-order';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stylelintPlugins: any = oldFashionedPlugin;

/**
 * Get the postcss syntax object for a parse syntax
 *
 * @param syntax - The parse syntax (css, scss, sass)
 * @returns The custom syntax, or undefined for plain CSS
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCustomSyntax(syntax: string): any {
  if (syntax === 'scss') {
    return postcssScss;
  }
  if (syntax === 'sass') {
    return postcssSass;
  }
  return undefined;
}
