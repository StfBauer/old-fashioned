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
        "scss/at-rule-no-unknown": true
    }
}
