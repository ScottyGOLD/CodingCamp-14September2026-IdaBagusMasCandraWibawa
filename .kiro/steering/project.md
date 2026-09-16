# Expense & Budget Visualizer — Project Steering

## Project Overview
A mobile-friendly daily spending tracker built as a single-page web app.
No frameworks, no backend, no build tools — just HTML, CSS, and vanilla JavaScript.

## Technical Constraints
- **TC-1 Stack:** HTML + CSS + Vanilla JavaScript only. No React, Vue, or any framework.
- **TC-2 Storage:** Browser `localStorage` API. All data is client-side only.
- **TC-3 Compatibility:** Must work in modern browsers (Chrome, Firefox, Edge, Safari).

## File Structure
```
index.html        — App shell and all section markup
css/style.css     — All styles including CSS custom properties for theming
js/script.js      — All app logic (no modules, single file)
```

## Architecture & Key Decisions

### Theme System
- CSS custom properties defined on `:root` (light) and `body.dark` (dark mode).
- `applyTheme(isDark)` toggles `body.dark` class and updates icon `src` colors.
- Theme preference persisted in `localStorage` under key `ebv_theme`.
- **Sun button (`btn-sun`) → light mode. Moon button (`btn-moon`) → dark mode.**
- Icon IDs (Icons8): sun = `26031`, moon = `648`. Color param swaps between `000000` (light) and `ffffff` (dark).

### Data Model
Each transaction is a plain object:
```js
{ id: Date.now(), name: String, amount: Number, category: String }
```
- No `type` field — all transactions are expenses.
- Stored as a JSON array in `localStorage` under key `ebv_transactions`.
- Newest first (`.unshift()`).

### Categories
- Default categories: `["Food", "Transport", "Fun"]`.
- Custom categories saved to `localStorage` under key `ebv_categories`.
- The category `<select>` always has `"+ New Category"` (`value="__new__"`) as the last option.
- Selecting `"+ New Category"` reveals the new category text input and focuses it.
- On submit, new category is normalised (first letter capitalised), saved, and selected automatically.
- After submit, the new category field hides again.

### LocalStorage Keys
| Key | Contents |
|---|---|
| `ebv_transactions` | JSON array of transaction objects |
| `ebv_categories` | JSON array of category strings |
| `ebv_theme` | `"dark"` or `"light"` |

## UI Sections

### Header
- Title left, sun + moon buttons right.
- Full-width bleed using `width: calc(100% + 32px)` + `margin-left: -16px` to escape body padding.

### Balance Card (`.balance`)
- Shows total spending (sum of all transactions).
- Amount always green via `--balance-amount`.

### Add Transaction Form (`.forms`)
- Fields: Item Name, Amount ($), Category select, New Category (hidden by default).
- Submit button adds transaction, resets form, re-renders everything.

### Transaction History (`.transac-list`)
- Filter dropdown (top right) filters by category.
- Each row: red dot · name · `−$amount` (red) · category pill · delete ✕ button.
- Empty state shown when no transactions match filter.

### Spending Chart (`.spending`)
- Canvas pie chart — only renders when there are transactions.
- Slices grouped by category, sorted largest first.
- Legend below chart with colour swatch, category name, amount, and percentage.
- Redraws on theme change so slice gap color matches the surface.

## CSS Conventions
- All colours via CSS custom properties — never hardcoded except chart palette.
- Shared card styles on `.balance, .forms, .transac-list, .spending`:
  `margin-top: 20px`, `border-radius: 12px`, `box-shadow: var(--shadow)`, `background: var(--surface)`.
- Body padding: `0 16px 48px` — gives cards breathing room from screen edges.
- Font: `"Courier New", Courier, monospace` everywhere.

## Chart Colour Palette
```js
["#e63946", "#2a9d8f", "#e9c46a", "#457b9d", "#f4a261",
 "#6a4c93", "#52b788", "#f77f00", "#4cc9f0", "#b5838d"]
```

## Non-Functional Requirements
- **NFR-1 Simplicity:** Clean minimal interface, no complex setup.
- **NFR-2 Performance:** Fast load, no lag on data updates.
- **NFR-3 Visual Design:** Clear hierarchy, readable monospace typography, consistent card layout.
