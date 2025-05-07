# Old Fashioned CSS Property Sorting Toolset

A comprehensive toolset for sorting CSS properties with customizable strategies, supporting both CSS and SCSS/SASS files.

## Overview

Old Fashioned is a set of tools for sorting CSS properties according to various strategies, similar to the functionality provided by CSSComb but with modern tooling and TypeScript support.

The project consists of three main components:

1. **@old-fashioned/shared** - Shared types, interfaces, and utilities
2. **stylelint-oldschool-order** - Stylelint plugin for sorting CSS properties
3. **old-fashioned** - VS Code extension that provides UI and integration

## Features

- Multiple sorting strategies:
  - **Alphabetical** - Sort properties alphabetically
  - **Grouped** - Sort properties by functional groups (position, display, etc.)
  - **Concentric** - Sort properties from outside to inside
  - **Custom** - Use custom property groups

- Support for CSS, SCSS, and SASS syntax
- Handling of SCSS variables, directives, and nested rules
- Empty line insertion between property groups
- Auto-fix capabilities
- VS Code integration with diagnostics and quick-fixes

## Getting Started

### Using the VS Code Extension

1. Install the "Old Fashioned" extension from the VS Code marketplace
2. Open a CSS, SCSS, or SASS file
3. Use the "Old Fashioned: Sort CSS Properties" command from the command palette
4. Configure sorting options in VS Code settings

### Using the Stylelint Plugin

1. Install the plugin:
   ```bash
   npm install stylelint stylelint-oldschool-order --save-dev
   ```

2. Add to your Stylelint config:
   ```js
   module.exports = {
     plugins: ['stylelint-oldschool-order'],
     rules: {
       'plugin/oldschool-order': [
         true,
         {
           strategy: 'grouped',
           emptyLinesBetweenGroups: true,
           sortPropertiesWithinGroups: true
         }
       ]
     }
   };
   ```

## Configuration

### Sorting Strategies

- **alphabetical**: Sort properties alphabetically
- **grouped**: Sort properties by functional groups
- **concentric**: Sort properties from outside to inside
- **custom**: Sort properties by custom property groups

### Options

- **emptyLinesBetweenGroups**: Add empty lines between property groups
- **sortPropertiesWithinGroups**: Sort properties within groups alphabetically
- **propertyGroups**: Custom property groups (for custom strategy)

## Development

This project is built as a monorepo using Nx:

```bash
# Install dependencies
npm install

# Build all packages
npx nx run-many --target=build --all

# Test all packages
npx nx run-many --target=test --all
```

## Package Structure

- `/packages/shared` - Shared types and utilities
- `/packages/stylelint-oldschool-order` - Stylelint plugin
- `/packages/vscode-old-fashioned` - VS Code extension

## License

MIT
