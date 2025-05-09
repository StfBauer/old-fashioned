# Modern CSS Support in Old Fashioned

Old Fashioned has been updated to provide comprehensive support for modern CSS features across all four sorting strategies: Alphabetical, Grouped, Concentric, and Idiomatic.

## Supported Modern CSS Features

### CSS Logical Properties

Old Fashioned now fully supports CSS Logical Properties, which are grouped with their physical counterparts:

- Margin properties: `margin-block`, `margin-block-start`, `margin-block-end`, `margin-inline`, `margin-inline-start`, `margin-inline-end`
- Padding properties: `padding-block`, `padding-block-start`, `padding-block-end`, `padding-inline`, `padding-inline-start`, `padding-inline-end`
- Border properties: `border-block`, `border-block-width`, `border-block-style`, `border-block-color`, `border-block-start`, etc.
- Inset properties: `inset`, `inset-block`, `inset-block-start`, `inset-block-end`, `inset-inline`, `inset-inline-start`, `inset-inline-end`
- Logical border radius: `border-start-start-radius`, `border-start-end-radius`, `border-end-start-radius`, `border-end-end-radius`

### Container Queries

Container query properties are now supported and properly grouped:

- `container`
- `container-type`
- `container-name`

### CSS Grid and Subgrid

All Grid properties are fully supported:

- Basic grid properties: `grid`, `grid-template`, `grid-template-columns`, `grid-template-rows`
- Grid areas: `grid-template-areas`, `grid-area`
- Grid automation: `grid-auto-columns`, `grid-auto-rows`, `grid-auto-flow`
- Grid positioning: `grid-column`, `grid-column-start`, `grid-column-end`, `grid-row`, `grid-row-start`, `grid-row-end`

> Note: While `subgrid` as a value for `grid-template-columns` and `grid-template-rows` is supported, Old Fashioned primarily sorts properties, not their values.

### Gap Properties

Gap properties are properly supported and grouped with flex/grid layout properties:

- `gap`
- `row-gap`
- `column-gap`

### Other Modern CSS Properties

- `aspect-ratio` (grouped with dimension properties)
- `backdrop-filter` (grouped with visual styling properties)

### CSS Nesting

Old Fashioned already supports CSS and SCSS nesting through the formatter implementation.

## Sorting Strategy Integration

All modern CSS properties have been integrated into each of the four sorting strategies:

1. **Alphabetical**: Properties are sorted alphabetically regardless of their function (default behavior for all properties)
2. **Grouped**: Modern properties are placed in relevant functional groups with their related properties
3. **Concentric**: Modern properties follow the outside-in approach, with positioning and layout properties first, followed by spacing, visuals, and content properties
4. **Idiomatic**: Modern properties are organized according to Nicolas Gallagher's Idiomatic CSS principles

## Usage Example

Using logical properties with the Grouped sorting strategy:

```css
.element {
  position: relative;
  inset: 0;
  inset-block-start: 10px;
  
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  width: 100%;
  aspect-ratio: 16/9;
  
  padding-inline: 1rem;
  margin-block: 2rem;
  
  border-inline: 1px solid;
  border-start-start-radius: 5px;
  
  color: black;
  font-size: 1rem;
}
```

## Compatibility

These modern CSS features work across all platforms and integrations, including:

- VS Code extension
- Stylelint plugin
- API usage
