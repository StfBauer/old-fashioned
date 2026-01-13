# Preserve Comments When Sorting CSS Custom Properties

## Summary

When sorting CSS custom properties (variables), all comments—both inline and full-line—should remain attached to their respective properties and maintain their original position and context. This is essential for code maintainability, readability, and for preserving valuable documentation that often accompanies these properties.

## Problem Statement

Currently, when using the sorting feature for CSS custom properties, comments may be lost, misplaced, or detached from the properties they describe. This can lead to confusion, loss of important context, and makes the codebase harder to maintain, especially in teams or open-source projects where comments provide critical explanations.

### Example

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

When these properties are sorted, the expectation is that:

- The full-line comment `// Edgerunner Color Palette` remains above the color palette group.
- Each inline comment (e.g., `// Bright lime green`) stays on the same line as its property.
- The `// Legacy support` comment remains above the legacy property.

## Expected Behavior

- **Inline comments** (on the same line as a property) should always stay with their property after sorting.
- **Full-line comments** (above a property or group) should remain directly above the property or group they document.
- No comments should be lost, duplicated, or moved to unrelated properties.
- The logical grouping and documentation provided by comments should be preserved, even if the order of the properties changes.

## Actual Behavior

- Comments may be separated from their properties.
- Inline comments may be lost or moved to the wrong property.
- Full-line comments may be misplaced or deleted.

## Why This Matters

- Comments often contain critical explanations, usage notes, or warnings.
- Losing or misplacing comments can introduce bugs or misunderstandings.
- Preserving comments is essential for code quality, onboarding, and collaboration.

## Suggested Solution

- Update the sorting logic to treat comments as part of the property they annotate.
- When sorting, move both the property and its associated comments together as a single unit.
- Ensure that both inline and full-line comments are preserved and correctly positioned after sorting.

## Additional Context

This issue is especially important for design systems, theming, and large codebases where CSS custom properties are heavily documented and grouped for clarity.

---

**Labels:** enhancement, css, sorting, comments
