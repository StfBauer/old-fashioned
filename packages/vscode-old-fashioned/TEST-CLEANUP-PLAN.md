# Old Fashioned VS Code Extension Test Cleanup Plan

## Current Issues

After analyzing the test suite for the VS Code extension, I've identified several issues:

1. **Multiple similar test files** with overlapping functionality:
   - `extension.test.ts` - The original test file with syntax errors
   - `extension-fixed.test.ts` - Attempted fix with proper mocking organization
   - `extension-improved.test.ts` - Another approach to fixing the tests
   - `extension.test.fix.ts` - Yet another approach

2. **Common test failures** across files:
   - Issues with mocking VS Code configuration
   - Problems with `withProgress` mock implementation
   - Stylelint mock not being properly called
   - Type errors in certain VS Code mocks

3. **Redundant tests** between the different test files

## Cleanup Recommendations

### 1. Consolidate to a Single Main Test File

Create a single, well-organized test file by merging the best parts of the existing approaches:

- **Filename**: `extension.test.ts` - Use the standard naming convention
- **Structure**: Follow the pattern from `extension-fixed.test.ts` with proper hoisting

### 2. Implement a Robust Mocking Strategy

- Properly implement VS Code mocks with correct typing
- Use `vi.hoisted()` consistently for all mocks to prevent circular dependencies
- Ensure the VS Code workspace configuration mock properly handles all needed settings
- Create a dedicated mock object for stylelint that's properly hoisted

### 3. Organize Tests by Feature

Organize tests into focused groups:

1. **Extension Activation Tests**
   - Command registration
   - Provider registration
   - Extension activation message

2. **Sorting Functionality Tests**
   - No editor available case
   - CSS sorting tests
   - SCSS sorting tests
   - SASS sorting tests

3. **Utility Function Tests**
   - Parsing syntax determination
   - Configuration retrieval
   - Diagnostic creation

4. **Configuration Integration Tests**
   - Move integration tests to a separate file `config-integration.test.ts`

### 4. Fix Common Issues

1. **VS Code Configuration Mock**
```typescript
workspace: {
  getConfiguration: vi.fn().mockReturnValue({
    get: vi.fn().mockImplementation((key: string, defaultValue: any) => {
      if (key === 'sorting.strategy') return 'grouped';
      if (key === 'sorting.emptyLinesBetweenGroups') return true;
      if (key === 'sorting.sortPropertiesWithinGroups') return true;
      if (key === 'showActivationMessage') return true;
      return defaultValue;
    })
  }),
  onDidOpenTextDocument: vi.fn(),
  onDidChangeTextDocument: vi.fn(),
  onDidSaveTextDocument: vi.fn(),
  onDidCloseTextDocument: vi.fn(),
  textDocuments: [],
  applyEdit: vi.fn()
}
```

2. **Progress Indicator Mock**
```typescript
withProgress: vi.fn().mockImplementation((options, task) => {
  return task();
})
```

3. **Stylelint Mock**
```typescript
const mockStylelint = vi.hoisted(() => ({
  default: {
    lint: vi.fn().mockResolvedValue({
      results: [{ warnings: [] }],
      output: 'sorted-css'
    })
  }
}));
```

### 5. Delete Redundant Files

Once the consolidated test file is working, remove:
- `extension-fixed.test.ts`
- `extension-improved.test.ts`
- `extension.test.fix.ts`

### 6. Update VSCode API Mocks

Create a proper type-safe mock for the VS Code API in a shared file:

```typescript
// test-mocks.ts
import { vi } from 'vitest';

export const createVSCodeMock = () => ({
  window: {
    activeTextEditor: undefined,
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    withProgress: vi.fn().mockImplementation((options, task) => task())
  },
  // ... other VS Code objects
});
```

## Implementation Plan

1. Create the consolidated test file
2. Implement proper mocking strategies
3. Fix common test failures
4. Verify all tests pass
5. Remove redundant test files

This plan will simplify maintenance and make future test changes easier to implement.
