# Design System - AI Tools Platform

## 🎨 Color Palette

### Primary Colors
- **Primary (Indigo)**: Brand color, main CTAs, links
  - `indigo-50` to `indigo-950`
  - Main: `indigo-600` (#4F46E5)

- **Secondary (Purple)**: Accent color, highlights
  - `purple-50` to `purple-950`
  - Main: `purple-600` (#9333EA)

### Semantic Colors
- **Success (Emerald)**: Positive feedback, success states
  - Main: `emerald-600` (#059669)

- **Warning (Amber)**: Warnings, cautions
  - Main: `amber-600` (#D97706)

- **Error (Rose)**: Errors, destructive actions
  - Main: `rose-600` (#E11D48)

- **Info (Sky)**: Informational messages
  - Main: `sky-600` (#0284C7)

### Neutral Colors
- **Gray Scale**: Backgrounds, text, borders
  - `slate-50` to `slate-950`
  - Text: `slate-900` (dark), `slate-600` (muted)
  - Background: `slate-50`, `white`
  - Borders: `slate-200`, `slate-300`

## 📝 Typography

### Font Families
- **Sans**: Inter (primary)
- **Mono**: JetBrains Mono (code, technical)

### Font Sizes
- `text-xs`: 0.75rem (12px) - Captions, labels
- `text-sm`: 0.875rem (14px) - Body small, secondary text
- `text-base`: 1rem (16px) - Body text
- `text-lg`: 1.125rem (18px) - Large body text
- `text-xl`: 1.25rem (20px) - Small headings
- `text-2xl`: 1.5rem (24px) - Section headings
- `text-3xl`: 1.875rem (30px) - Page titles
- `text-4xl`: 2.25rem (36px) - Hero text

### Font Weights
- `font-normal`: 400 - Body text
- `font-medium`: 500 - Emphasis
- `font-semibold`: 600 - Headings, buttons
- `font-bold`: 700 - Strong emphasis

## 📏 Spacing Scale

Using Tailwind's default 4px base scale:
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)

## 🔲 Border Radius

- `rounded-sm`: 0.125rem (2px) - Subtle
- `rounded`: 0.25rem (4px) - Default
- `rounded-md`: 0.375rem (6px) - Moderate
- `rounded-lg`: 0.5rem (8px) - Cards, panels
- `rounded-xl`: 0.75rem (12px) - Prominent cards
- `rounded-2xl`: 1rem (16px) - Hero sections
- `rounded-full`: 9999px - Pills, avatars

## 🌫️ Shadows

- `shadow-sm`: Subtle elevation
- `shadow`: Default card shadow
- `shadow-md`: Moderate elevation (dropdowns)
- `shadow-lg`: High elevation (modals)
- `shadow-xl`: Maximum elevation

## 🎯 Component Patterns

### Buttons
- **Primary**: `bg-indigo-600 hover:bg-indigo-700 text-white`
- **Secondary**: `bg-slate-200 hover:bg-slate-300 text-slate-900`
- **Outline**: `border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50`
- **Ghost**: `text-indigo-600 hover:bg-indigo-50`
- **Danger**: `bg-rose-600 hover:bg-rose-700 text-white`

### Cards
- Background: `bg-white`
- Border: `border border-slate-200`
- Padding: `p-6`
- Radius: `rounded-lg`
- Shadow: `shadow-sm hover:shadow-md`

### Inputs
- Border: `border border-slate-300 focus:border-indigo-500`
- Ring: `focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`
- Padding: `px-4 py-2`
- Radius: `rounded-md`

### Badges
- Padding: `px-2.5 py-0.5`
- Radius: `rounded-full`
- Size: `text-xs font-medium`
- Variants: Different colors per category/status

## ♿ Accessibility Guidelines

### Color Contrast
- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Large text (18pt+): Minimum 3:1 ratio
- Interactive elements: Clear focus indicators

### Focus States
- All interactive elements must have visible focus states
- Ring: `focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`

### Touch Targets
- Minimum size: 44x44px (iOS/Android guidelines)
- Spacing between targets: At least 8px

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Label all form inputs
- Use semantic tags (nav, main, aside, footer)

### ARIA Labels
- Add aria-label for icon-only buttons
- Use aria-describedby for error messages
- Implement aria-live regions for dynamic content

## 📱 Responsive Breakpoints

- **Mobile**: Default (320px - 639px)
- **Tablet**: `sm:` (640px - 767px)
- **Desktop**: `md:` (768px - 1023px)
- **Large Desktop**: `lg:` (1024px - 1279px)
- **XL Desktop**: `xl:` (1280px+)

## 🧩 Component Library

### Core Components
- Button (5 variants: primary, secondary, outline, ghost, danger)
- Card (with header, body, footer slots)
- Input (text, email, password, textarea, select)
- Badge (status indicators, tags)
- Modal (dialog overlay)
- Toast (notification system)
- Dropdown (menu component)
- Navigation (responsive header)
- Avatar (user profile image)

### Layout Components
- Container (max-width wrapper)
- Grid (responsive grid system)
- Stack (vertical spacing)
- Divider (visual separator)

## 🎭 Animation & Transitions

### Durations
- Fast: `duration-150` (150ms) - Hover states
- Normal: `duration-300` (300ms) - Default transitions
- Slow: `duration-500` (500ms) - Complex animations

### Easing
- Default: `ease-in-out`
- Enter: `ease-out`
- Exit: `ease-in`

### Common Transitions
- `transition-colors` - Color changes
- `transition-transform` - Scale, translate
- `transition-opacity` - Fade in/out
- `transition-all` - Multiple properties

## 📦 Usage Examples

### Button
```tsx
<button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150">
  Primary Button
</button>
```

### Card
```tsx
<div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">Card Title</h3>
  <p className="text-slate-600">Card content goes here.</p>
</div>
```

### Input
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
  placeholder="Enter text"
/>
```
