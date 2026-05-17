# Meal Planner

[廣東話](README.zh-HK.md) | English

Plan weekly meals in Obsidian and generate a grocery list from your recipe notes.

Meal Planner turns a folder of Markdown recipes into a practical cooking workflow:

- Add recipes to a calendar by breakfast, lunch, dinner, or your own meal names.
- Switch between recipe, ingredient, and nutrition views while planning.
- Generate a supermarket-style shopping list for any date range.
- Export the plan as plain text that is easy to paste into WhatsApp.

## Quick start

1. Create recipe notes in your recipe folder. The default folder is `recipe`.
2. Open the Meal Planner view from the ribbon or command palette.
3. Select a day, add a recipe, then switch to Shopping to generate the shopping list.

If you already keep recipes in Obsidian, start by matching the recipe format below. If you are starting from scratch, create one recipe first and plan a single dinner before filling out the rest of the week.

## Recipe format

Meal Planner reads recipe metadata from frontmatter and ingredient amounts from the note body.

```markdown
---
name: Salmon Pasta
servings: 2
tags:
  - dinner
  - pasta
ingredients:
  - Salmon
  - Tomato
  - Pasta
  - Salt
---

## Ingredients

- Salmon: 250g
- Tomato: 200g
- Pasta: 180g
- Salt: 1 tsp
```

Useful recipe fields:

- `name`: Display name in the planner. Falls back to the note title.
- `servings`: Default serving count used when scaling ingredient amounts.
- `tags`: Searchable labels shown in recipe details.
- `ingredients`: Ingredient names used for lookup and shopping metadata.

## Ingredient notes

Ingredient notes are optional, but they make shopping lists cleaner. The default folder is `ingredients`.

```markdown
---
category: Produce
pantry: false
energy_per_100g: 18
---
```

Shopping category aliases:

- `category`
- `grocery_category`
- `shopping_category`

Pantry aliases:

- `pantry`
- `staple`
- `usually_stocked`

Pantry items stay visible in their own section, so common seasonings are easy to ignore without losing them from the plan.

## Shopping list

Open the Meal Planner view and switch from Calendar to Shopping. Choose a from date and to date to aggregate planned recipe ingredients into a supermarket-style list.

Meal Planner groups ingredients by category, combines matching quantities, tracks which recipes and days need each item, and can hide pantry staples when you only want to see what to buy.

## Import and export

Use Import and Export in the Meal Planner toolbar to move meal plans as plain text. Export uses the selected shopping range in Shopping mode, or the visible calendar range in Calendar mode.

```text
Meal Plan: 2026-05-18 to 2026-05-24

2026-05-18 Mon
Breakfast
- Oatmeal
Dinner
- Salmon Pasta (servings: 2)
```

Import supports the same plain text format in a textarea. Choose Merge to keep existing plans and skip exact duplicates, or Replace date range to clear the imported date range before writing the pasted plan.

Recipes are matched by exact name, path, or case-insensitive name. Unresolved recipes are still imported by name and shown as missing until a matching recipe exists.

## Using Codex

You can use Codex as an assistant for operating your Meal Planner vault data. Ask it to turn rough meal ideas into a dated plan, create recipe notes in the expected format, add ingredient metadata, clean up pantry categories, or prepare an exportable plan for sharing.

Example requests:

- "Plan dinners for next week using my existing recipe notes."
- "Create ingredient notes for the missing shopping list items."
- "Make this meal plan WhatsApp-friendly."
- "Scale these recipes for 4 people and update the plan."

For the full user workflow, see [CODEX_USER_GUIDE.md](CODEX_USER_GUIDE.md).

## Settings

Meal Planner settings let you choose:

- Recipe folder
- Ingredients folder
- Default meal names
- Stable release update checks

The default meals are `Breakfast`, `Lunch`, and `Dinner`, but you can add your own meal names in settings or while planning.

## Update from inside Obsidian

The plugin can check GitHub for the latest stable release from inside Obsidian:

1. Open Settings.
2. Go to Community plugins.
3. Open Meal Planner settings.
4. Select Check and install under Stable release updates.

This downloads `manifest.json`, `main.js`, and `styles.css` from the matching `release/vX.Y.Z` branch. Reload Obsidian after installing an update.
