# Old Fashioned CSS Sorter

A Visual Studio Code extension that helps you keep your CSS properties organized and consistent using intelligent sorting strategies.

## Documentation

Comprehensive documentation is available in the [docs](./docs/) directory:

- [Getting Started Guide](./docs/getting-started.md)
- [Using the Extension](./docs/using-the-extension.md) (with screenshots & examples)
- [Configuration Options](./docs/configuration.md)
- [Sorting Strategies](./docs/sorting-strategies.md)
- [Advanced Features](./docs/advanced-features.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [FAQ](./docs/faq.md) - Answers to common questions

## Features

- Sort CSS properties using multiple proven strategies:
  - **Alphabetical**: Simple A-Z sorting for maximum searchability
  - **Concentric**: Outside-in CSS sorting (position → dimensions → appearance → text)
  - **Idiomatic**: Following idiomatic CSS standards as defined by Nicolas Gallagher

- Works seamlessly with:
  - CSS files
  - SCSS files
  - SASS files

- Special handling for:
  - Custom properties (--variables)
  - SASS variables ($variables)
  - Nested rules
  - Media queries

- Integrates with:
  - Project-level stylelint configurations (optional)
  - VSCode settings

## Usage

1. Open a CSS, SCSS, or SASS file
2. Run the command "Sort CSS Properties (Old Fashioned)" from the command palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Your properties will be sorted according to your chosen strategy

## Demo

![Old Fashioned CSS Formatter in action](https://raw.githubusercontent.com/StfBauer/old-fashioned/60febaf8ba2468a4541d44633c47b7f6f8a2e912/packages/vscode-old-fashioned/images/old-fashioned-demo.gif)

## 🎯 Feature Comparison Table

| 🧩 Feature / Tool Capability                      | CSSComb                         | Stylelint (w/ plugins)              | Prettier                  | Old-Fashioned CSS             |
|--------------------------------------------------|----------------------------------|-------------------------------------|---------------------------|-------------------------------|
| 📅 Multiple sorting methodologies                | ✅ (via presets)                 | ⚠️ (manual setup only)              | ❌                         | ✅ Alphabetical, Concentric   |
| 🧱 Idiomatic sorting (SMACSS, BEM, etc.)         | ✅                               | ⚠️ (plugin-dependent)              | ❌                         | ✅ Built-in presets           |
| 🧠 Property grouping & spacing                   | ✅                               | ⚠️ (needs config)                  | ❌                         | ✅ Automatic                  |
| 💡 Intelligent formatting (before sorting)       | ❌                               | ⚠️ (not default)                   | ✅ Formatting only         | ✅ Context aware              |
| 🧱 SCSS support (nesting, variables)             | ✅                               | ✅ (via `stylelint-scss`)          | ⚠️ Partial                 | ✅ Full                       |
| 🧬 Handles @rules like `@property`, `@media`     | ⚠️ Limited                       | ⚠️ Some support                    | ⚠️ Basic                   | ✅ Extensive                  |
| ⚙️ Fine-grained configurability                  | ✅ via `.csscomb.json`           | ✅ with multiple plugins            | ❌ (non-configurable)      | ✅ Built-in + Workspace local |
| 🛠️ Integration with editors & workflows         | ⚠️ Outdated                      | ✅ Modern integrations              | ✅ Excellent               | ✅ Designed for VS Code       |
| 🛰️ Community preset sharing                      | ✅                               | ⚠️ Limited                         | ❌                         | 🟡 Planned                    |
| 👷 Maintained / actively developed               | ❌ Abandoned                     | ✅ Active                           | ✅ Active                  | ✅ Active                     |
| 🧭 Learning-friendly (teaches logical order)     | ⚠️ Implicit                      | ⚠️ Depends on rules                | ❌                         | ✅ Explicit via strategy      |

## Extension Settings

This extension contributes the following settings:

* `oldFashioned.sorting.strategy`: Choose the sorting strategy (alphabetical, concentric, idiomatic)
* `oldFashioned.sorting.emptyLinesBetweenGroups`: Add empty lines between property groups
* `oldFashioned.sorting.sortPropertiesWithinGroups`: Sort properties alphabetically within each group
* `oldFashioned.showActivationMessage`: Show a message when the extension is activated
* `oldFashioned.showDebugComments`: Show debug comments in the sorted CSS output (default: false)
* `oldFashioned.notificationLevel`: Control how many notifications are shown (verbose, minimal, none)
* `oldFashioned.formatting.formatBeforeSorting`: Format the document before sorting (default: true)

## Configuration

### Sorting Configuration

- **Sorting Strategy**: Choose the sorting strategy (alphabetical, concentric, idiomatic)
- **Empty Lines Between Groups**: Add empty lines between property groups
- **Sort Properties Within Groups**: Sort properties alphabetically within each group

### Formatting Configuration

- **Format Before Sorting:** Enable or disable automatic formatting using VS Code's built-in formatter before sorting properties (default: true)

## Sorting Strategies Explained

### Alphabetical

Properties are sorted A-Z, making it easy to find a specific property. This is the simplest strategy and works well for teams without specific ordering preferences.

**Example:**
```css
.element {
    background-color: white;
    color: black;
    display: flex;
    margin: 10px;
    padding: 15px;
    position: relative;
    width: 100%;
    z-index: 1;
}
```

### Concentric

Based on [Concentric CSS](https://github.com/brandon-rhodes/Concentric-CSS) by Brandon Rhodes, this strategy sorts properties from outside-in:

1. Position & z-index (how it's placed)
2. Display & box model (how it's displayed)
3. Dimensions (size)
4. Margins (space outside)
5. Borders (the boundary)
6. Padding (space inside)
7. Background & colors (appearance)
8. Text & font properties (content styling)
9. Other properties (everything else)

**Example:**
```css
.element {
    position: relative;
    z-index: 1;
    
    display: flex;
    
    width: 100%;
    
    margin: 10px;
    
    padding: 15px;
    
    background-color: white;
    color: black;
}
```

### Idiomatic

Based on [Idiomatic CSS](https://github.com/necolas/idiomatic-css) by Nicolas Gallagher, this strategy follows a logical progression of properties:

1. Positioning
2. Box model
3. Borders
4. Background
5. Typography
6. Visual effects
7. Animation
8. Other

**Example:**
```css
.element {
    position: relative;
    z-index: 1;
    
    display: flex;
    width: 100%;
    margin: 10px;
    padding: 15px;
    
    background-color: white;
    
    color: black;
}
```

## Stylelint Integration

This extension can optionally integrate with project-level stylelint configurations:

- If your project uses stylelint with either `stylelint-order` or `stylelint-oldfashioned-order` plugin, the extension will detect and use those settings
- You can define your sorting preferences at the project level through stylelint rather than in VS Code settings
- If both are present, the VS Code settings take precedence

## Troubleshooting

### Common Issues

**Q: My properties aren't being sorted correctly**  
A: Check your strategy selection in the settings (Ctrl+,). Different strategies will produce different orders.

**Q: The extension doesn't activate**  
A: Make sure you're working with a .css, .scss, or .sass file. The extension only activates for these file types.

**Q: I don't see empty lines between my property groups**  
A: Check that `oldFashioned.sorting.emptyLinesBetweenGroups` is set to `true` in your settings.

### Getting Support

If you encounter issues not addressed here, please [open an issue](https://github.com/n8design/old-fashioned/issues) on our GitHub repository.

## Keyboard Shortcuts

By default, Old Fashioned doesn't come with predefined keyboard shortcuts to avoid conflicts with other extensions. However, you can easily set up your own shortcuts:

1. Open VS Code and go to **File > Preferences > Keyboard Shortcuts** (or press `Ctrl+K Ctrl+S` / `Cmd+K Cmd+S` on macOS)
2. Click on the "Open Keyboard Shortcuts (JSON)" button in the top right corner of the editor
3. Add your preferred shortcut to the `keybindings.json` file. 

Here are some suggested keyboard shortcuts that shouldn't conflict with VS Code's default bindings:

```json
// Option 1: Similar to Format Document (Shift+Alt+F with additional Ctrl key)
{
  "key": "ctrl+shift+alt+f",
  "command": "oldFashioned.sortProperties",
  "when": "editorTextFocus && (editorLangId == 'css' || editorLangId == 'scss' || editorLangId == 'sass')"
}

// Option 2: Alternative using Ctrl+K prefix (common in VS Code)
{
  "key": "ctrl+k s",
  "command": "oldFashioned.sortProperties",
  "when": "editorTextFocus && (editorLangId == 'css' || editorLangId == 'scss' || editorLangId == 'sass')"
}

// Option 3: For Mac users
{
  "key": "cmd+k s",
  "command": "oldFashioned.sortProperties", 
  "when": "editorTextFocus && (editorLangId == 'css' || editorLangId == 'scss' || editorLangId == 'sass')"
}
```

Choose the option that works best for your workflow. The first option adds an additional Ctrl key to the standard Format Document shortcut, while the second and third options use the Ctrl+K/Cmd+K chord system common in VS Code.

### Available Commands

- `oldFashioned.sortProperties`: Sort properties using the configured strategy
- `oldFashioned.sortPropertiesAlphabetical`: Sort properties alphabetically
- `oldFashioned.sortPropertiesConcentric`: Sort properties using the concentric strategy
- `oldFashioned.sortPropertiesIdiomatic`: Sort properties using the idiomatic strategy
- `oldFashioned.sortPropertiesGrouped`: Sort properties using the grouped strategy

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

## Publishing Information

This extension is published by [N8D](https://marketplace.visualstudio.com/publishers/N8D) on the Visual Studio Code Marketplace.

### For Developers Looking to Publish

If you're forking or contributing to this project, you'll need your own publisher ID to publish it:

1. Create a publisher account at https://marketplace.visualstudio.com/manage
2. Update the `publisher` field in `package.json` with your publisher ID
3. Follow the [VS Code publishing instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Development

### Building the Extension VSIX

To build the extension as a VSIX package for installation in VS Code:

```bash
# From the root of the workspace
nx run vscode-old-fashioned:build  # First build using esbuild
nx run vscode-old-fashioned:package  # Then package into VSIX

# Or navigate to the extension directory and use npm directly
cd packages/vscode-old-fashioned
npm run esbuild  # Build using esbuild
npm run package  # Package into VSIX
```

The resulting VSIX file will be available in the `packages/vscode-old-fashioned` directory.

### Installing the VSIX

Once you have built the VSIX file, you can install it in VS Code:

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Click on the `...` menu (top right of the Extensions view)
4. Select "Install from VSIX..."
5. Navigate to the VSIX file and select it

Alternatively, you can install it from the command line:

```bash
code --install-extension path/to/vscode-old-fashioned-0.0.1.vsix
```
