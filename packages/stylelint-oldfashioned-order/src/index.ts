/**
 * Old Fashioned Stylelint Plugin for CSS Property Sorting
 * 
 * A plugin for Stylelint that provides custom CSS property sorting with
 * capabilities similar to CSSComb and more.
 */

'use strict';

// This file serves as the main entry point for the stylelint-oldfashioned-order plugin

import oldfashionedOrderRule, { ruleName } from './rules/oldfashioned-order';

// Stylelint expects plugin rules to be exported as an object with the rule name as the key
// This is critical for proper plugin registration
export default [
    {
        // This provides the ruleName property that Stylelint requires
        ruleName: ruleName,
        rule: oldfashionedOrderRule,
        // Mandatory meta information
        meta: {
            url: 'https://github.com/n8design/old-fashioned/tree/main/packages/stylelint-oldfashioned-order',
            deprecated: false
        }
    }
];