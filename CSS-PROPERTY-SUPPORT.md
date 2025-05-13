# CSS Property Support in Old Fashioned Extension

The "Old Fashioned" CSS property sorting extension has excellent support for CSS properties, including:

## 1. Support for Modern CSS Properties

The extension supports both traditional and modern CSS properties, as evidenced by:

- **Comprehensive Property Groups**: The `property-groups.ts` file contains extensive lists of CSS properties organized by functional groups, including modern CSS properties like:
  - Flexbox properties (`flex`, `flex-grow`, `flex-direction`, etc.)
  - Grid properties (`grid`, `grid-template-columns`, `grid-gap`, etc.)
  - Logical properties (`padding-inline-start`, `margin-block-start`, etc.)
  - Transform and animation properties
  - Custom properties (CSS variables with `--` prefix)

- **CSS Variables Support**: The extension properly handles CSS variables in both the declaration and usage contexts:
  - Declarations like `--primary-color: blue;`
  - Usage like `color: var(--primary-color);`
  - This is demonstrated in test files like `sorting-comprehensive.css`

- **Dynamic Handling of Unknown Properties**: The code includes a fallback mechanism for unknown properties:
  - Properties not found in predefined groups are collected in an "ungrouped" category
  - When using `alphabetical` sorting strategy, any property (including new ones) will be sorted correctly
  - The `isCSSProperty` function uses a flexible regex pattern that accepts any valid CSS property name format

## 2. Advanced Property Types Support

The extension handles sophisticated CSS features:

- **Vendor Prefixes**: Properly groups prefixed properties (`-webkit-`, `-moz-`, etc.) with their standard counterparts
- **Custom Properties**: Handles CSS variables appropriately
- **Complex Values**: Supports properties with complex values like `calc()`, `clamp()`, and custom functions
- **!important Flags**: Preserves `!important` flags during sorting
- **Shorthand and Individual Properties**: Recognizes relationships between shorthand and individual properties (e.g., `margin` vs `margin-top`)

## 3. Support for CSS Language Features

Beyond just property sorting, the extension supports:

- **SCSS/SASS Syntax**: Including variables, mixins, functions, and nested rules
- **Media Queries and At-Rules**: Preserves these while sorting properties within each context
- **Comments**: Preserves comments between properties
- **Keyframes**: Handles animation keyframes appropriately

## Extensibility for Future Properties

The extension architecture is designed to be future-proof:

1. The core algorithm doesn't hardcode assumptions about which properties exist
2. The property detection is regex-based, accepting any valid property name format
3. The extension includes a `custom` strategy that allows users to define their own property groups
4. Unknown properties are still sorted (either alphabetically or at the end of groups)

## Conclusion

Yes, the Old Fashioned extension supports all known CSS properties, including modern additions, through its flexible property handling system. 

For any future CSS properties that might be introduced, the extension's fallback mechanisms will still sort them (either alphabetically or in the "ungrouped" category). The extension's architecture allows for easy updates to include new properties in specific groups when needed.

The only limitations would be if entirely new CSS property patterns or formats were introduced that don't match the current property naming conventions, but this is unlikely given CSS's standardization process.
