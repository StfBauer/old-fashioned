import { utils } from 'stylelint';
import { Root, Result, Declaration, Rule } from 'postcss';

// Define a more complete result options interface that includes the fix property
interface ExtendedResultOptions {
    fix?: boolean;
    [key: string]: any;
}

// Helper function to access fix option safely
function hasFixOption(result: Result): boolean {
    return Boolean(result.opts && (result.opts as ExtendedResultOptions).fix);
}

// Rule for always-semicolon
export const alwaysSemicolon = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (primaryOption && !decl.raws.important) {
                if (!decl.toString().endsWith(';')) {
                    utils.report({
                        message: 'Missing semicolon at the end of declaration.',
                        node: decl,
                        result,
                        ruleName: 'custom/always-semicolon'
                    });
                }
            }
        });
    };
};

// Rule for color-case
export const colorCase = (primaryOption: 'lower' | 'upper', secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        const isAutofix = hasFixOption(result);

        root.walkDecls((decl: Declaration) => {
            if (decl.value && /#[0-9a-fA-F]+/.test(decl.value)) {
                const isLowerCase = decl.value === decl.value.toLowerCase();
                const isUpperCase = decl.value === decl.value.toUpperCase();

                if (primaryOption === 'lower' && !isLowerCase) {
                    if (isAutofix) {
                        // Apply the fix
                        decl.value = decl.value.replace(/#[0-9a-fA-F]+/g, match => match.toLowerCase());
                    } else {
                        // Just report the issue
                        utils.report({
                            message: 'Color values should be in lowercase.',
                            node: decl,
                            result,
                            ruleName: 'custom/color-case'
                        });
                    }
                } else if (primaryOption === 'upper' && !isUpperCase) {
                    if (isAutofix) {
                        // Apply the fix
                        decl.value = decl.value.replace(/#[0-9a-fA-F]+/g, match => match.toUpperCase());
                    } else {
                        // Just report the issue
                        utils.report({
                            message: 'Color values should be in uppercase.',
                            node: decl,
                            result,
                            ruleName: 'custom/color-case'
                        });
                    }
                }
            }
        });
    };
};

// Rule for block-indent
export const blockIndent = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.raws.before && rule.raws.before !== primaryOption) {
                utils.report({
                    message: `Block indentation should be '${primaryOption}'.`,
                    node: rule,
                    result,
                    ruleName: 'custom/block-indent'
                });
            }
        });
    };
};

// Rule for quotes
export const quotes = (primaryOption: 'single' | 'double', secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (decl.value.includes("'") && primaryOption === 'double') {
                utils.report({
                    message: 'Quotes should be double.',
                    node: decl,
                    result,
                    ruleName: 'custom/quotes'
                });
            } else if (decl.value.includes('"') && primaryOption === 'single') {
                utils.report({
                    message: 'Quotes should be single.',
                    node: decl,
                    result,
                    ruleName: 'custom/quotes'
                });
            }
        });
    };
};

// Rule for color-shorthand
export const colorShorthand = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        const isAutofix = hasFixOption(result);

        root.walkDecls((decl: Declaration) => {
            if (primaryOption) {
                // Check if it's a 6-digit hex color that can be shortened
                const hexRegex = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\b/g;

                if (hexRegex.test(decl.value)) {
                    if (isAutofix) {
                        // Apply the fix
                        decl.value = decl.value.replace(hexRegex, (match, r1, r2, g1, g2, b1, b2) => {
                            // Only convert to shorthand if each pair of digits is the same
                            if (r1 === r2 && g1 === g2 && b1 === b2) {
                                return `#${r1}${g1}${b1}`;
                            }
                            return match; // Keep original if can't be shortened
                        });
                    } else {
                        // Just report the issue
                        utils.report({
                            message: 'Color values should use shorthand notation where possible.',
                            node: decl,
                            result,
                            ruleName: 'custom/color-shorthand'
                        });
                    }
                }
            }
        });
    };
};

