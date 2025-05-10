# CSS @property At-Rule Support

The Old Fashioned CSS Sorter now supports the CSS `@property` at-rule, which allows you to explicitly define the type, inheritance behavior, and initial value of custom properties.

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

## Example

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

## Benefits

Supporting the `@property` at-rule provides better compatibility with modern CSS features, particularly for CSS Houdini implementations where custom properties need more precise type information and behavior control.

This enhancement ensures that the Old Fashioned CSS Sorter continues to handle all modern CSS features while maintaining a consistent and logical sorting order.
