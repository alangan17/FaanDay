import { quantityForEntry, formatAmount, displayUnit } from "./servings";
import { cleanWiki, normalizeArray, titleCaseWords } from "./text";
import type { MealPlanEntry, MealPlanRangeEntry, RecipeSummary, ShoppingListGroup, ShoppingListItem, ShoppingListResult } from "./types";

export type IngredientMetadataResolver = (name: string) => Record<string, unknown>;

export function shoppingListForEntries(entries: MealPlanRangeEntry[], recipes: RecipeSummary[], metadataForIngredient: IngredientMetadataResolver, showPantryItems: boolean): ShoppingListResult {
  const recipeByPath = new Map(recipes.map((recipe) => [recipe.path, recipe]));
  const totals = new Map<string, ShoppingListItem>();
  const unknowns = new Map<string, ShoppingListItem>();
  const warnings: string[] = [];

  entries.forEach(({ dayKey, entry }) => {
    const recipe = entry.path ? recipeByPath.get(entry.path) : undefined;
    if (!recipe) {
      warnings.push(`Recipe file missing: ${entry.name || entry.path}`);
      return;
    }

    recipe.ingredientDetails.forEach((ingredient) => {
      const meta = metadataForIngredient(ingredient.name);
      const category = shoppingCategoryForIngredient(ingredient.name, meta);
      const pantry = isPantryIngredient(ingredient.name, meta, category);
      const base = {
        name: ingredient.name,
        category,
        pantry,
        recipeNames: new Set([recipe.name]),
        dateKeys: new Set([dayKey]),
      };
      const quantity = quantityForEntry(ingredient.amount, recipe, entry);

      if (!quantity) {
        const key = `${ingredient.name}::unknown::${category}::${pantry}`;
        const current = unknowns.get(key) || { ...base, amounts: new Set<string>(), key: "", label: "" };
        if (ingredient.amount) current.amounts?.add(ingredient.amount);
        current.recipeNames.add(recipe.name);
        current.dateKeys.add(dayKey);
        unknowns.set(key, current);
        return;
      }

      const key = `${ingredient.name}::${quantity.unit}::${category}::${pantry}`;
      const current = totals.get(key) || { ...base, value: 0, unit: quantity.unit, key: "", label: "" };
      current.value = (current.value || 0) + quantity.value;
      current.recipeNames.add(recipe.name);
      current.dateKeys.add(dayKey);
      totals.set(key, current);
    });
  });

  const knownItems = Array.from(totals.values()).map((item) => ({
    ...item,
    label: `${formatAmount(item.value || 0)} ${displayUnit(item.unit || "")}`,
    key: shoppingItemKey(item.name, item.category, item.pantry, item.unit),
  }));
  const unknownItems = Array.from(unknowns.values()).map((item) => ({
    ...item,
    label: item.amounts?.size ? Array.from(item.amounts).join(" + ") : "as needed",
    key: shoppingItemKey(item.name, item.category, item.pantry, "unknown"),
  }));

  const items = knownItems.concat(unknownItems).sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare) return categoryCompare;
    return a.name.localeCompare(b.name);
  });

  const visiblePantry = showPantryItems ? items.filter((item) => item.pantry) : [];
  const hiddenPantryCount = showPantryItems ? 0 : items.filter((item) => item.pantry).length;
  const regularItems = items.filter((item) => !item.pantry);
  const groups: ShoppingListGroup[] = [];
  const byCategory = new Map<string, ShoppingListItem[]>();

  regularItems.forEach((item) => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category)?.push(item);
  });

  preferredShoppingCategories().forEach((category) => {
    const categoryItems = byCategory.get(category);
    if (categoryItems?.length) {
      groups.push({ category, items: categoryItems });
      byCategory.delete(category);
    }
  });

  Array.from(byCategory.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryItems]) => groups.push({ category, items: categoryItems }));

  return {
    groups,
    pantry: visiblePantry.sort((a, b) => a.name.localeCompare(b.name)),
    hiddenPantryCount,
    itemCount: regularItems.length + visiblePantry.length,
    recipeCount: new Set(entries.map((item) => item.entry.path)).size,
    warnings,
  };
}