// Rule for element-case
export const elementCase = (primaryOption: 'lower' | 'upper', secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.selector) {
                const isLowerCase = rule.selector === rule.selector.toLowerCase();
                const isUpperCase = rule.selector === rule.selector.toUpperCase();

                if (primaryOption === 'lower' && !isLowerCase) {
                    utils.report({
                        message: 'Element selectors should be in lowercase.',
                        node: rule,
                        result,
                        ruleName: 'custom/element-case'
                    });
                } else if (primaryOption === 'upper' && !isUpperCase) {
                    utils.report({
                        message: 'Element selectors should be in uppercase.',
                        node: rule,
                        result,
                        ruleName: 'custom/element-case'
                    });
                }
            }
        });
    };
};

// Rule for leading-zero
export const leadingZero = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (/\b0\./.test(decl.value) && !primaryOption) {
                utils.report({
                    message: 'Leading zeros should be omitted.',
                    node: decl,
                    result,
                    ruleName: 'custom/leading-zero'
                });
            }
        });
    };
};

// Rule for space-before-colon
export const spaceBeforeColon = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (decl.raws.between && !decl.raws.between.startsWith(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' before colon in declaration.`,
                    node: decl,
                    result,
                    ruleName: 'custom/space-before-colon'
                });
            }
        });
    };
};

// Rule for space-after-colon
export const spaceAfterColon = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (decl.raws.between && !decl.raws.between.endsWith(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' after colon in declaration.`,
                    node: decl,
                    result,
                    ruleName: 'custom/space-after-colon'
                });
            }
        });
    };
};

// Rule for space-before-combinator
export const spaceBeforeCombinator = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.selector.includes('>') && !rule.selector.includes(` ${primaryOption}>`)) {
                utils.report({
                    message: `Expected '${primaryOption}' before combinator.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-before-combinator'
                });
            }
        });
    };
};

// Rule for space-after-combinator
export const spaceAfterCombinator = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.selector.includes('>') && !rule.selector.includes(`>${primaryOption} `)) {
                utils.report({
                    message: `Expected '${primaryOption}' after combinator.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-after-combinator'
                });
            }
        });
    };
};

// Rule for space-between-declarations
export const spaceBetweenDeclarations = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (decl.raws.before && !decl.raws.before.includes(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' between declarations.`,
                    node: decl,
                    result,
                    ruleName: 'custom/space-between-declarations'
                });
            }
        });
    };
};

// Rule for space-before-opening-brace
export const spaceBeforeOpeningBrace = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.raws.between && !rule.raws.between.endsWith(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' before opening brace.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-before-opening-brace'
                });
            }
        });
    };
};

// Rule for space-after-opening-brace
export const spaceAfterOpeningBrace = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.raws.after && !rule.raws.after.startsWith(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' after opening brace.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-after-opening-brace'
                });
            }
        });
    };
};

// Rule for space-after-selector-delimiter
export const spaceAfterSelectorDelimiter = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.selector.includes(',') && !rule.selector.includes(`,${primaryOption}`)) {
                utils.report({
                    message: `Expected '${primaryOption}' after selector delimiter.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-after-selector-delimiter'
                });
            }
        });
    };
};

// Rule for space-before-selector-delimiter
export const spaceBeforeSelectorDelimiter = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.selector.includes(',') && !rule.selector.includes(`${primaryOption},`)) {
                utils.report({
                    message: `Expected '${primaryOption}' before selector delimiter.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-before-selector-delimiter'
                });
            }
        });
    };
};

// Rule for space-before-closing-brace
export const spaceBeforeClosingBrace = (primaryOption: string, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkRules((rule: Rule) => {
            if (rule.raws.after && !rule.raws.after.endsWith(primaryOption)) {
                utils.report({
                    message: `Expected '${primaryOption}' before closing brace.`,
                    node: rule,
                    result,
                    ruleName: 'custom/space-before-closing-brace'
                });
            }
        });
    };
};

