/**
 * Stylelint setup shared by diagnostics and autofix
 *
 * The extension is bundled, so stylelint cannot resolve plugins or syntaxes by
 * package name at runtime. They are imported here and passed as objects.
 */
import * as path from 'path';
import * as vscode from 'vscode';
import postcssSass from 'postcss-sass';
import postcssScss from 'postcss-scss';
import stylelint from 'stylelint';
import oldFashionedPlugin from 'stylelint-oldfashioned-order';
import { findStylelintConfig, getDocumentSortingOptions } from './config-loader';
import { getParseSyntax } from './utils';

export const oldFashionedRuleName = 'oldfashioned-order/properties-order';

// Names config-loader.ts also accepts in project configs; the plugin only registers oldFashionedRuleName
const LEGACY_RULE_NAMES = ['plugin/oldfashioned-order', 'plugin/oldschool-order', 'oldschool/order'];
const VALID_STRATEGIES = ['alphabetical', 'concentric', 'idiomatic', 'custom'];

/**
 * Get the postcss syntax object for a parse syntax
 *
 * @param syntax - The parse syntax (css, scss, sass)
 * @returns The custom syntax, or undefined for plain CSS
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCustomSyntax(syntax: string): any {
  if (syntax === 'scss') {
    return postcssScss;
  }
  if (syntax === 'sass') {
    return postcssSass;
  }
  return undefined;
}

/**
 * Build the order rule setting from the options that apply to a document
 */
function getOrderRuleSetting(document: vscode.TextDocument): unknown[] {
  const { options } = getDocumentSortingOptions(document);
  const strategy = VALID_STRATEGIES.includes(options.strategy) ? options.strategy : 'alphabetical';
  const secondaryOptions: Record<string, boolean> = {};
  if (typeof options.emptyLinesBetweenGroups === 'boolean') {
    secondaryOptions.emptyLinesBetweenGroups = options.emptyLinesBetweenGroups;
  }
  if (typeof options.sortPropertiesWithinGroups === 'boolean') {
    secondaryOptions.sortPropertiesWithinGroups = options.sortPropertiesWithinGroups;
  }
  return [strategy, secondaryOptions];
}

/**
 * Find the project's stylelint config for a document, if it should be used
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadProjectConfig(document: vscode.TextDocument): Promise<{ config: any; configBasedir: string } | undefined> {
  const useProjectConfig = vscode.workspace
    .getConfiguration('oldFashioned')
    .get<boolean>('diagnostics.useProjectStylelintConfig', true);
  if (!useProjectConfig || document.uri.scheme !== 'file') {
    return undefined;
  }

  const directory = path.dirname(document.fileName);
  const found = findStylelintConfig(directory);
  if (!found || !found.exists) {
    return undefined;
  }

  const configBasedir = path.dirname(found.path);
  // config-loader only parses JSON; stylelint loads the other formats
  const config = found.config ?? await stylelint.resolveConfig(document.fileName, { cwd: directory });
  return config ? { config, configBasedir } : undefined;
}

/**
 * Make a project config usable from the bundle, keeping all of the project's rules
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prepareProjectConfig(config: any, document: vscode.TextDocument): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins = ([] as any[]).concat(config.plugins ?? []).filter(
    (plugin) => typeof plugin !== 'string' ||
      !(plugin.includes('stylelint-oldfashioned-order') || plugin.includes('oldschool'))
  );

  const rules = { ...config.rules };
  for (const name of LEGACY_RULE_NAMES) {
    delete rules[name];
  }
  for (const [name, setting] of Object.entries(rules)) {
    // Configs resolved by stylelint represent a disabled rule as an empty array
    if (Array.isArray(setting) && setting.length === 0) {
      rules[name] = null;
    }
  }

  // A project using stylelint-order already defines an order; a second rule would fight with it
  const hasOwnOrderRule = oldFashionedRuleName in rules || 'order/properties-order' in rules ||
    'order/properties-alphabetical-order' in rules;
  if (!hasOwnOrderRule) {
    rules[oldFashionedRuleName] = getOrderRuleSetting(document);
  }

  return {
    ...config,
    plugins: [...plugins, ...(oldFashionedPlugin as unknown[])],
    rules,
    customSyntax: config.customSyntax ?? getCustomSyntax(getParseSyntax(document.languageId)),
  };
}

/**
 * Lint text from a document with the project's stylelint config when there is
 * one, and with only the property order rule otherwise.
 *
 * @param document - The document the text belongs to
 * @param text - The text to lint
 * @param fix - Whether to apply autofixes; the result's code holds the fixed text
 * @returns The Stylelint linter result
 */
export async function lintWithStylelint(
  document: vscode.TextDocument,
  text: string,
  fix = false
): Promise<stylelint.LinterResult> {
  const codeFilename = document.uri.scheme === 'file' ? document.fileName : undefined;

  try {
    const project = await loadProjectConfig(document);
    if (project) {
      return await stylelint.lint({
        code: text,
        codeFilename,
        fix,
        config: prepareProjectConfig(project.config, document),
        configBasedir: project.configBasedir,
      });
    }
  } catch (err) {
    // e.g. a plugin the project config names is not installed. This runs while typing, so no popup
    console.warn('Could not use the project stylelint config, checking property order only:', err);
  }

  return stylelint.lint({
    code: text,
    codeFilename,
    fix,
    config: {
      plugins: oldFashionedPlugin,
      rules: { [oldFashionedRuleName]: getOrderRuleSetting(document) },
      customSyntax: getCustomSyntax(getParseSyntax(document.languageId)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
}
