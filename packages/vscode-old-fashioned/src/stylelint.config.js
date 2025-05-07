module.exports = {
    plugins: ["stylelint-order", "stylelint-scss"],
    customSyntax: "postcss-scss",
    rules: {
        // First process the overall structure - this is critical for @use directives
        "order/order": [
            {
                "type": "at-rule",
                "name": "use"
            },
            {
                "type": "at-rule",
                "name": "forward"
            },
            {
                "type": "at-rule",
                "name": "import"
            },
            "dollar-variables",
            "declarations",
            "rules",
            "at-rules"
        ],
        // Then configure property order within declarations
        "order/properties-order": [
            {
                "properties": [
                    "position",
                    "top",
                    "right",
                    "bottom",
                    "left",
                    "z-index"
                ]
            },
            {
                "properties": [
                    "display",
                    "visibility",
                    "isolation",
                    "float",
                    "clear",
                    "box-sizing"
                ]
            },
            {
                "properties": [
                    "width",
                    "min-width",
                    "max-width",
                    "height",
                    "min-height",
                    "max-height"
                ]
            },
            {
                "properties": [
                    "margin",
                    "margin-top",
                    "margin-right",
                    "margin-bottom",
                    "margin-left",
                    "padding",
                    "padding-top",
                    "padding-right",
                    "padding-bottom",
                    "padding-left",
                    "padding-block",
                    "padding-inline",
                    "padding-inline-start"
                ]
            },
            {
                "properties": [
                    "background",
                    "background-color",
                    "color"
                ]
            },
            {
                "properties": [
                    "font-family",
                    "font-size",
                    "font-weight"
                ]
            },
            {
                "properties": [
                    "content",
                    "cursor",
                    "transition"
                ]
            }
        ]
    }
};
