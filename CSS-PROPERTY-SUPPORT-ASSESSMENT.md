# CSS Property Support Assessment for Old Fashioned Extension

This document provides a comprehensive assessment of the CSS property support in the Old Fashioned VS Code extension, with particular focus on modern CSS features.

## 1. Support for Container Queries and @container Rule

**Status: Not Explicitly Supported**

* The codebase does not contain specific implementations for container queries or the `@container` rule.
* No references to `container-type`, `container-name`, or `@container` were found in the property groups or test files.
* The extension's architecture would handle these properties as "ungrouped" since they're not explicitly defined in any property group.
* When using alphabetical sorting, these properties would still be sorted correctly, but wouldn't receive specialized handling.

**Recommendation:** Add container query related properties (`container`, `container-type`, `container-name`) to appropriate property groups in `property-groups.ts`, and add support for the `@container` rule in the same way that `@media` queries are processed.

## 2. Support for CSS Custom Properties (CSS Variables)

**Status: Well Supported**

* CSS custom properties (variables with `--` prefix) are explicitly supported:
  * Referenced in the property-groups.ts file
  * Present in test files
  * Demonstrated in test/scss/sorting-comprehensive.scss (Test Case 11: Custom properties)
  * The utils.ts `isCSSProperty()` function uses regex that properly accepts custom property format

* The extension correctly handles:
  * Custom property declarations (`--primary-color: blue;`)
  * Usage of custom properties (`color: var(--primary-color);`)
  * Variables in both CSS and SCSS contexts

```scss
// Example from test/scss/sorting-comprehensive.scss
:root {
    --main-color: #5c6ac4;
    --main-bg: #eee;
    --spacing-unit: 8px;
}

.custom-properties {
    background-color: var(--main-bg);
    color: var(--main-color);
    font-size: 16px;
    --local-spacing: 16px;
    margin: var(--spacing-unit);
    padding: var(--local-spacing);
    border: 1px solid var(--main-color);
}
```

## 3. Support for SASS At-Rules

**Status: Extensively Supported**

* The extension has robust SCSS/SASS at-rule support:
  * Handles various SASS at-rules like `@use`, `@forward`, `@import`, `@mixin`, `@include`, `@extend`
  * Includes a dedicated SCSS processor (packages/stylelint-oldfashioned-order/src/processors/scss-processor.ts)
  * Contains comprehensive test cases demonstrating at-rule handling

* Notable SASS at-rule support:
  * `@mixin` and `@include` directives
  * `@extend` directives
  * Control flow at-rules (`@if`, `@else`, `@for`, `@each`)
  * `@at-root` directive
  * `@use` and `@forward` directives

* The SCSS processor properly orders SASS at-rules with specific handling:
  ```typescript
  // First, @extend directives
  extends_.forEach(node => rule.append(node));
  
  // Then, @include directives
  includes.forEach(node => rule.append(node));
  
  // Then, other at-rules
  otherAtRules.forEach(node => rule.append(node));
  
  // Followed by declarations (CSS properties)
  declarations.forEach(node => rule.append(node));
  ```

## 4. Support for @property Rule

**Status: Fully Supported**

* The `@property` at-rule is now explicitly supported in the codebase.
* Implemented in the SCSS processor with dedicated handling in the `processTopLevelAtRules` function.
* The extension now properly sorts `@property` rules after `@use` and `@forward` directives but before CSS variables and other properties.
* Test cases have been added to verify correct handling of `@property` rules in relation to other CSS elements.

**Implementation Details:**
* `@property` rules are grouped together in the sorted output
* The relative ordering is: SCSS directives > @property rules > CSS variables > regular properties
* Preserves all syntax, inherits, and initial-value descriptors intact
* Works with nested SCSS blocks as well

## 5. Support for Pseudo-Classes

**Status: Implicitly Supported**

* The extension inherently supports pseudo-classes through its general CSS parsing methodology.
* The test files contain examples using pseudo-classes like `:hover`, `:last-child`, and `:not()`.
* From examples in test files:
  ```scss
  &:hover {
      transform: scale(1.05);
      background-color: darken($primary-color, 10%);
      cursor: pointer;
  }
  
  &:last-child {
      margin-bottom: 0;
      border-bottom: none;
  }
  ```

* While there's no specific handling for organizing pseudo-classes, the extension preserves them during property sorting.

## 6. Extensibility for New CSS Properties

**Status: Well-Designed for Extension**

* The extension's architecture was designed with future extensibility in mind:
  * Uses flexible property detection via regex rather than hardcoded lists
  * Implements fallback mechanisms for unknown properties
  * Provides multiple sorting strategies to accommodate different preferences

* Key extensibility features:
  * Unknown properties get collected in an "ungrouped" category
  * The alphabetical sorting strategy handles any valid property name
  * The `isCSSProperty()` function accepts any valid CSS property name format
  * Property groups can be easily extended in the `property-groups.ts` file

* From utils.ts:
  ```typescript
  export function isCSSProperty(str: string): boolean {
    // Simple check for now - CSS properties don't have spaces and usually contain hyphens
    return Boolean(
      str &&
      typeof str === 'string' &&
      !str.includes(' ') &&
      /^[a-zA-Z0-9-]+$/.test(str)
    );
  }
  ```

## Conclusion and Recommendations

### Current Status Summary
The Old Fashioned extension demonstrates **solid support for established CSS properties** and many modern CSS features. It has particularly strong handling of:

- CSS custom properties (variables)
- SASS/SCSS at-rules and features
- Pseudo-classes
- General CSS syntax features

However, there are **gaps in explicit support for newer CSS features**:
- Container queries and `@container` rule
- CSS Houdini features like the `@property` rule

### Recommendations

1. **Add Container Queries Support:**
   - Add `container`, `container-type`, and `container-name` to appropriate property groups
   - Implement specific handling for `@container` similar to the existing `@media` query handling
   - Add container query length units (`cqw`, `cqh`, `cqi`, `cqb`, etc.) to recognized units

2. **Add @property Rule Support:**
   - Implement specific handling for the `@property` rule in the SCSS processor
   - Add test cases for `@property` rule usage

3. **Documentation Updates:**
   - Update the CSS-PROPERTY-SUPPORT.md document to explicitly mention support for:
     - Container queries (once implemented)
     - CSS custom properties (already supported)
     - SASS at-rules (already supported)
     - @property rule (once implemented)
     - Pseudo-classes (already supported)

4. **Test Coverage Enhancement:**
   - Add more comprehensive test cases for newer CSS features
   - Create specific test files for container queries and @property rule

Overall, the Old Fashioned extension has a robust architecture that handles most CSS properties well, including many modern CSS features. With a few targeted enhancements, it could provide comprehensive support for the newest CSS features while maintaining its current reliability and flexibility.
