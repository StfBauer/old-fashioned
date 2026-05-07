# Testing Guide — v1.2.0

This guide covers how to verify v1.2.0 manually and what to expect from the automated test suite.

## Automated tests

### Running the tests

```bash
# Official test suite via Nx (shared library + stylelint plugin)
nx run-many --target=test --projects=shared,stylelint-oldfashioned-order

# Stylelint plugin only
nx run stylelint-oldfashioned-order:test

# Shared library only (run from packages/shared)
cd packages/shared && npx vitest run
```

### Current status

| Suite | Files | Tests | Status |
|-------|-------|-------|--------|
| stylelint plugin (`src/tests/plugin.test.ts`) | 1 | 15 | **All pass** |
| shared library | 40 | 299 | 284 pass, **15 pre-existing failures** |

### Known pre-existing failures (not regressions from v1.2.0)

All failures below existed before the v1.2.0 work and are bugs in the idiomatic sorting strategy, not introduced by the dependency upgrades.

| Test | File | Root cause |
|------|------|-----------|
| `should sort properties according to Idiomatic CSS principles` | `test/strategies/idiomatic.test.ts` | Idiomatic group ordering: `display` placed after `width` |
| `should handle properties from all idiomatic groups` | `test/strategies/idiomatic.test.ts` | Idiomatic group ordering: container before display ordering broken |
| `should sort properties following Nicolas Gallagher's Idiomatic CSS principles` | `test/unit/strategies-index.test.ts` | Same root cause |
| `should correctly sort all properties using idiomatic strategy` | multiple files | Same root cause, comprehensive coverage |
| `should correctly sort all properties using alphabetical/concentric strategy` | `test/all-properties.test.ts` (×2 locations) | Separate assertion in the all-properties comprehensive test |
| `should handle property names with case variations when using grouped strategy` | `test/edge-cases/edge-cases.test.ts` (×2 locations) | Case handling in grouped strategy |
| `should properly group and sort various vendor prefix combinations` | `test/edge-cases/scss-edge-cases.test.ts` (×2 locations) | Vendor prefix range spread assertion too strict |

These should be filed as issues and fixed in a v1.3.0 patch, but they do **not** block the v1.2.0 release.

---

## VS Code extension — manual test checklist

### Install the local build

```bash
code --install-extension packages/vscode-old-fashioned/vscode-old-fashioned-1.2.0.vsix
```

Restart VS Code. Confirm the extension is active: open a `.css` or `.scss` file and check the status bar or Output panel for an activation message.

### Test: Sort CSS Properties command

1. Open a new `.css` file and paste:

```css
.card {
  padding: 16px;
  display: flex;
  background: white;
  width: 100%;
  position: relative;
  color: #333;
  margin: 0 auto;
  z-index: 10;
  top: 0;
}
```

2. Open the command palette (`Cmd+Shift+P`) and run **Sort CSS Properties (Old Fashioned)**.
3. Verify properties are reordered. With the default `alphabetical` strategy the expected output is:

```css
.card {
  background: white;
  color: #333;
  display: flex;
  margin: 0 auto;
  padding: 16px;
  position: relative;
  top: 0;
  width: 100%;
  z-index: 10;
}
```

### Test: Sorting strategies

1. Open **Settings** (`Cmd+,`) and search for `oldFashioned.sorting.strategy`.
2. Switch to `concentric` and re-sort the same block. Properties should go from outermost (position) to innermost (text).
3. Switch to `idiomatic` and re-sort. Properties should follow Nicolas Gallagher's idiomatic CSS grouping.
4. Switch back to `alphabetical`.

### Test: Open Old Fashioned Settings command

1. Run **Open Old Fashioned Settings** from the command palette.
2. Confirm the VS Code settings panel opens with the Old Fashioned section visible.

### Test: Autofix CSS Property Order command (v1.1.0 feature)

1. Create a `.stylelintrc.json` in your workspace root:

```json
{
  "plugins": ["stylelint-oldfashioned-order"],
  "rules": {
    "oldfashioned-order/properties-order": ["alphabetical"]
  }
}
```

