# Old Fashioned - CSS Property Sorting for VS Code

A VS Code extension for sorting CSS properties according to various strategies, with support for CSS, SCSS, and SASS.

## Features

- Sort CSS properties by different strategies:
  - **Alphabetical** (A-Z)
  - **Grouped** (by functionality like positioning, layout, typography)
  - **Concentric** (from outside to inside)
  - **Custom** (using custom property groups)
  
- Support for CSS, SCSS, and SASS files
- Diagnostics for incorrectly ordered properties
- Quick-fix suggestions for ordering issues
- Format on demand or via Format Document command
- Context menu integration

![Demo of Old Fashioned sorting CSS properties](images/demo.gif)

## Usage

### Commands

- **Old Fashioned: Sort CSS Properties** - Sort properties in the current file or selection
- Use the context menu in CSS/SCSS/SASS files
- Click on Quick Fix suggestions when diagnostics appear

### Keyboard Shortcuts

You can assign a keyboard shortcut to the "Old Fashioned: Sort CSS Properties" command in VS Code keyboard shortcuts settings.

### Configuration

This extension provides several configuration options:

- **oldFashioned.sortingStrategy**: The strategy to use for sorting CSS properties
  - Options: "alphabetical", "grouped", "concentric", "custom"
  - Default: "grouped"
  
- **oldFashioned.emptyLinesBetweenGroups**: Whether to add empty lines between property groups
  - Default: true
  
- **oldFashioned.sortPropertiesWithinGroups**: Whether to alphabetically sort properties within their groups
  - Default: true
  
- **oldFashioned.formatOnFormat**: Whether to sort properties when formatting the document
  - Default: false
  
- **oldFashioned.showActivationMessage**: Whether to show a message when the extension is activated
  - Default: true

## Property Groups

When using the "grouped" sorting strategy, properties are grouped in the following order:

1. **Positioning** - position, top, right, bottom, left, z-index
2. **Display & Box Model** - display, flex, flex-*, box-sizing, etc.
3. **Width & Height** - width, height, min-width, max-width, etc.
4. **Margin & Padding** - margin, padding, and their variants
5. **Border & Outline** - border, outline, and their variants 
6. **Background** - background, background-color, background-image, etc.
7. **Typography** - color, font, font-*, text-*, etc.
8. **Visual** - opacity, visibility, overflow, transform, etc.
9. **Others** - content, cursor, pointer-events, user-select

## Requirements

- VS Code 1.60.0 or newer

## Known Issues

- In very large files, sorting may take a bit longer to complete.
- Some complex SCSS constructs might not be perfectly handled.

## Release Notes

### 0.0.1

- Initial release with basic sorting functionality
- Support for CSS, SCSS, and SASS files
- Multiple sorting strategies
- Diagnostics and quick-fixes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
