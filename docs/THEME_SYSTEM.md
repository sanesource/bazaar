# 🎨 Theme System Documentation

## Overview

The Bazaar application now supports multiple themes that users can select and switch between. The theme system is built using CSS custom properties (variables) and JavaScript for dynamic switching.

## Available Themes

### 1. Light Theme (Default)

- **Class**: `theme-light`
- **Style**: Classic light interface with beige backgrounds and blue headers
- **Colors**:
  - Background: `#ece9d8` (beige)
  - Header: `#0054e3` (blue)
  - Text: `#000000` (black)
  - Positive: `#00aa00` (green)
  - Negative: `#cc0000` (red)

### 2. Dark Theme

- **Class**: `theme-dark`
- **Style**: Dark terminal interface inspired by Bloomberg terminals
- **Colors**:
  - Background: `#0a0a0a` (dark black)
  - Text: `#00ff00` (bright green)
  - Cards: `#1a1a1a` (dark gray)
  - Positive: `#00ff00` (bright green)
  - Negative: `#ff0000` (bright red)
- **Font**: Monospace (`Courier New`, `Monaco`, `Consolas`)

## Implementation Details

### CSS Architecture

- **`themes.css`**: Contains all theme variables and theme-specific styles
- **CSS Variables**: Each theme defines a complete set of color and styling variables
- **Theme Classes**: Applied to the `<body>` element to activate theme-specific styles

### JavaScript Integration

- **Theme Selector**: Dropdown in the header for theme selection
- **Persistence**: Theme preference saved to `localStorage`
- **Dynamic Switching**: Instant theme changes without page reload

### File Structure

```
src/renderer/styles/
├── themes.css          # Theme system and variables
├── winxp.css           # Windows XP specific styles (updated)
├── main.css            # Main application layout
└── components.css      # Component-specific styles
```

## Usage

### For Users

1. Click the theme dropdown in the header (before market status)
2. Select desired theme:
   - "Light" for classic interface
   - "Dark" for dark terminal look
3. Theme preference is automatically saved and restored on next launch

### For Developers

To add a new theme:

1. **Add theme variables** in `themes.css`:

```css
.theme-new-theme {
  --theme-bg: #color;
  --theme-fg: #color;
  /* ... other variables */
}
```

2. **Add theme-specific styles** if needed:

```css
.theme-new-theme .special-element {
  /* theme-specific styling */
}
```

3. **Add option to HTML dropdown**:

```html
<option value="new-theme">New Theme Name</option>
```

4. **Update JavaScript** (if needed):
   The existing `switchTheme()` method automatically handles new themes.

## Technical Notes

- **CSS Variables**: All themes use the same variable names for consistency
- **Fallbacks**: Light theme serves as the default fallback
- **Performance**: Theme switching is instant with no API calls
- **Compatibility**: Works with all existing components and features
- **Storage**: Uses `localStorage` key `'bazaar-theme'`

## Theme Variables Reference

Each theme must define these variables:

- `--theme-bg`: Main background color
- `--theme-fg`: Main text color
- `--theme-button`: Button background
- `--theme-button-hover`: Button hover state
- `--theme-header`: Header background
- `--theme-header-text`: Header text color
- `--theme-border`: Border color
- `--theme-positive`: Positive/gain color
- `--theme-negative`: Negative/loss color
- `--theme-text-bg`: Text input background
- `--theme-gray`: Secondary text color
- `--theme-font`: Font family
- `--theme-section-bg`: Section background
- `--theme-card-bg`: Card background
- `--theme-shadow`: Shadow color
- `--theme-scrollbar-track`: Scrollbar track
- `--theme-scrollbar-thumb`: Scrollbar thumb
- `--theme-loading-bg`: Loading overlay background
