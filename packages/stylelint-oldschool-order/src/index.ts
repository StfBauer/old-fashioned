/**
 * Old Fashioned Stylelint Plugin for CSS Property Sorting
 * 
 * A plugin for Stylelint that provides custom CSS property sorting with
 * capabilities similar to CSSComb and more.
 */

'use strict';

const stylelint = require('stylelint');
const rule = require('./rules/oldschool-order');

// Export a proper stylelint plugin
module.exports = stylelint.createPlugin(rule.ruleName, rule.default);
// These property assignments are critical!
module.exports.ruleName = rule.ruleName;