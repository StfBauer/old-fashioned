# Test Organization

This directory contains tests for the CSS property ordering functionality. Tests are organized into logical groups for better maintainability:

- `core/`: Core functionality tests (basic sorting, property rules)
- `strategies/`: Tests for different sorting strategies (alphabetical, grouped, concentric, idiomatic)
- `css-variables/`: Tests specific to CSS custom properties (variables)
- `edge-cases/`: Tests for edge cases and special situations
- `integration/`: Comprehensive tests that cover multiple features working together
- `utils/`: Test helper utilities

Please add new tests to the appropriate directory based on what they're testing.

## Running Tests

From the project root, run:

```bash
npm test
```

Or to run tests in a specific directory:

```bash
npm test -- packages/shared/test/core
```
