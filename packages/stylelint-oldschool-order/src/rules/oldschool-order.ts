import * as stylelint from 'stylelint';
import { Root, Node, Rule as PostcssRule } from 'postcss';
import { sortProperties, SortingOptions } from '@old-fashioned/shared';

// Define the plugin rule name
export const ruleName = 'plugin/oldschool-order';

export const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (unfixed: string, fixed: string) =>
    `Expected property order to be: ${fixed}. Current order: ${unfixed}`,
  rejected: (reason: string) => `Invalid CSS properties order: ${reason}`
});

// Default options
const defaultOptions: SortingOptions = {
  strategy: 'grouped',
  emptyLinesBetweenGroups: false,
  sortPropertiesWithinGroups: true
};

/**
 * Main rule function
 */
const oldschoolOrderRule = function (primaryOption: boolean | SortingOptions, secondaryOption?: Record<string, unknown>) {
  const actualOptions: SortingOptions =
    (primaryOption && typeof primaryOption !== 'boolean') ?
      primaryOption as SortingOptions :
      defaultOptions;

  return (root: Root, result: stylelint.PostcssResult) => {
    // Process CSS rules
    root.walkRules((rule: PostcssRule) => {
      const decls = rule.nodes?.filter(node => node.type === 'decl');

      if (!decls || decls.length <= 1) {
        return;
      }

      // Extract property names
      const propertyNames = decls
        .map(decl => (decl as any).prop)
        .filter(prop => typeof prop === 'string');

      // Sort properties
      const sortingResult = sortProperties(propertyNames, actualOptions);

      if (!sortingResult.success || !sortingResult.sortedProperties) {
        stylelint.utils.report({
          ruleName,
          result,
          message: messages.rejected(sortingResult.error || 'Unknown error'),
          node: rule,
          word: rule.selector
        });
        return;
      }

      const sortedPropertyNames = sortingResult.sortedProperties;

      // Check if properties need reordering
      const needsReordering = JSON.stringify(propertyNames) !== JSON.stringify(sortedPropertyNames);

      if (needsReordering && sortedPropertyNames) {
        if (primaryOption === true || (typeof primaryOption === 'object')) {
          // Fix the order
          const declsCloned = [...decls];

          // Rearrange the declarations
          rule.removeAll();

          // Re-add declarations in the correct order
          sortedPropertyNames.forEach(propName => {
            if (propName === '') {
              // Add empty line
              rule.append({ type: 'decl', prop: 'dummy', value: '' });
              return;
            }

            const matchingDecls = declsCloned.filter(
              decl => (decl as any).prop === propName
            );

            matchingDecls.forEach(decl => {
              rule.append(decl);
            });
          });

          // Remove any dummy declarations
          rule.walkDecls('dummy', decl => {
            decl.remove();
            return undefined; // Explicitly return undefined to match the expected return type
          });
        } else {
          // Report the issue without fixing
          stylelint.utils.report({
            ruleName,
            result,
            message: messages.expected(
              propertyNames.join(', '),
              sortedPropertyNames.join(', ')
            ),
            node: rule,
            word: rule.selector
          });
        }
      }
    });
  };
};

// Set meta data for the rule
oldschoolOrderRule.ruleName = ruleName;
oldschoolOrderRule.messages = messages;

export default oldschoolOrderRule;