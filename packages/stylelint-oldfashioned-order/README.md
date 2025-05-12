# stylelint-oldfashioned-order

A Stylelint plugin for sorting CSS properties according to various strategies, including grouped ordering similar to CSSComb.

## Installation

```bash
npm install stylelint-oldfashioned-order --save-dev
```

## Usage

Add the plugin to your Stylelint configuration:

```js
module.exports = {
  plugins: ['stylelint-oldfashioned-order'],
  rules: {
    'plugin/oldfashioned-order': [
      true,
      {
        // Your options here
        strategy: 'grouped',
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: true
      }
    ]
  }
};
```

## Options

### `strategy`

Type: `String`  
Default: `'grouped'`  
Possible values: `'alphabetical'`, `'grouped'`, `'concentric'`, `'custom'`

The strategy to use for sorting CSS properties:

- `alphabetical`: Sort properties alphabetically
- `grouped`: Sort properties by functional groups (positioning, layout, typography, etc.)
- `concentric`: Sort properties from outside to inside (positioning, dimensions, colors, etc.)
- `custom`: Use custom property groups defined in `propertyGroups`

### `emptyLinesBetweenGroups`

Type: `Boolean`  
Default: `true`

Whether to add empty lines between different property groups.

### `sortPropertiesWithinGroups`

Type: `Boolean`  
Default: `true`

Whether to sort properties alphabetically within their groups.

### `propertyGroups`

Type: `Array<Array<String>>`  
Default: *Built-in groups*

Custom property groups to use with the `'custom'` strategy. Each sub-array represents a group of properties.

Example:

```js
propertyGroups: [
  ['position', 'top', 'right', 'bottom', 'left'],
  ['width', 'height'],
  ['color', 'font-size', 'line-height']
]
```

## Features

- Multiple sorting strategies
- Empty line insertion between groups
- Support for CSS, SCSS, and SASS
- Handling for SCSS variables and nested rules
- Auto-fix capabilities

## CSSComb Compatibility

This plugin is designed to be compatible with CSSComb configurations. If you're migrating from CSSComb, you can use your existing property order configuration.

## License

MIT
