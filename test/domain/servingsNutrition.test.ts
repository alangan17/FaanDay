import { describe, expect, it } from "vitest";
import { estimateNutrients } from "../../src/domain/nutrition";
import { parseQuantity, quantityForEntry, scaledIngredientAmount } from "../../src/domain/servings";
import type { RecipeSummary } from "../../src/domain/types";

const recipe: RecipeSummary = {
  path: "recipe/Test.md",
  name: "Test",
  servings: "2",
  servingsNumber: 2,
  tags: [],
  ingredients: [],
  ingredientDetails: [],
};

describe("servings and nutrition", () => {
  it("scales ingredient quantities by target servings", () => {
    expect(scaledIngredientAmount("100g", recipe, { targetServings: 4 })).toBe("200 g");
  });

  it("treats per-serving amounts as multiplied by target servings", () => {
    expect(quantityForEntry("50g per serving", recipe, { targetServings: 3 })).toEqual({ value: 150, unit: "g" });
  });

  it("parses fractions and ranges", () => {
    expect(parseQuantity("1/2 tbsp")).toEqual({ value: 0.5, unit: "tbsp" });
    expect(parseQuantity("2-4 eggs")).toEqual({ value: 3, unit: "unit" });
  });

  it("does not estimate nutrients for unsupported unit/base combinations", () => {
    expect(estimateNutrients({ energy_per_100g: 200 }, { value: 2, unit: "unit" })).toEqual([]);
  });

  it("estimates nutrients for supported quantity bases", () => {
    expect(estimateNutrients({ energy_per_100g: 200 }, { value: 50, unit: "g" })).toEqual([
      { name: "Energy", value: 100, unit: "kcal" },
    ]);
  });
});
