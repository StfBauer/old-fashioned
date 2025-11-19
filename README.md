# Old Fashioned

A professional CSS/SCSS property organization toolkit with multiple sorting strategies and smart formatting options.

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](docs/maintenance.md)
[![Documentation](https://img.shields.io/badge/Documentation-comprehensive-blue.svg)](docs/README.md)

## Demo

![Old Fashioned CSS Formatter in action](packages/vscode-old-fashioned/images/old-fashioned-demo.gif)

## What's Included

This monorepo contains the following packages:

### VS Code Extension

The [VS Code Extension](/packages/vscode-old-fashioned) provides an easy-to-use interface for sorting and organizing CSS/SCSS properties directly in your editor. Features include:

- Multiple sorting strategies (alphabetical, concentric, idiomatic)
- Support for CSS, SCSS, and SASS files
- Smart formatting options including property grouping
- Configurable notification levels
- Integration with VS Code's built-in formatter

### Stylelint Plugin

The [Stylelint plugin](/packages/stylelint-oldfashioned-order) brings Old Fashioned's powerful sorting capabilities to your linting workflow:

- Enforce consistent CSS property order through linting rules
- Same sorting strategies as the VS Code extension
- Integrates with existing Stylelint configurations
- Detailed reporting of ordering issues
- Can be used in CI/CD pipelines for code quality enforcement

### Shared Library

The [shared library](/packages/shared) contains the core sorting logic used by all Old Fashioned tools:

- Various property sorting algorithms
- CSS/SCSS parsing utilities
- Configuration options handling
- Property group definitions

## Getting Started

### Using the VS Code Extension

1. Install the [Old Fashioned CSS Formatter](https://marketplace.visualstudio.com/items?itemName=N8D.vscode-old-fashioned) from the VS Code marketplace
2. Open a CSS, SCSS, or SASS file
3. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for "Sort CSS Properties (Old Fashioned)"
4. Customize your sorting strategy in the extension settings

### Setting Up for Development

```bash
# Clone the repository
git clone https://github.com/n8design/old-fashioned.git
cd old-fashioned

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Configuration

Old Fashioned supports several sorting strategies:

- **Alphabetical**: Sort properties alphabetically (A-Z)
- **Concentric**: Sort from outside to inside (position → text → misc)
- **Idiomatic**: Sort according to idiomatic CSS standards

See the [VS Code Extension README](/packages/vscode-old-fashioned/README.md) for detailed configuration options.

## Project Maintenance

This project includes several tools to help maintain a clean workspace and prepare packages for publishing.
See the [maintenance documentation](docs/maintenance.md) for more information on:

- Interactive cleanup scripts
- Prepare-for-publish utilities
- Periodic automated cleanup
- And more

## Documentation

Old Fashioned comes with comprehensive documentation:

### Core Documentation

- [Main Documentation](docs/README.md): Entry point to all documentation
- [Configuration Guide](docs/configuration.md): How to configure all Old Fashioned tools
- [Sorting Strategy Comparison](docs/sorting-strategy-comparison.md): Compare all sorting approaches
- [Custom Sorting Strategies](docs/custom-sorting-strategies.md): Create your own property ordering

### Sorting Strategies

- [Alphabetical Sorting](docs/sorting-strategies/alphabetical.md): A-Z property ordering
- [Concentric Sorting](docs/sorting-strategies/concentric.md): Outside-in box model approach
- [Idiomatic Sorting](docs/sorting-strategies/idiomatic.md): Based on CSS best practices

### Package-Specific Documentation

- [VS Code Extension Docs](packages/vscode-old-fashioned/docs/README.md)
- [Stylelint Plugin Docs](packages/stylelint-oldfashioned-order/docs/README.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
