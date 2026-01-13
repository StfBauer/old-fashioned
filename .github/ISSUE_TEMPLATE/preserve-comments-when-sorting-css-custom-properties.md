## Improvement: Preserve Comments When Sorting CSS Custom Properties

### Description
When sorting CSS custom properties (variables), inline comments should remain attached to their respective properties and maintain their position. For example, given:

```css
// Edgerunner Color Palette
--c-complete: #7bed9f; // Bright lime green
--c-incomplete: #e5e7eb; // Light gray
--c-billed: #ff6348; // Coral/salmon
--c-unbilled: #ffa502; // Orange
--c-collected: #1dd1a1; // Turquoise/cyan
--c-aging-30: #ff6348; // Coral (0-30 days)
--c-aging-60: #ffa502; // Orange (30-60 days)
--c-aging-over: #5f27cd; // Deep magenta (60+ days)
--c-spent: #ff9ff3; // Light pink

// Legacy support
--c-progress: #7bed9f;
```

When these properties are sorted, all comments (both full-line and inline) should remain in place and attached to the correct property. This ensures that context and documentation are not lost during sorting operations.

### Expected Behavior
- Sorting should not remove or misplace comments.
- Inline comments (on the same line as a property) should stay with their property.
- Full-line comments should remain above the property or group they document.

### Steps to Reproduce
1. Use the sorting feature on a block of CSS custom properties with comments as above.
2. Observe that comments are preserved and remain attached to the correct properties after sorting.

### Actual Behavior
Currently, comments may be lost, misplaced, or detached from their intended property during sorting.

### Suggested Solution
- Update the sorting logic to treat comments as part of the property they annotate.
- Ensure that both inline and full-line comments are preserved and correctly positioned after sorting.

### Additional Context
This is important for maintainability and readability, especially in codebases where comments provide essential context for each property.

---

**Labels:** enhancement, css, sorting, comments
