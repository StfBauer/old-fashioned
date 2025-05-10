# CSS Property Ordering Test Suite

This test suite verifies the functionality of the CSS property ordering implementation. Tests are organized in a logical structure to improve maintainability and clarity.

## Test Structure

```
packages/shared/test/
├── core/                   # Core functionality tests
│   ├── property-at-rule.test.ts
│   └── sorting.test.ts
├── css-variables/          # CSS custom properties (variables) tests
│   ├── css-variables-*.test.ts
│   └── verification.ts
├── edge-cases/             # Edge case and special handling tests
│   ├── edge-cases.test.ts
│   ├── advanced-edge-cases.test.ts
│   └── real-world-edge-cases.test.ts
├── integration/            # Comprehensive integration tests
│   ├── all-properties.test.ts
│   └── comprehensive.test.ts
├── strategies/             # Sorting strategy implementations tests
│   ├── alphabetical.test.ts
│   ├── grouped.test.ts
│   ├── concentric.test.ts
│   └── idiomatic.test.ts
└── utils/                  # Test utility functions
    └── test-helpers.ts
```

## Key Test Categories

1. **Core Sorting Functionality**: Basic property sorting regardless of strategy
2. **CSS Variables Handling**: Testing that CSS variables are placed at the top with an empty line separator
3. **Sorting Strategies**: Tests for each supported strategy (alphabetical, grouped, concentric, idiomatic)
4. **Edge Cases**: Complex scenarios and corner cases
5. **Integration Tests**: Comprehensive tests covering multiple features working together

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in a specific directory:

```bash
npm test -- packages/shared/test/core
```

Or for a specific test:

```bash
npm test -- packages/shared/test/css-variables/css-variables-empty-line.test.ts
```

## CSS Variable Verification

The CSS variables verification script (`packages/shared/test/css-variables/verification.ts`) provides utilities for testing CSS variable handling across different sorting strategies. It ensures:

1. CSS variables are always at the top
2. An empty line is added after CSS variables
3. CSS variables are alphabetically sorted

Use it by importing the provided utilities:

```javascript
import { verifyCssVariables } from './packages/shared/test/css-variables/verification';

const properties = [
  '--primary-color',
  'width',
  'height'
];

const results = verifyCssVariables(properties);
// Check results.alphabetical, results.grouped, etc.
```
