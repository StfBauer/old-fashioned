# stylelint-oldfashioned-order

🎨 A stylelint plugin for ordering CSS properties with multiple sorting strategies: alphabetical, concentric, or idiomatic.

## Documentation

Comprehensive documentation is available in the [docs](./docs/) directory:

- [Getting Started Guide](./docs/getting-started.md)
- [Configuration Options](./docs/configuration-options.md)
- [Sorting Strategies](./docs/sorting-strategies.md)
- [Integration Guide](./docs/integration-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [FAQ](./docs/faq.md) - Answers to common questions

## Installation

```bash
npm install stylelint-oldfashioned-order --save-dev
```

## Usage

Add this plugin to your stylelint config:

```js
// .stylelintrc.js
module.exports = {
  plugins: [
    "stylelint-oldfashioned-order"
  ],
  rules: {
    "oldfashioned-order/properties-order": "alphabetical" // or "concentric", "idiomatic"
  }
};
```

## Sorting Strategies

### Alphabetical

Sorts properties alphabetically with special handling for vendor prefixes.

```css
/* Before */
.element {
  color: red;
  background: white;
  display: flex;
}

/* After */
.element {
  background: white;
  color: red;
  display: flex;
}
```

### Concentric

Sorts properties from outside (position/display) to inside (colors/text).

```css
/* Before */
.element {
  color: red;
  margin: 10px;
  background: white;
}

/* After */
.element {
  margin: 10px;
  background: white;
  color: red;
}
```

### Idiomatic

Groups properties according to idiomatic CSS conventions.

```css
/* Before */
.element {
  color: red;
  top: 0;
  display: block;
  padding: 5px;
}

/* After */
.element {
  top: 0;
  display: block;
  padding: 5px;
  color: red;
}
```

## License

MIT © [Stefan Bauer (@stfbauer)](https://github.com/stfbauer)
