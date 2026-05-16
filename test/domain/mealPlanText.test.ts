import { describe, expect, it } from "vitest";
import { formatMealPlanText, parseMealPlanText } from "../../src/domain/mealPlanText";
import type { MealPlans, RecipeSummary } from "../../src/domain/types";

const recipes: RecipeSummary[] = [
  {
    path: "recipe/Oatmeal.md",
    name: "Oatmeal",
    servings: "2",
    servingsNumber: 2,
    tags: [],
    ingredients: [],
    ingredientDetails: [],
  },
  {
    path: "recipe/Salmon Pasta.md",
    name: "Salmon Pasta",
    servings: "4",
    servingsNumber: 4,
    tags: [],
    ingredients: [],
    ingredientDetails: [],
  },
];

describe("meal plan text import/export", () => {
  it("round trips valid exported plans with target servings", () => {
    const plans: MealPlans = {
      "2026-05-18": {
        Breakfast: [{ path: "recipe/Oatmeal.md", name: "Oatmeal" }],
        Dinner: [{ path: "recipe/Salmon Pasta.md", name: "Salmon Pasta", targetServings: 2 }],
      },
    };

    const text = formatMealPlanText(plans, recipes, "2026-05-18", "2026-05-18");
    const parsed = parseMealPlanText(text, recipes, ["Breakfast", "Lunch", "Dinner"]);

    expect(parsed.warnings).toEqual([]);
    expect(parsed.entries).toEqual([
      { dayKey: "2026-05-18", mealName: "Breakfast", entry: { path: "recipe/Oatmeal.md", name: "Oatmeal" } },
      { dayKey: "2026-05-18", mealName: "Dinner", entry: { path: "recipe/Salmon Pasta.md", name: "Salmon Pasta", targetServings: 2 } },
    ]);
  });

  it("exports empty ranges explicitly", () => {
    expect(formatMealPlanText({}, recipes, "2026-05-18", "2026-05-24")).toBe([
      "Meal Plan: 2026-05-18 to 2026-05-24",
      "",
      "No planned recipes.",
    ].join("\n"));
  });

  it("falls back to dinner when a recipe line has no meal heading", () => {
    const parsed = parseMealPlanText("2026-05-18 Mon\n- Oatmeal", recipes, ["Breakfast", "Lunch", "Dinner"]);

    expect(parsed.entries[0]).toEqual({
      dayKey: "2026-05-18",
      mealName: "Dinner",
      entry: { path: "recipe/Oatmeal.md", name: "Oatmeal" },
    });
    expect(parsed.warnings).toContain("Line 2: missing meal heading, imported under Dinner.");
  });

  it("keeps unresolved recipes importable and warns", () => {
    const parsed = parseMealPlanText("2026-05-18 Mon\nDinner\n- Missing Soup", recipes, ["Breakfast", "Lunch", "Dinner"]);

    expect(parsed.entries[0].entry).toEqual({ name: "Missing Soup" });
    expect(parsed.warnings).toContain("Line 3: recipe not found: Missing Soup.");
  });

  it("warns when the header date range is reversed", () => {
    const parsed = parseMealPlanText("Meal Plan: 2026-05-24 to 2026-05-18\n2026-05-18 Mon\nDinner\n- Oatmeal", recipes, ["Breakfast", "Lunch", "Dinner"]);

    expect(parsed.fromKey).toBe("2026-05-24");
    expect(parsed.toKey).toBe("2026-05-18");
    expect(parsed.warnings).toContain("Header date range is reversed.");
  });
});
