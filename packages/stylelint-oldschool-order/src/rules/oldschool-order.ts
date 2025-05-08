import * as stylelint from 'stylelint';
import { Root, Node, Rule as PostcssRule } from 'postcss';
// Use the package name instead of relative path - but import directly just the sortProperties we need
import { sortProperties, SortingOptions } from '@old-fashioned/shared';
import { DEFAULT_PROPERTY_GROUPS } from '@old-fashioned/shared';

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
  emptyLinesBetweenGroups: true,
  sortPropertiesWithinGroups: true
};

/**
 * Main rule function
 */
const oldschoolOrderRule = function (
  primaryOption: any,
  secondaryOption?: object
) {
  // Determine actual options, merging plugin defaults with Stylelint config
  let ruleOptions: Partial<SortingOptions> = {};
  if (typeof primaryOption === 'object' && primaryOption !== null) {
    ruleOptions = primaryOption;
  } else if (typeof secondaryOption === 'object' && secondaryOption !== null) {
    ruleOptions = secondaryOption;
  }

  const actualOptions: SortingOptions = {
    ...defaultOptions,
    ...ruleOptions
  };

  return (root: Root, result: stylelint.PostcssResult) => {
    // Process CSS rules
    root.walkRules((rule: PostcssRule) => {
      const decls = rule.nodes?.filter(node => node.type === 'decl');

      if (!decls || decls.length <= 1) {
        return;
      }

      // Extract and map all declarations with their lowercase property names
      const declsMap = new Map<string, import('postcss').Declaration[]>();
      const propNames: string[] = [];
      decls.forEach(decl => {
        const prop = (decl as any).prop.toLowerCase();
        propNames.push(prop);

        if (!declsMap.has(prop)) {
          declsMap.set(prop, []);
        }
        declsMap.get(prop)!.push(decl as import('postcss').Declaration);
      });

      // Create a mapping of property name to group number for fast lookups
      const propertyGroupMap = new Map<string, number>();
      const groupNames: string[] = [
        "Positioning",
        "Box Model",
        "Dimensions",
        "Margins",
        "Padding",
        "Border",
        "Visual Properties",
        "Typography",
        "Other"
      ];

      DEFAULT_PROPERTY_GROUPS.forEach((group, groupIndex) => {
        group.forEach(prop => {
          propertyGroupMap.set(prop.toLowerCase().trim(), groupIndex);
        });
      });

      // First pass: assign properties to groups
      const groups: string[][] = Array(DEFAULT_PROPERTY_GROUPS.length)
        .fill(null)
        .map(() => [] as string[]);
      const ungrouped: string[] = [];

      propNames.forEach(prop => {
        const groupIndex = propertyGroupMap.get(prop);
        if (groupIndex !== undefined) {
          groups[groupIndex].push(prop);
        } else {
          ungrouped.push(prop);
        }
      });

      // Second pass: alphabetically sort within each group if needed
      if (actualOptions.sortPropertiesWithinGroups) {
        groups.forEach(group => {
          group.sort();
        });
        ungrouped.sort();
      }

      // Third pass: build the final sorted property list with empty lines
      const sortedProps: string[] = [];
      let isFirstNonEmptyGroup = true;

      groups.forEach((group, groupIndex) => {
        if (group.length > 0) {
          if (isFirstNonEmptyGroup) {
            isFirstNonEmptyGroup = false;
          } else if (actualOptions.emptyLinesBetweenGroups) {
            sortedProps.push(''); // Empty string marks where a blank line should be
          }
          sortedProps.push(...group);
        }
      });

      if (ungrouped.length > 0) {
        if (!isFirstNonEmptyGroup && actualOptions.emptyLinesBetweenGroups) {
          sortedProps.push('');
        }
        sortedProps.push(...ungrouped);
      }

      // Check if the order needs to change
      const needsReordering = JSON.stringify(propNames) !== JSON.stringify(sortedProps);

      if (needsReordering) {
        if (primaryOption === true || (typeof primaryOption === 'object')) {
          // Fix the order
          rule.removeAll();

          let needsEmptyLine = false;
          const ruleIndent = typeof rule.raws.indent === 'string' ? rule.raws.indent : '    ';
          let currentGroupIndex: number | null = null;

          sortedProps.forEach(propName => {
            if (propName === '') {
              needsEmptyLine = true;
              return;
            }

            const groupIndex = propertyGroupMap.get(propName);
            // Add group comment if this property starts a new group
            if (groupIndex !== undefined && groupIndex !== currentGroupIndex) {
              // Create a comment using postcss.comment() instead of stylelint.postcssRoot.comment()
              const groupComment = {
                type: 'comment',
                text: ` ${groupNames[groupIndex]} `,
                raws: {
                  before: needsEmptyLine ? '\n\n' + ruleIndent : '\n' + ruleIndent,
                  after: ''
                }
              };
              rule.append(groupComment);
              needsEmptyLine = false;
              currentGroupIndex = groupIndex;
            }

            // Add the declaration
            const matchingDecls = declsMap.get(propName);
            if (matchingDecls && matchingDecls.length > 0) {
              const decl = matchingDecls.shift();
              if (decl) {
                const newDecl = decl.clone();

                let rawsBefore = '\n' + ruleIndent;
                if (needsEmptyLine) {
                  rawsBefore = '\n\n' + ruleIndent;
                  needsEmptyLine = false;
                } else if (rule.nodes.length === 0) {
                  rawsBefore = ruleIndent;
                }

                newDecl.raws.before = rawsBefore;
                rule.append(newDecl);
              }
            }
          });

          // Add a comment for ungrouped properties if any
          if (ungrouped.length > 0) {
            const ungroupedComment = {
              type: 'comment',
              text: ' Ungrouped Properties ',
              raws: {
                before: '\n\n' + ruleIndent,
                after: ''
              }
            };
            rule.append(ungroupedComment);
          }

        } else {
          // Report without fixing
          stylelint.utils.report({
            ruleName,
            result,
            message: messages.expected(
              propNames.join(', '),
              sortedProps.join(', ')
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