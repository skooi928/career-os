# Theme System Documentation

## Overview
The Career OS application has a built-in light/dark theme system that persists across sessions. The theme can be toggled globally using the theme toggle button in the navbar.

## How to Use the Theme in Components

### 1. **Using CSS Variables (Recommended)**
All colors are defined as CSS variables that automatically adapt to the current theme. Use these in your component styles:

```css
/* Background Colors */
--color-background      /* Main background */
--color-surface         /* Surface elements */
--color-surface-secondary  /* Secondary surfaces */

/* Text Colors */
--color-text           /* Main text */
--color-text-secondary /* Secondary text */
--color-text-tertiary  /* Tertiary text */

/* UI Colors */
--color-primary        /* Primary action color */
--color-primary-hover  /* Primary hover state */
--color-secondary      /* Secondary elements */
--color-hover          /* Hover background */
--color-border         /* Border color */
--color-input-bg       /* Input background */
--color-input-border   /* Input border */

/* Status Colors */
--color-success        /* Success state */
--color-error          /* Error state */
--color-warning        /* Warning state */
--color-info           /* Info state */

/* Shadows */
--shadow-sm            /* Small shadow */
--shadow-md            /* Medium shadow */
--shadow-lg            /* Large shadow */
```

### 2. **Example Component**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `
    <div class="card">
      <h2>Hello World</h2>
      <p>This respects the current theme</p>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      padding: 16px;
      border-radius: 8px;
    }
  `]
})
export class ExampleComponent {}
```

### 3. **Using the ThemeService (if needed)**
For dynamic theme changes or theme-aware logic:

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-my-component',
  template: `
    <div>Current theme: {{ themeService.theme() }}</div>
  `
})
export class MyComponent {
  themeService = inject(ThemeService);
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

### 4. **Adding the Theme Toggle Button**
The theme toggle is already included in the app-shell navbar. For pages outside of app-shell, you can import and use it:

```typescript
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ThemeToggleComponent],
  template: `
    <div class="login-container">
      <app-theme-toggle></app-theme-toggle>
      <!-- rest of your content -->
    </div>
  `
})
export class LoginComponent {}
```

## Theme Persistence
- The user's theme preference is automatically saved to localStorage
- The app respects the system's `prefers-color-scheme` setting on first visit
- Theme preference is loaded on app initialization

## Adding New Pages
1. Use CSS variables for all colors
2. Optionally import `ThemeToggleComponent` if you want it on that page
3. All colors will automatically adapt when the user toggles the theme

## Customizing Theme Variables
To add new theme colors, edit:
- [`src/styles.css`](../styles.css) - Define the CSS variables for light and dark themes
- Follow the existing pattern for consistency