2. Open a CSS file with unsorted properties.
3. Run **Autofix CSS Property Order (Old Fashioned)** from the command palette.
4. Verify properties are sorted according to the stylelint config.
5. Check the Output panel (select "Old Fashioned" channel) for any error messages.

### Test: SCSS support

1. Open a `.scss` file and paste:

```scss
.button {
  font-size: 14px;
  display: inline-flex;
  border-radius: 4px;
  background-color: blue;
  cursor: pointer;
  padding: 8px 16px;
  color: white;
}
```

2. Run the sort command.
3. Verify `$`-variables and `--custom-properties` are preserved at the top and not reordered with regular properties.

### Test: Comment preservation (v1.1.0 feature)

1. Open a CSS file with commented properties:

```css
.theme {
  /* Text */
  font-size: 16px;
  /* Spacing */
  padding: 8px;
  background: var(--bg); /* background */
  color: var(--fg);
}
```

2. Sort the file.
3. Verify inline comments stay attached to their properties and block comments stay above the property they describe.

---

## Stylelint plugin — manual test checklist

### Setup

```bash
cd /tmp && mkdir test-stylelint && cd test-stylelint
npm init -y
npm install stylelint stylelint-oldfashioned-order
```

Or test directly from the workspace (the plugin is built in `packages/stylelint-oldfashioned-order/dist/index.js`).

### Create test files

**`.stylelintrc.json`:**
```json
{
  "plugins": ["stylelint-oldfashioned-order"],
  "rules": {
    "oldfashioned-order/properties-order": ["alphabetical"]
  }
}
```

**`test.css`** (out of order, should produce violations):
```css
.box {
  padding: 16px;
  display: flex;
  background: white;
  color: black;
  margin: 0;
}
```

**`sorted.css`** (correctly sorted, should produce no violations):
```css
.box {
  background: white;
  color: black;
  display: flex;
  margin: 0;
  padding: 16px;
}
```

### Test: Linting

```bash
npx stylelint test.css
# Expect: 1 violation reported

npx stylelint sorted.css
# Expect: no violations
```

### Test: Autofix

```bash
npx stylelint --fix test.css
cat test.css
# Expect: properties now in alphabetical order
```

### Test: Concentric strategy

Update `.stylelintrc.json` to `"oldfashioned-order/properties-order": ["concentric"]`, create a CSS file with mixed properties, and verify the sort order follows the concentric model (position → display → dimensions → spacing → typography → visual).

### Test: Peer dependency compatibility

The plugin declares `peerDependencies: { stylelint: "^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0" }`. Verify v1.2.0 works with stylelint v17 (the version installed in this workspace):

```bash
npx stylelint --version
# Should show 17.x

npx stylelint test.css
# Should work without errors or deprecation warnings
```

---

## What changed in v1.2.0 (dependency upgrades only)

| Dependency | Before | After | Impact |
|-----------|--------|-------|--------|
| nx / @nx/* | 22.5.3 | 22.7.1 | Build tooling only |
| @types/vscode | 1.109.0 | 1.118.0 | Extension type safety |
| @typescript-eslint/* | 8.56.1 | 8.59.2 | Lint tooling only |
| vitest / @vitest/* | 4.0.18 | 4.1.5 | Test tooling only |
| @vscode/vsce | 3.7.1 | 3.9.1 | Package tooling only |
| esbuild | 0.27.3 | 0.27.7 | Build tooling only |
| eslint | 9.39.3 | 9.39.4 | Lint tooling only |
| postcss | 8.5.6 | 8.5.14 | Security patch |
| **stylelint** | **16.26.1** | **17.11.0** | **Plugin runtime dependency — test autofix** |
| **stylelint-order** | **7.0.1** | **8.1.1** | **Runtime dependency** |
| **TypeScript** | **5.9.3** | **6.0.3** | **Compiler — verify build outputs** |
| engines.vscode | ^1.106.0 | **^1.118.0** | **Minimum VS Code version raised** |

Focus your manual testing on the **bold rows** — they are the only changes with potential runtime impact on published packages.
