import * as stylelint from 'stylelint';
import { Root } from 'postcss';
import { sortProperties, SortingOptions, DEFAULT_PROPERTY_GROUPS } from '@old-fashioned/shared';

// Define the plugin rule name
export const ruleName = 'plugin/oldfashioned-order';

// For stylelint v16+, the utils are directly on stylelint
// For older versions, they're at stylelint.utils
const utils = 'utils' in stylelint ? (stylelint as any).utils : stylelint;

export const messages = utils.ruleMessages(ruleName, {
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
const oldfashionedOrderRule = function (
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
    // Create property group map for quick lookup
    const propertyGroupMap = new Map<string, number>();
    DEFAULT_PROPERTY_GROUPS.forEach((group, groupIndex) => {
      group.forEach(prop => {
        propertyGroupMap.set(prop.toLowerCase().trim(), groupIndex);
      });
    });

    // Process CSS rules
    root.walkRules((rule) => {
      const decls = rule.nodes?.filter(node => node.type === 'decl');

      if (!decls || decls.length <= 1) {
        return;
      }

      // Extract and map all declarations with case-preserving property names
      const declsMap = new Map<string, any[]>();
      const propNames: string[] = [];
      decls.forEach(decl => {
        // Keep original case for CSS variables, lowercase for everything else
        const propOriginal = (decl as any).prop;
        const prop = propOriginal.startsWith('--') ? propOriginal : propOriginal.toLowerCase();
        propNames.push(prop);

        if (!declsMap.has(prop)) {
          declsMap.set(prop, []);
        }
        declsMap.get(prop)!.push(decl);
      });

      // Use the shared module's sortProperties function for consistent handling
      const sortResult = sortProperties(propNames, actualOptions);

      if (!sortResult.success || !sortResult.sortedProperties) {
        return;
      }

      const sortedProps = sortResult.sortedProperties;

      // Create a mapping for group names for comments
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
          const ungrouped = sortedProps.filter(prop => !propertyGroupMap.has(prop) && prop !== '');
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
          utils.report({
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
oldfashionedOrderRule.ruleName = ruleName;
oldfashionedOrderRule.messages = messages;

export default oldfashionedOrderRule;