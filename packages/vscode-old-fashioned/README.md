# Old Fashioned CSS Property Sorter

A Visual Studio Code extension that helps you maintain consistent CSS by sorting properties according to various strategies.

![Old Fashioned CSS Sorter Demo](images/launch-image-old.jpg)

## Features

- **Multiple Sorting Strategies**
  - **Alphabetical**: Simple A-Z sorting of properties
  - **Concentric**: Sort from outside (position/display) to inside (colors/text)
  - **Idiomatic**: Following the idiomatic CSS grouping conventions

- **Special Handling**
  - Automatically groups related properties (transforms, appearance properties, etc.)
  - Keeps vendor prefixes adjacent to their standard property
  - Maintains CSS variables at the top of declarations

## How It Works

Old Fashioned integrates with Stylelint using the `stylelint-oldfashioned-order` plugin to provide robust CSS property sorting. When you run the sort command, the extension:

1. Analyzes the CSS/SCSS/LESS code in the current document
2. Uses the selected sorting strategy to determine the optimal property order
3. Reorders the properties according to the strategy
4. Preserves your code formatting and comments

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Old Fashioned CSS Property Sorter"
4. Click Install

## Usage

1. Open a CSS, SCSS, or LESS file
2. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type "Old Fashioned: Sort CSS Properties"
4. Your CSS properties will be instantly sorted according to your settings

You can also:
- Set up a keyboard shortcut for quick access
- Configure settings to change the default sorting behavior

## Understanding Sorting Strategies

### Alphabetical

The simplest strategy that sorts properties from A-Z alphabetically, making them easy to scan and find:

```css
.element {
  background: white;
  color: red;
  display: flex;
  margin: 10px;
  padding: 5px;
}
```

### Concentric

Inspired by how elements are rendered on screen, this strategy sorts properties from the outside-in:

1. First comes positioning and layout (position, display, flex)
2. Then spacing (margin, padding)
3. Followed by size (width, height)
4. Then visual styles (background, border)
5. Finally text properties (color, font)

```css
.element {
  position: relative;
  display: flex;
  margin: 10px;
  padding: 5px;
  width: 200px;
  height: 100px;
  border: 1px solid #ccc;
  background: white;
  color: red;
  font-size: 14px;
}
```

This mimics how browsers render elements and creates a logical flow from position to appearance.

### Idiomatic

Groups properties by their function, following popular CSS methodology conventions:

1. Positioning (position, z-index, top)
2. Box Model (display, overflow, margin)
3. Typography (font-family, line-height)
4. Visual (color, background, border)
5. Animation (transform, transition)
6. Misc (cursor, pointer-events)

```css
.element {
  /* Positioning */
  position: relative;
  z-index: 1;
  top: 0;
  
  /* Box Model */
  display: flex;
  margin: 10px;
  padding: 5px;
  width: 200px;
  
  /* Visual */
  background: white;
  border: 1px solid #ccc;
  color: red;
  
  /* Animation */
  transition: all 0.3s;
}
```

This strategy helps organize properties into logical, functional groups.

## Extension Settings

This extension contributes the following settings:

* `old-fashioned.sorting.strategy`: Sets the sorting strategy (`alphabetical`, `concentric`, `idiomatic`)
* `old-fashioned.sorting.emptyLinesBetweenGroups`: Add empty lines between property groups for better readability
* `old-fashioned.sorting.sortPropertiesWithinGroups`: Sort properties alphabetically within their groups

## How Old Fashioned Works With Stylelint

Under the hood, Old Fashioned uses the `stylelint-oldfashioned-order` plugin to perform the sorting. This means:

1. You get the same high-quality sorting that Stylelint provides
2. The extension works seamlessly with your existing Stylelint configuration
3. Sorting rules are consistent with industry standards
4. The same sorting logic can be used in your CI/CD pipeline with Stylelint

If you're already using Stylelint in your project, you can ensure consistency by using:

```js
// .stylelintrc.js
module.exports = {
  plugins: ['stylelint-oldfashioned-order'],
  rules: {
    'oldfashioned-order/properties-order': 'alphabetical' // or 'concentric', 'idiomatic'
  }
};
```

## Requirements

No additional requirements or dependencies needed.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

### 0.0.1

- Initial release with basic functionality
- Support for CSS, SCSS, and LESS
- Multiple sorting strategies

## Contributing

Contributions are welcome! Check out the [repository](https://github.com/n8design/old-fashioned) for details.

## License

MIT © [Stefan Bauer (@stfbauer)](https://github.com/stfbauer)
