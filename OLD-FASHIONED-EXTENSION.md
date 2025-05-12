# Old Fashioned - CSS Property Sorting Extension for VS Code

## Overview

"Old Fashioned" is a comprehensive VS Code extension that provides sophisticated CSS property sorting and formatting capabilities. This project helps developers maintain consistent styling patterns in their CSS files by organizing properties according to different sorting strategies.

## Project Structure

The project is organized as a monorepo with three main packages:

1. **shared** - Core library with shared functionality
2. **stylelint-oldfashioned-order** - Stylelint plugin implementation
3. **vscode-old-fashioned** - VS Code extension

## Key Components

### Core Features

- **Multiple CSS Property Sorting Strategies**:
  - Grouped - Properties organized by logical function groups
  - Alphabetical - Simple alphabetical sorting
  - Concentric - From outside to inside (margin → padding → border → etc.)
  - Idiomatic - Following the idiomatic CSS style guide

- **Advanced Formatting Options**:
  - Colorizing (case for hex colors, shorthand notation)
  - Indentation and spacing control
  - Vendor prefix alignment
  - Quotation style preferences
  - Semicolon handling
  - Zero value formatting (with/without units)

- **Integration with Stylelint**:
  - Uses Stylelint for linting and property ordering
  - Custom stylelint-oldfashioned-order plugin implementation

### Technical Implementation

- **TypeScript** - The entire project is written in TypeScript for type safety
- **VS Code API** - Leverages VS Code Extension API for integration
- **PostCSS** - Used for CSS parsing and manipulation
- **Stylelint** - Powers the linting and sorting capabilities
- **Benchmark Suite** - Includes performance benchmarking tools

## How It Works

1. **Activation**:
   - The extension activates when opening CSS, SCSS, or SASS files
   - It also activates when a sorting command is invoked

2. **User Interaction**:
   - Users can trigger property sorting via:
     - Command Palette ("Sort CSS Properties (Old Fashioned)")
     - Context menu in the editor
     - Keyboard shortcuts

3. **Configuration**:
   - Extensive configuration options in VS Code settings
   - Settings are grouped by category (sorting, formatting, spacing, and general)
   - Each setting has descriptive documentation

4. **Processing Pipeline**:
   1. The extension parses CSS/SCSS using PostCSS
   2. It applies the selected sorting strategy using the stylelint-oldfashioned-order plugin
   3. Formatting is applied based on user preferences
   4. The formatted code replaces the original content

## Detailed Components

### Shared Package

Contains the core logic for:
- Property group definitions
- Sorting algorithms and strategies
- Type definitions
- Utility functions

### Stylelint-Oldfashioned-Order Package

- Custom Stylelint plugin implementing:
  - Order rules for different sorting strategies
  - SCSS-specific processors
  - Integration with stylelint-order

### VS Code Extension Package

- **extension.ts** - Main entry point, registers commands
- **diagnostics.ts** - Handles linting and error reporting
- **formatter.ts** - Applies formatting rules to code
- **sorting.ts** - Implements the property sorting logic
- **utils.ts** - Configuration and helper functions

## Testing and Quality Assurance

The project includes:
- Comprehensive test suites for each package
- Performance benchmarking tools
- Sample CSS/SCSS files for testing
- Real-world use case tests

## Distribution

The VS Code extension is packaged as a VSIX file that can be installed locally or published to the VS Code Marketplace.

## Development Workflow

The project uses:
- Nx for monorepo management
- NPM scripts for build and testing
- Vitest for unit testing
- Custom build scripts for packaging

## Recent Enhancements

Recent work on the project has focused on:

1. Adding comprehensive formatting options
2. Fixing activation issues
3. Restructuring settings for better organization
4. Improving error handling and diagnostics
5. Packaging the extension for local installation
6. Project cleanup to remove unnecessary files

The extension provides a robust solution for developers who prefer consistent, well-organized CSS code, making it easier to maintain and understand complex stylesheets.
