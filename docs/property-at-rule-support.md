# CSS @property At-Rule Support

The Old Fashioned CSS Sorter now supports the CSS `@property` at-rule, which allows you to explicitly define the type, inheritance behavior, and initial value of custom properties.

## What Are CSS @property At-Rules?

The `@property` CSS at-rule is part of the [CSS Houdini](https://developer.mozilla.org/en-US/docs/Web/Guide/Houdini) suite of APIs. It provides a way to explicitly define custom properties with type checking, default values, and inheritance behavior.

```css
@property --my-property {
  syntax: '<color>';
  initial-value: #c0ffee;
  inherits: false;
}
```

Key components of an `@property` rule:

| Component | Description | Required? | Example Values |
|-----------|-------------|-----------|---------------|
| `syntax` | Defines the allowed value type | ✅ Yes | `'<color>'`, `'<length>'`, `'*'` |
| `initial-value` | Default value if not specified | ✅ Yes (except with `*`) | `#c0ffee`, `20px` |
| `inherits` | Whether the property inherits from parent elements | ✅ Yes | `true`, `false` |

## Implementation Details

The CSS `@property` at-rules are processed with the following handling:

1. **Proper Ordering**: `@property` at-rules are sorted to appear after SCSS `@use` and `@forward` directives, but before CSS custom properties (variables).

2. **Consistent Grouping**: Multiple `@property` at-rules are kept together in the sorted output.

3. **Precedence Order**:
   - SCSS `@use` and `@forward` directives (highest priority)
   - CSS `@property` at-rules
   - CSS custom properties (variables starting with `--`)
   - SCSS variables (starting with `$`)
   - Regular CSS properties

## Examples

### Basic Example

```scss
// Input: Unsorted CSS with @property rules
.example {
  width: 100%;
  --primary-color: blue;
  @property --animated-color {
    syntax: '<color>';
    initial-value: #c0ffee;
    inherits: false;
  }
  @use 'sass:math';
}

// Output: Sorted CSS with proper ordering
.example {
  @use 'sass:math';
  
  @property --animated-color {
    syntax: '<color>';
    initial-value: #c0ffee;
    inherits: false;
  }
  
  --primary-color: blue;
  
  width: 100%;
}
```

### Multiple @property Rules

```scss
// Input: Multiple unsorted @property rules
.gradient-container {
  background: linear-gradient(to right, var(--start-color), var(--end-color));
  padding: 20px;
  @property --end-color {
    syntax: '<color>';
    initial-value: blue;
    inherits: false;
  }
  margin: 10px;
  @property --start-color {
    syntax: '<color>';
    initial-value: red;
    inherits: false;
  }
  @property --transition-duration {
    syntax: '<time>';
    initial-value: 2s;
    inherits: true;
  }
}

// Output: Sorted CSS with grouped @property rules
.gradient-container {
  @property --end-color {
    syntax: '<color>';
    initial-value: blue;
    inherits: false;
  }
  
  @property --start-color {
    syntax: '<color>';
    initial-value: red;
    inherits: false;
  }
  
  @property --transition-duration {
    syntax: '<time>';
    initial-value: 2s;
    inherits: true;
  }
  
  background: linear-gradient(to right, var(--start-color), var(--end-color));
  margin: 10px;
  padding: 20px;
}
```

### Animation Example with @property

```css
/* Input: Animation using @property for smooth transitions */
.animated-card {
  transition: --card-color 0.5s;
  width: 200px;
  background-color: var(--card-color);
  --card-color: #3498db;
  @property --card-color {
    syntax: '<color>';
    initial-value: #3498db;
    inherits: false;
  }
  height: 100px;
}

.animated-card:hover {
  --card-color: #e74c3c;
}

/* Output: Properly sorted CSS */
.animated-card {
  @property --card-color {
    syntax: '<color>';
    initial-value: #3498db;
    inherits: false;
  }
  
  --card-color: #3498db;
  
  background-color: var(--card-color);
  height: 100px;
  transition: --card-color 0.5s;
  width: 200px;
}

.animated-card:hover {
  --card-color: #e74c3c;
}
```

## Browser Support

Browser support for the `@property` at-rule is growing but still limited:

| Browser | Support |
|---------|---------|
| Chrome  | ✅ 85+ |
| Edge    | ✅ 85+ |
| Firefox | ❌ Not supported (as of May 2025) |
| Safari  | ✅ 15+ |
| Opera   | ✅ 71+ |

For browsers that don't support `@property`, the rules will be ignored, but the standard custom properties will still work.

## Benefits

Supporting the `@property` at-rule provides better compatibility with modern CSS features, particularly for CSS Houdini implementations where custom properties need more precise type information and behavior control.

This enhancement ensures that the Old Fashioned CSS Sorter continues to handle all modern CSS features while maintaining a consistent and logical sorting order.
