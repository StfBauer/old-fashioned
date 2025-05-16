# Contributing to Old Fashioned

Thank you for your interest in contributing to Old Fashioned! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/n8design/old-fashioned.git
   cd old-fashioned
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build all packages:
   ```
   npx nx run-many --target=build --all
   ```

## Project Structure

This is an Nx monorepo with the following structure:

- `/packages/vscode-old-fashioned` - VS Code extension
- `/packages/shared` - Shared code for sorting strategies
- `/packages/stylelint-oldfashioned-order` - Stylelint plugin (planned)

## Development Workflow

### Building

Build a specific package:
