export interface MealPlanEntry {
  path?: string;
  name?: string;
  targetServings?: number;
}

export type MealPlans = Record<string, Record<string, MealPlanEntry[]>>;

export interface IngredientDetail {
  name: string;
  amount: string;
}

export interface RecipeSummary {
  path: string;
  name: string;
  servings?: string | number | null;
  servingsNumber?: number | null;
  tags: string[];
  ingredients: string[];
  ingredientDetails: IngredientDetail[];
}

export interface ShoppingListItem {
  key: string;
  name: string;
  category: string;
  pantry: boolean;
  label: string;
  recipeNames: Set<string>;
  dateKeys: Set<string>;
  unit?: string;
  value?: number;
  amounts?: Set<string>;
}

export interface ShoppingListGroup {
  category: string;
  items: ShoppingListItem[];
  pantry?: boolean;
}

export interface ShoppingListResult {
  groups: ShoppingListGroup[];
  pantry: ShoppingListItem[];
  hiddenPantryCount: number;
  itemCount: number;
  recipeCount: number;
  warnings: string[];
}

export interface MealPlanRangeEntry {
  dayKey: string;
  mealName: string;
  entry: MealPlanEntry;
  index: number;
}
