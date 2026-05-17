# Meal Planner Codex User Guide

Audience: users asking Codex to operate Meal Planner data.

This guide is for users who want Codex to operate Obsidian Meal Planner data directly. Plugin development instructions live in `AGENTS.md`; if you only want to plan meals, create recipes, update ingredients, or export shopping lists, use this guide.

## Data Locations

- Plugin directory: repo / plugin root
- Plugin settings and meal plans: `data.json`
- Recipe notes folder: configured by `data.json.recipeFolder`, default `recipe/`
- Ingredient notes folder: configured by `data.json.ingredientsFolder`, default `ingredients/`
- Obsidian release files: `manifest.json`, `main.js`, `styles.css`

Important: if Codex is only planning meals, editing recipes, or updating ingredient metadata, it usually does not need to edit `src/` or build the plugin. Only plugin behavior changes should follow the test/build workflow in `AGENTS.md`.

## Example Codex Requests

```text
Use meal-planner to plan dinners from next Monday to Sunday. Prefer existing recipes and do not overwrite existing breakfast or lunch plans.
```

```text
Export the meal plan from 2026-05-18 to 2026-05-24 as text I can paste into WhatsApp.
```

```text
Create a recipe note for Tomato Beef Rice, 2 servings, with beef 250g, tomatoes 2 units, and rice 2 bowls.
```

```text
Generate this week's shopping list, keep pantry items in a separate section, and point out ingredients that have no quantity.
```

```text
Copy Wednesday dinner to Friday dinner and set servings to 2.
```

## Meal Plan Data Format

Meal plans are stored in `data.json.plans`:

```json
{
  "2026-05-18": {
    "Dinner": [
      {
        "path": "recipe/Salmon Pasta.md",
        "name": "Salmon Pasta",
        "targetServings": 2
      }
    ]
  }
}
```

Rules:

- Dates use `YYYY-MM-DD`.
- Meal names should usually come from `defaultMeals`, normally `Breakfast`, `Lunch`, and `Dinner`; custom meals such as `Snack` are allowed.
- `path` should point to the recipe note.
- `name` should match the recipe frontmatter `name` or filename.
- `targetServings` is optional; omit it to use the recipe's original servings.
- When merging plans, avoid deleting unrelated meals on the same date.

## Recipe Note Format

Recipe notes should usually live in `recipe/`:

```markdown
---
type: recipe
name: Salmon Pasta
servings: 2
tags:
  - dinner
ingredients:
  - Salmon
  - Pasta
  - Cream
image: salmon-pasta.jpg
---

## Ingredients / 材料

- [[Salmon]] 250g
- [[Pasta]] 180g
- [[Cream]] 100ml

## Method / 做法

1. ...
```

The plugin reads:

- `name`: display name.
- `servings`: used to scale ingredient amounts when `targetServings` is set.
- `tags`: used by recipe picker search.
- `ingredients`: ingredient list.
- `- [[Ingredient]] amount` lines under `## Ingredients / 材料`: used for ingredient details, shopping lists, and nutrition.
- `image`, `cover`, `thumbnail`, `banner`, or the first image in the note: used as the recipe image.

The names in frontmatter `ingredients` should match the `[[Ingredient]]` links so the plugin can attach quantities correctly.

## Ingredient Note Format

Ingredient notes should usually live in `ingredients/`, with filenames matching recipe ingredient names, such as `ingredients/Salmon.md`.

```markdown
---
category: Seafood
pantry: false
nutrition_ref:
  - Protein
energy_per_100g: 208
protein_per_100g: 20
fat_per_100g: 13
---
```

Shopping category fields:

- `category`
- `grocery_category`
- `shopping_category`

Pantry / usually stocked fields:

- `pantry`
- `staple`
- `usually_stocked`

If category is missing, the plugin infers one from the ingredient name, such as `Produce`, `Seafood`, `Protein`, `Dairy`, `Dry Goods`, or `Seasonings`.

## Nutrition Metadata

The plugin reads nutrient fields from ingredient note frontmatter:

```yaml
energy_per_100g: 208
protein_per_100g: 20
fat_per_100g: 13
carbs_per_100g: 0
sodium_per_100g: 59
```

Supported bases:

- `_per_100g`
- `_per_100ml`
- `_per_1g`
- `_per_tbsp`
- `_per_tsp`
- `_per_pack`
- `_per_unit`

Display units:

- `energy` displays as `kcal`
- `sodium`, `calcium`, and `potassium` display as `mg`
- Other nutrients display as `g`

## Import / Export Text Format

The plugin supports this plain text format for WhatsApp-friendly export and re-import:

```text
Meal Plan: 2026-05-18 to 2026-05-24

2026-05-18 Mon
Breakfast
- Oatmeal
Dinner
- Salmon Pasta (servings: 2)
```

Import behavior:

- `Merge`: keeps existing plans and skips exact duplicates.
- `Replace date range`: clears plans in the imported range before writing the pasted plan.
- Recipes are matched by exact name, path, or case-insensitive name.
- Unmatched recipes can still be imported by name and will appear as missing until a matching recipe note exists.

## Codex Operating Rules

When asking Codex to edit Meal Planner data, ask it to:

- Read `data.json` first to confirm `recipeFolder`, `ingredientsFolder`, and `defaultMeals`.
- When changing meal plans, only edit the relevant dates in `data.json.plans`; do not rewrite unrelated settings.
- When creating recipes, create Markdown notes and use wiki links for ingredients.
- When adding ingredient metadata, create or update matching ingredient notes.
- When generating shopping lists, calculate from recipe ingredients, servings, `targetServings`, and pantry/category metadata.
- When changing plugin behavior, read `AGENTS.md`, edit `src/**/*.ts`, run `npm test` and `npm run build`, and keep the generated `main.js` release artifact.

## Obsidian UI Features

In Obsidian:

- Run `Meal Planner: Open meal planner` from the command palette.
- Use the ribbon calendar icon to open Meal Planner.
- Switch between Calendar and Shopping with the segmented control.
- Switch calendar ranges with Month / Week / Day.
- Switch recipe card details with Recipe / Ingredients / Nutrition.
- Switch grouping with Meals / All day.
- Use `Import` / `Export` to move meal plan text.
- Use the recipe card menu to move, copy, set target servings, or remove a recipe.
- In Shopping view, choose from/to dates and toggle Pantry.
