# Old Fashioned CSS Property Sorter

A Visual Studio Code extension that helps you maintain consistent CSS by sorting properties according to various strategies.

![Old Fashioned CSS Sorter Demo](packages/vscode-old-fashioned/images/launch-image-old.jpg)

## Features

- **Multiple Sorting Strategies**
  - **Alphabetical**: Simple A-Z sorting of properties
  - **Concentric**: Sort from outside (position/display) to inside (colors/text)
  - **Idiomatic**: Following the idiomatic CSS grouping conventions

- **Special Handling**
  - Automatically groups related properties (transforms, appearance properties, etc.)
  - Keeps vendor prefixes adjacent to their standard property
  - Maintains CSS variables at the top of declarations

## Usage

1. Open a CSS, SCSS, or LESS file
2. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type "Old Fashioned: Sort CSS Properties"
4. Your CSS properties will be instantly sorted according to your settings

## Extension Settings

This extension contributes the following settings:

* `old-fashioned.sorting.strategy`: Sets the sorting strategy (`alphabetical`, `concentric`, `idiomatic`)
* `old-fashioned.sorting.emptyLinesBetweenGroups`: Add empty lines between property groups for better readability
* `old-fashioned.sorting.sortPropertiesWithinGroups`: Sort properties alphabetically within their groups

## Examples

### Before:
```css
.example {
  color: red;
  margin: 10px;
  display: flex;
  padding: 5px;
  background: white;
}
```

### After (Alphabetical):
```css
.example {
  background: white;
  color: red;
  display: flex;
  margin: 10px;
  padding: 5px;
}
```

### After (Concentric):
```css
.example {
  display: flex;
  margin: 10px;
  padding: 5px;
  background: white;
  color: red;
}
```

### After (Idiomatic):
```css
.example {
  /* Positioning */
  /* Box Model */
  display: flex;
  margin: 10px;
  padding: 5px;
  
  /* Visual */
  background: white;
  color: red;
}
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
