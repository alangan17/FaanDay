# Meal Planner
Organize your recipe in an actionable way

## Shopping list

Open the Meal Planner view and switch from Calendar to Shopping. Choose a from date and to date to aggregate planned recipe ingredients into a supermarket-style list.

Ingredient notes can control shopping categories and pantry staples:

```yaml
category: Seasonings
pantry: true
```

Supported category aliases are `category`, `grocery_category`, and `shopping_category`. Supported pantry aliases are `pantry`, `staple`, and `usually_stocked`. Pantry items stay visible in a separate section so common seasonings are easy to ignore without losing them from the plan.

## Import and export

Use Import and Export in the Meal Planner toolbar to move meal plans as plain text. Export uses the selected shopping range in Shopping mode, or the visible calendar range in Calendar mode, and creates text that is easy to paste into WhatsApp:

```text
Meal Plan: 2026-05-18 to 2026-05-24

2026-05-18 Mon
Breakfast
- Oatmeal
Dinner
- Salmon Pasta (servings: 2)
```

Import supports the same plain text format in a textarea. Choose Merge to keep existing plans and skip exact duplicates, or Replace date range to clear the imported date range before writing the pasted plan. Recipes are matched by exact name, path, or case-insensitive name; unresolved recipes are still imported by name and shown as missing until a matching recipe exists.

## Update from inside Obsidian

The plugin can check GitHub for the latest stable release from inside Obsidian:

1. Open Settings.
2. Go to Community plugins.
3. Open Meal Planner settings.
4. Select Check and install under Stable release updates.

This downloads `manifest.json`, `main.js`, and `styles.css` from the matching `release/vX.Y.Z` branch. Reload Obsidian after installing an update.
