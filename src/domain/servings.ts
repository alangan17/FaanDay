import type { MealPlanEntry, RecipeSummary } from "./types";

export interface ParsedQuantity {
  value: number;
  unit: string;
}

export function parseServingCount(servings: unknown): number | null {
  if (typeof servings === "number" && Number.isFinite(servings) && servings > 0) return servings;
  if (!servings) return null;

  const normalized = String(servings).trim().toLowerCase();
  const range = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (range) return Number(range[2]);

  const single = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!single) return null;
  const parsed = Number(single[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function servingTargetForEntry(entry: MealPlanEntry | undefined, recipe: Pick<RecipeSummary, "servingsNumber">): number | null {
  const target = Number(entry?.targetServings);
  if (Number.isFinite(target) && target > 0) return target;
  return recipe.servingsNumber || null;
}

export function servingScaleForEntry(entry: MealPlanEntry | undefined, recipe: Pick<RecipeSummary, "servingsNumber">): number {
  const base = recipe.servingsNumber;
  const target = servingTargetForEntry(entry, recipe);
  if (!base || !target) return 1;
  return target / base;
}

export function isPerServingAmount(amount: unknown): boolean {
  if (!amount) return false;
  return /\bper\s+(portion|serving)\b|每份/.test(String(amount).toLowerCase());
}

export function quantityForEntry(amount: string, recipe: Pick<RecipeSummary, "servingsNumber">, entry: MealPlanEntry = {}): ParsedQuantity | null {
  const quantity = parseQuantity(amount);
  if (!quantity) return null;

  const target = servingTargetForEntry(entry, recipe);
  const scale = isPerServingAmount(amount) && target
    ? target
    : servingScaleForEntry(entry, recipe);

  return { ...quantity, value: quantity.value * scale };
}

export function scaledIngredientAmount(amount: string, recipe: Pick<RecipeSummary, "servingsNumber">, entry: MealPlanEntry = {}): string {
  if (!amount) return "";
  const quantity = quantityForEntry(amount, recipe, entry);
  if (!quantity) return amount;

  return `${formatAmount(quantity.value)} ${displayUnit(quantity.unit)}`;
}

export function parseQuantity(amount: unknown): ParsedQuantity | null {
  if (!amount) return null;
  const normalized = String(amount)
    .toLowerCase()
    .replace(/湯匙/g, "tbsp")
    .replace(/茶匙/g, "tsp")
    .replace(/隻/g, "unit")
    .replace(/個/g, "unit")
    .replace(/包/g, "pack")
    .replace(/碗/g, "unit")
    .replace(/份/g, "unit");

  const match = normalized.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(g|gram|grams|ml|milliliter|milliliters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pack|packs|unit|each|portion|portions|piece|pieces|banana|egg|eggs)?/);
  if (!match) return null;

  const first = parseNumber(match[1]);
  if (!first) return null;
  const second = match[2] ? parseNumber(match[2]) : null;
  const value = second ? (first + second) / 2 : first;
  const unit = normalizeUnit(match[3] || inferUnit(normalized));
  return { value, unit };
}

export function parseNumber(value: unknown): number {
  const fraction = String(value).match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return Number(value);
}

export function inferUnit(text: string): string {
  if (/\bbanana\b/.test(text)) return "unit";
  if (/\beggs?\b/.test(text)) return "unit";
  if (/\bpack\b/.test(text)) return "pack";
  return "unit";
}

export function normalizeUnit(unit: string): string {
  if (!unit) return "unit";
  if (["gram", "grams"].includes(unit)) return "g";
  if (["milliliter", "milliliters"].includes(unit)) return "ml";
  if (["tablespoon", "tablespoons"].includes(unit)) return "tbsp";
  if (["teaspoon", "teaspoons"].includes(unit)) return "tsp";
  if (["packs"].includes(unit)) return "pack";
  if (["each", "portion", "portions", "piece", "pieces", "banana", "egg", "eggs"].includes(unit)) return "unit";
  return unit;
}

export function conversionFactor(quantity: ParsedQuantity, base: string): number {
  if (base === "100g" && quantity.unit === "g") return quantity.value / 100;
  if (base === "100ml" && quantity.unit === "ml") return quantity.value / 100;
  if (base === "1g" && quantity.unit === "g") return quantity.value;
  if (base === "tbsp" && quantity.unit === "tbsp") return quantity.value;
  if (base === "tsp" && quantity.unit === "tsp") return quantity.value;
  if (base === "pack" && quantity.unit === "pack") return quantity.value;
  if (base === "unit" && quantity.unit === "unit") return quantity.value;
  return 0;
}

export function formatAmount(value: number): string {
  if (value >= 100) return String(Math.round(value));
  if (value >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

export function displayUnit(unit: string): string {
  if (unit === "unit") return "each";
  return unit;
}