// Ensure stripSpaces rule modifies both property names and values correctly
export const stripSpaces = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        const isAutofix = hasFixOption(result);

        root.walkDecls((decl: Declaration) => {
            if (primaryOption) {
                const hasTrimmedProp = decl.prop.trim() !== decl.prop;
                const hasTrimmedValue = decl.value.trim() !== decl.value;

                if (hasTrimmedProp || hasTrimmedValue) {
                    if (isAutofix) {
                        // Apply the fix
                        decl.prop = decl.prop.trim();
                        decl.value = decl.value.trim();

                        // Also fix spaces in between (around the colon)
                        if (decl.raws.between) {
                            decl.raws.between = ':';
                        }
                    } else {
                        // Just report the issue
                        utils.report({
                            message: 'Properties and values should not have extra spaces.',
                            node: decl,
                            result,
                            ruleName: 'custom/strip-spaces'
                        });
                    }
                }
            }
        });
    };
};

// Rule for unitless-zero
export const unitlessZero = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        const isAutofix = hasFixOption(result);

        root.walkDecls((decl: Declaration) => {
            if (primaryOption) {
                const hasUnitZero = /\b0(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)\b/.test(decl.value);

                if (hasUnitZero) {
                    if (isAutofix) {
                        // Apply the fix
                        decl.value = decl.value.replace(/\b0(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)\b/g, '0');
                    } else {
                        // Just report the issue
                        utils.report({
                            message: 'Zero values should be unitless.',
                            node: decl,
                            result,
                            ruleName: 'custom/unitless-zero'
                        });
                    }
                }
            }
        });
    };
};

// Rule for vendor-prefix-align
export const vendorPrefixAlign = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        // Create a map to store vendor prefixed properties and their positions
        const prefixedProps = new Map<string, { prop: string, node: Declaration, index: number }[]>();
        let index = 0;

        // First pass: collect all vendor-prefixed properties and their non-prefixed versions
        root.walkDecls((decl: Declaration) => {
            const vendorPrefixMatch = decl.prop.match(/^-(\w+)-(.+)$/);

            if (vendorPrefixMatch) {
                // Vendor prefixed property
                const [, prefix, baseProp] = vendorPrefixMatch;
                if (!prefixedProps.has(baseProp)) {
                    prefixedProps.set(baseProp, []);
                }
                prefixedProps.get(baseProp)?.push({ prop: decl.prop, node: decl, index: index++ });
            } else {
                // Check if this is a non-prefixed version of a prefixed property
                if (prefixedProps.has(decl.prop)) {
                    prefixedProps.get(decl.prop)?.push({ prop: decl.prop, node: decl, index: index++ });
                }
            }
        });

        // Second pass: check and fix alignment if needed
        if (primaryOption) {
            for (const [baseProp, declarations] of prefixedProps.entries()) {
                if (declarations.length < 2) continue; // Need at least two versions to align

                const isAutofix = hasFixOption(result);

                // Sort declarations by prefix (vendor prefixed first, then standard)
                const sortedDeclarations = [...declarations].sort((a, b) => {
                    const aIsVendor = a.prop.startsWith('-');
                    const bIsVendor = b.prop.startsWith('-');

                    if (aIsVendor && !bIsVendor) return -1;
                    if (!aIsVendor && bIsVendor) return 1;
                    return a.prop.localeCompare(b.prop);
                });

                // Check if they're already in the right order
                const isAlreadyOrdered = sortedDeclarations.every((decl, i) => {
                    return i === 0 || sortedDeclarations[i - 1].index < decl.index;
                });

                if (!isAlreadyOrdered) {
                    if (isAutofix) {
                        // Fix is more complex and would require rearranging the AST
                        // For simplicity in our custom rule, we'll just report the issue
                        utils.report({
                            message: 'Vendor prefixed properties should be grouped together with standard property.',
                            node: sortedDeclarations[0].node,
                            result,
                            ruleName: 'custom/vendor-prefix-align'
                        });
                    } else {
                        // Report the issue
                        utils.report({
                            message: 'Vendor prefixed properties should be grouped together with standard property.',
                            node: sortedDeclarations[0].node,
                            result,
                            ruleName: 'custom/vendor-prefix-align'
                        });
                    }
                }
            }
        }
    };
};