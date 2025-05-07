# @old-fashioned/shared

This package provides shared types, interfaces, and utility functions for the Old Fashioned CSS property sorting toolset. It serves as a common library for both the Stylelint plugin and VS Code extension.

## Installation

```bash
npm install @old-fashioned/shared
```

## Usage

### Types and Interfaces

```typescript
import { 
  SortingOptions, 
  SortingStrategy, 
  PropertyGroup 
} from '@old-fashioned/shared';

// Configure sorting options
const options: SortingOptions = {
  strategy: 'grouped',
  emptyLinesBetweenGroups: true,
  sortPropertiesWithinGroups: true
};
```

### Utility Functions

```typescript
import { sortProperties } from '@old-fashioned/shared';

const cssProperties = ['color', 'position', 'display', 'width'];
const options = {
  strategy: 'grouped',
  emptyLinesBetweenGroups: true,
  sortPropertiesWithinGroups: true
};

const result = sortProperties(cssProperties, options);
console.log(result.sortedProperties); // Sorted array of properties
```

### CSSComb Compatibility

```typescript
import { convertCSSCombConfig } from '@old-fashioned/shared';

const csscombConfig = {
  'sort-order': [
    ['position', 'top', 'right', 'bottom', 'left'],
    ['display', 'width', 'height'],
    ['color', 'background']
  ]
};

const options = convertCSSCombConfig(csscombConfig);
// Now you can use these options with sortProperties
```

## API Reference

### Types

- `SortingStrategy`: 'alphabetical' | 'grouped' | 'concentric' | 'custom'
- `PropertyGroup`: Interface for defining property groups
- `SortingOptions`: Options for property sorting
- `SortingResult`: Result of a sorting operation
- `CSSCombConfig`: Type for CSSComb configuration compatibility

### Functions

- `sortProperties(properties, options)`: Main function for sorting CSS properties
- `sortAlphabetically(properties)`: Sort properties alphabetically
- `sortByGroups(properties, options)`: Sort properties by defined groups
- `sortConcentric(properties, options)`: Sort properties using concentric pattern
- `convertCSSCombConfig(config)`: Convert CSSComb config to Old Fashioned options

## License

MIT
