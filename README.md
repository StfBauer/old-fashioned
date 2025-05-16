# Old Fashioned

A collection of tools for maintaining clean, consistent CSS code through intelligent property sorting.

## Packages

This monorepo contains the following packages:

- **vscode-old-fashioned**: VS Code extension for sorting CSS properties
- **shared**: Shared code for sorting strategies and property groups
- **stylelint-oldfashioned-order**: Stylelint plugin for sorting CSS properties (planned)

## Getting Started

### For Users

Install the [Old Fashioned CSS Sorter](https://marketplace.visualstudio.com/items?itemName=n8design.old-fashioned) extension from the VS Code marketplace.

See the [extension README](./packages/vscode-old-fashioned/README.md) for usage instructions.

### For Developers

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build all packages:
   ```
   npx nx run-many --target=build --all
   ```

## Development Workflow

This project uses Nx for monorepo management. Common commands:

- `npx nx build vscode-old-fashioned` - Build the VS Code extension
- `npx nx test vscode-old-fashioned` - Run tests for the VS Code extension
- `npx nx build shared` - Build the shared package
- `npx nx graph` - Visualize the project graph

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
