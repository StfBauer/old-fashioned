const { alwaysSemicolon, colorCase, blockIndent, quotes, colorShorthand, elementCase, leadingZero, spaceBeforeColon, spaceAfterColon, spaceBeforeCombinator, spaceAfterCombinator, spaceBetweenDeclarations, spaceBeforeOpeningBrace, spaceAfterOpeningBrace, spaceAfterSelectorDelimiter, spaceBeforeSelectorDelimiter, spaceBeforeClosingBrace, stripSpaces } = require('./src/rules/custom-formatting-rules');

module.exports = {
    "plugins": [
        "stylelint-order",
        "stylelint-scss"
    ],
    "rules": {
        "order/order": [
            { "type": "at-rule", "name": "use" },
            { "type": "at-rule", "name": "forward" },
            { "type": "at-rule", "name": "import" },
            "dollar-variables",
            "custom-properties",
            "declarations",
            { "type": "at-rule", "name": "media" },
            { "type": "at-rule", "name": "include" },
            "rules",
            "at-rules"
        ],
        "order/properties-order": [
            // Positioning
            {
                "groupName": "Positioning",
                "properties": ["position", "top", "right", "bottom", "left", "z-index"]
            },
            // Display & Box Model
            {
                "groupName": "Display & Box Model",
                "properties": ["display", "visibility", "isolation", "float", "clear", "box-sizing"]
            },
            // Dimensions
            {
                "groupName": "Dimensions",
                "properties": ["width", "height", "min-width", "max-width", "min-height", "max-height"]
            },
            // Margin & Padding
            {
                "groupName": "Spacing",
                "properties": [
                    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
                    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
                    "padding-block", "padding-inline", "padding-inline-start"
                ]
            },
            // Visual
            {
                "groupName": "Visual",
                "properties": ["background", "background-color", "color", "border", "border-radius"]
            },
            // Typography
            {
                "groupName": "Typography",
                "properties": ["font", "font-family", "font-size", "font-weight"]
            },
            // Other
            {
                "groupName": "Other",
                "properties": ["content", "transition", "transform", "cursor"]
            }
        ],
        "scss/at-rule-no-unknown": true,
        "custom/always-semicolon": true,
        "custom/color-case": "lower",
        "custom/block-indent": "\t",
        "custom/quotes": "double",
        "custom/color-shorthand": true,
        "custom/element-case": "lower",
        "custom/leading-zero": false,
        "custom/space-before-colon": "",
        "custom/space-after-colon": " ",
        "custom/space-before-combinator": " ",
        "custom/space-after-combinator": " ",
        "custom/space-between-declarations": "\n",
        "custom/space-before-opening-brace": "",
        "custom/space-after-opening-brace": "\n",
        "custom/space-after-selector-delimiter": "\n",
        "custom/space-before-selector-delimiter": "",
        "custom/space-before-closing-brace": "\n",
        "custom/strip-spaces": true,
        "custom/tab-size": true,
        "custom/unitless-zero": true,
        "custom/vendor-prefix-align": true
    }
}