export function ingredientsForPlanEntries(entries: Array<{ entry: MealPlanEntry }>, recipes: RecipeSummary[]): Array<{ name: string; label: string }> {
  const recipeByPath = new Map(recipes.map((recipe) => [recipe.path, recipe]));
  const totals = new Map<string, { name: string; value: number; unit: string }>();
  const unknowns = new Map<string, Set<string>>();

  entries.forEach(({ entry }) => {
    const recipe = entry.path ? recipeByPath.get(entry.path) : undefined;
    if (!recipe) return;
    recipe.ingredientDetails.forEach((ingredient) => {
      const quantity = quantityForEntry(ingredient.amount, recipe, entry);
      if (!quantity) {
        const key = ingredient.name;
        const values = unknowns.get(key) || new Set<string>();
        if (ingredient.amount) values.add(ingredient.amount);
        unknowns.set(key, values);
        return;
      }
      const key = `${ingredient.name}::${quantity.unit}`;
      const current = totals.get(key) || { name: ingredient.name, value: 0, unit: quantity.unit };
      current.value += quantity.value;
      totals.set(key, current);
    });
  });

  const known = Array.from(totals.values()).map((item) => ({
    name: item.name,
    label: `${item.name}: ${formatAmount(item.value)} ${displayUnit(item.unit)}`,
  }));

  const unknown = Array.from(unknowns.entries()).map(([name, values]) => ({
    name,
    label: values.size ? `${name}: ${Array.from(values).join(" + ")}` : `${name}: as needed`,
  }));

  return known.concat(unknown).sort((a, b) => a.name.localeCompare(b.name));
}

export function shoppingCategoryForIngredient(name: string, meta: Record<string, unknown>): string {
  const explicit = firstValue(meta.category, meta.grocery_category, meta.shopping_category);
  if (explicit) return titleCaseWords(cleanWiki(explicit));

  const normalized = normalizeIngredientName(name);
  const rules = shoppingCategoryRules();
  const match = rules.find((rule) => rule.pattern.test(normalized));
  return match ? match.category : "Other";
}

export function isPantryIngredient(name: string, meta: Record<string, unknown>, category: string): boolean {
  const explicit = firstPresentValue(meta.pantry, meta.staple, meta.usually_stocked);
  if (explicit.present) return truthyFrontmatter(explicit.value);
  if (category === "Seasonings") return true;
  return pantryIngredientPattern().test(normalizeIngredientName(name));
}

export function shoppingItemKey(name: unknown, category: unknown, pantry: unknown, unit: unknown): string {
  return [name, category, pantry ? "pantry" : "buy", unit].map((part) => String(part || "").toLowerCase()).join("::");
}

export function normalizeIngredientName(value: unknown): string {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}

export function truthyFrontmatter(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return /^(true|yes|y|1|on)$/i.test(String(value || "").trim());
}

export function preferredShoppingCategories(): string[] {
  return [
    "Produce",
    "Protein",
    "Seafood",
    "Dairy",
    "Dry Goods",
    "Canned & Jarred",
    "Frozen",
    "Bakery",
    "Seasonings",
    "Other",
  ];
}

export function shoppingCategoryRules(): Array<{ category: string; pattern: RegExp }> {
  return [
    { category: "Seasonings", pattern: pantryIngredientPattern() },
    { category: "Produce", pattern: /vegetable|veggie|fruit|herb|mushroom|tomato|potato|onion|garlic|ginger|scallion|spring onion|cilantro|parsley|lettuce|cabbage|carrot|celery|pepper|chili|lemon|lime|banana|apple|菜|蔥|薑|蒜|菇|蘑菇|番茄|蕃茄|薯|蘿蔔|椰菜|芫茜|檸檬/ },
    { category: "Seafood", pattern: /fish|salmon|tuna|shrimp|prawn|scallop|clam|mussel|seafood|魚|蝦|帶子|蜆|青口|海鮮/ },
    { category: "Protein", pattern: /chicken|beef|pork|lamb|turkey|meat|egg|tofu|bean curd|豆腐|蛋|雞|牛|豬|羊|肉/ },
    { category: "Dairy", pattern: /milk|cream|butter|cheese|yogurt|yoghurt|kefir|奶|忌廉|牛油|芝士|乳酪/ },
    { category: "Dry Goods", pattern: /rice|noodle|pasta|flour|oat|grain|bean|lentil|麵|麵粉|飯|米|意粉|燕麥|豆/ },
    { category: "Canned & Jarred", pattern: /canned|can|jar|paste|罐|樽|醬/ },
    { category: "Frozen", pattern: /frozen|急凍|冰鮮/ },
    { category: "Bakery", pattern: /bread|bun|toast|bagel|包|麵包|多士/ },
  ];
}

export function pantryIngredientPattern(): RegExp {
  return /salt|pepper|oil|olive oil|soy sauce|vinegar|sugar|spice|powder|sauce|sesame|cornstarch|starch|stock|bouillon|miso|gochujang|doenjang|mustard|ketchup|mayo|mayonnaise|鹽|胡椒|油|豉油|醬油|醋|糖|香料|粉|醬|麻油|生粉|粟粉|味噌/;
}

function firstValue(...values: unknown[]): string {
  for (const value of values) {
    const normalized = normalizeArray(value).map(String).map((item) => item.trim()).find((item) => item !== "");
    if (normalized) return normalized;
  }
  return "";
}

function firstPresentValue(...values: unknown[]): { present: boolean; value: unknown } {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return { present: true, value };
  }
  return { present: false, value: "" };
}
