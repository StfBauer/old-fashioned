# @property CSS at-rule Support

This feature adds support for the [@property CSS at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) in the Old Fashioned CSS Sorter.

## Implementation Details

The `@property` CSS at-rule is part of the CSS Houdini APIs and allows developers to explicitly define custom CSS properties with types, default values, and inheritance behavior.

We've implemented handling for @property at-rules with the following priority order:

1. `@use` directives (SCSS)
2. `@forward` directives (SCSS)
3. `@property` at-rules
4. SCSS variables
5. Regular CSS properties (sorted by selected strategy)
6. Nested rules

## Example

```scss
/* Before sorting */
.container {
  color: red;
  @property --my-color {
    syntax: '<color>';
    initial-value: #c0ffee;
    inherits: false;
  }
  @use 'sass:math';
  margin: 20px;
}

/* After sorting */
.container {
  @use 'sass:math';
  
  @property --my-color {
    syntax: '<color>';
    initial-value: #c0ffee;
    inherits: false;
  }
  
  margin: 20px;
  color: red;
}
```

## Technical Implementation

1. Added a `processTopLevelAtRules` function to the SCSS processor to handle @property rules along with @use and @forward directives.
2. Ensured proper empty line spacing between different rule types for readability.
3. Updated the processor to handle these at-rules in nested rules as well.

## Testing

The implementation has been tested across the full suite of tests to ensure it doesn't break existing functionality. Test files for @property at-rules have been added to verify the proper ordering of rules.
