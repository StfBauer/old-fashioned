import { utils } from 'stylelint';
import { Root, Result, Declaration, Rule } from 'postcss';

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
        root.walkDecls((decl: Declaration) => {
            if (decl.value && /#[0-9a-fA-F]+/.test(decl.value)) {
                const isLowerCase = decl.value === decl.value.toLowerCase();
                const isUpperCase = decl.value === decl.value.toUpperCase();

                if (primaryOption === 'lower' && !isLowerCase) {
                    utils.report({
                        message: 'Color values should be in lowercase.',
                        node: decl,
                        result,
                        ruleName: 'custom/color-case'
                    });
                } else if (primaryOption === 'upper' && !isUpperCase) {
                    utils.report({
                        message: 'Color values should be in uppercase.',
                        node: decl,
                        result,
                        ruleName: 'custom/color-case'
                    });
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
        root.walkDecls((decl: Declaration) => {
            if (primaryOption && /#[0-9a-fA-F]{6}/.test(decl.value)) {
                utils.report({
                    message: 'Color values should use shorthand notation where possible.',
                    node: decl,
                    result,
                    ruleName: 'custom/color-shorthand'
                });
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

// Rule for strip-spaces
export const stripSpaces = (primaryOption: boolean, secondaryOptions: any) => {
    return (root: Root, result: Result) => {
        root.walkDecls((decl: Declaration) => {
            if (primaryOption && decl.raws.before && decl.raws.before.includes(' ')) {
                utils.report({
                    message: 'Unexpected spaces found.',
                    node: decl,
                    result,
                    ruleName: 'custom/strip-spaces'
                });
            }
        });
    };
};