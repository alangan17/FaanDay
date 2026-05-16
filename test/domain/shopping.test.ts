import { describe, expect, it } from "vitest";
import { shoppingCategoryForIngredient, shoppingListForEntries } from "../../src/domain/shopping";
import type { MealPlanRangeEntry, RecipeSummary } from "../../src/domain/types";

const recipes: RecipeSummary[] = [
  {
    path: "recipe/Pasta.md",
    name: "Pasta",
    servings: "2",
    servingsNumber: 2,
    tags: [],
    ingredients: [],
    ingredientDetails: [
      { name: "Tomato", amount: "100g" },
      { name: "Salt", amount: "1 tsp" },
      { name: "Mystery Root", amount: "a splash" },
    ],
  },
  {
    path: "recipe/Soup.md",
    name: "Soup",
    servings: "2",
    servingsNumber: 2,
    tags: [],
    ingredients: [],
    ingredientDetails: [
      { name: "Tomato", amount: "50g" },
    ],
  },
];

const entries: MealPlanRangeEntry[] = [
  { dayKey: "2026-05-18", mealName: "Dinner", entry: { path: "recipe/Pasta.md", name: "Pasta" }, index: 0 },
  { dayKey: "2026-05-19", mealName: "Lunch", entry: { path: "recipe/Soup.md", name: "Soup", targetServings: 4 }, index: 0 },
];

describe("shopping list aggregation", () => {
  it("groups known quantities and tracks recipe/day sources", () => {
    const result = shoppingListForEntries(entries, recipes, () => ({}), true);
    const produce = result.groups.find((group) => group.category === "Produce");
    const tomato = produce?.items.find((item) => item.name === "Tomato");

    expect(tomato?.label).toBe("200 g");
    expect(Array.from(tomato?.recipeNames || [])).toEqual(["Pasta", "Soup"]);
    expect(Array.from(tomato?.dateKeys || [])).toEqual(["2026-05-18", "2026-05-19"]);
  });

  it("keeps unknown amounts as shopping items", () => {
    const result = shoppingListForEntries(entries, recipes, () => ({}), true);
    const mystery = result.groups.flatMap((group) => group.items).find((item) => item.name === "Mystery Root");

    expect(mystery?.label).toBe("a splash");
  });

  it("hides pantry items when pantry display is off", () => {
    const result = shoppingListForEntries(entries, recipes, () => ({}), false);

    expect(result.pantry).toEqual([]);
    expect(result.hiddenPantryCount).toBe(1);
  });

  it("shows pantry items when pantry display is on", () => {
    const result = shoppingListForEntries(entries, recipes, () => ({}), true);

    expect(result.pantry.map((item) => item.name)).toEqual(["Salt"]);
  });

  it("uses frontmatter category overrides before category rules", () => {
    expect(shoppingCategoryForIngredient("Tomato", { shopping_category: "farm stand" })).toBe("Farm Stand");
  });

  it("falls back to rule-based categories", () => {
    expect(shoppingCategoryForIngredient("Tomato", {})).toBe("Produce");
  });
});
