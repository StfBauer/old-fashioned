# Detect and Autofix CSS Issues with Stylelint Integration

## Summary

Currently, the extension may report that CSS is already sorted or valid, even when there are underlying issues in the CSS code. To improve developer experience and code quality, the extension should:

- Highlight issues in CSS using diagnostics (e.g., via stylelint integration)
- Optionally provide a beta feature to autofix issues using stylelint's --fix capability

## Problem Statement

There are cases where the extension claims the CSS is already sorted, but the file still contains formatting, ordering, or other linting issues. This can lead to confusion and missed opportunities for code improvement.

## Expected Behavior

- The extension should highlight (diagnose) CSS issues directly in the editor, leveraging stylelint rules.
- Users should be able to run a command to autofix issues using stylelint's --fix option, either on the current file or selection.
- The extension should clearly indicate when autofix is a beta feature.

## Benefits

- Improved code quality and consistency
- Faster feedback for developers
- Reduced manual fixing of common CSS issues

## Suggested Solution

- Integrate stylelint diagnostics into the extension, so issues are highlighted in the editor.
- Add a command (e.g., "Old Fashioned: Autofix CSS with Stylelint") that runs stylelint --fix on the current file or selection.
- Document the beta status of autofix and provide guidance for users.

## Additional Context

- The project already uses stylelint in tests and as a dependency.
- Many users expect linting and autofix features in modern CSS tooling.

---

**Labels:** enhancement
