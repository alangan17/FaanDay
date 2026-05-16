import { isDateKey, weekdayShortName } from "./dates";
import { formatAmount } from "./servings";
import { uniqueValues } from "./text";
import type { MealPlanEntry, MealPlanRangeEntry, MealPlans, RecipeSummary } from "./types";

export interface ParsedMealPlan {
  entries: Array<{ dayKey: string; mealName: string; entry: MealPlanEntry }>;
  warnings: string[];
  fromKey: string;
  toKey: string;
  dayCount: number;
  mealCount: number;
}

export function formatMealPlanText(plans: MealPlans, recipes: RecipeSummary[], fromKey: string, toKey: string): string {
  const lines = [`Meal Plan: ${fromKey} to ${toKey}`];
  const entries = mealPlanEntriesForRange(plans, fromKey, toKey);
  const recipeList = recipes || [];
  if (!entries.length) {
    lines.push("", "No planned recipes.");
    return lines.join("\n");
  }

  let currentDay = "";
  let currentMeal = "";
  entries.forEach(({ dayKey, mealName, entry }) => {
    if (dayKey !== currentDay) {
      if (currentDay) lines.push("");
      lines.push(`${dayKey} ${weekdayShortName(dayKey)}`);
      currentDay = dayKey;
      currentMeal = "";
    }
    if (mealName !== currentMeal) {
      lines.push(mealName);
      currentMeal = mealName;
    }

    const recipe = recipeList.find((item) => item.path === entry.path);
    const name = recipe?.name || entry.name || entry.path || "Untitled recipe";
    const target = Number(entry.targetServings);
    const suffix = Number.isFinite(target) && target > 0 ? ` (servings: ${formatAmount(target)})` : "";
    lines.push(`- ${name}${suffix}`);
  });

  return lines.join("\n");
}

export function mealPlanEntriesForRange(plans: MealPlans, fromKey: string, toKey: string): MealPlanRangeEntry[] {
  const entries: MealPlanRangeEntry[] = [];
  Object.entries(plans || {})
    .filter(([dayKey]) => dayKey >= fromKey && dayKey <= toKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([dayKey, dayPlans]) => {
      Object.entries(dayPlans || {}).forEach(([mealName, mealEntries]) => {
        (mealEntries || []).forEach((entry, index) => {
          entries.push({ dayKey, mealName, entry, index });
        });
      });
    });
  return entries;
}

export function parseMealPlanText(text: string, recipes: RecipeSummary[], defaultMeals: string[]): ParsedMealPlan {
  const entries: ParsedMealPlan["entries"] = [];
  const warnings: string[] = [];
  const recipeList = recipes || [];
  const mealDefaults = defaultMeals || [];
  const header = String(text || "").match(/Meal Plan:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i);
  const headerFrom = header && isDateKey(header[1]) ? header[1] : "";
  const headerTo = header && isDateKey(header[2]) ? header[2] : "";
  let currentDayKey = "";
  let currentMealName = "";

  String(text || "").split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    const lineNumber = index + 1;
    if (!line) return;
    if (/^Meal Plan:/i.test(line) || /^No planned recipes\.$/i.test(line)) return;

    const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2})(?:\s+.*)?$/);
    if (dateMatch) {
      if (!isDateKey(dateMatch[1])) {
        warnings.push(`Line ${lineNumber}: invalid date ${dateMatch[1]}.`);
        currentDayKey = "";
        currentMealName = "";
        return;
      }
      currentDayKey = dateMatch[1];
      currentMealName = "";
      return;
    }

    const recipeMatch = line.match(/^[-*]\s+(.+)$/);
    if (recipeMatch) {
      if (!currentDayKey) {
        warnings.push(`Line ${lineNumber}: recipe has no date and was skipped.`);
        return;
      }
      if (!currentMealName) {
        currentMealName = mealDefaults[2] || mealDefaults[0] || "Dinner";
        warnings.push(`Line ${lineNumber}: missing meal heading, imported under ${currentMealName}.`);
      }

      const parsedRecipe = parseMealPlanRecipeLine(recipeMatch[1]);
      const recipe = resolveMealPlanRecipe(parsedRecipe.name, recipeList);
      if (!recipe) warnings.push(`Line ${lineNumber}: recipe not found: ${parsedRecipe.name}.`);
      const entry: MealPlanEntry = recipe
        ? { path: recipe.path, name: recipe.name }
        : { name: parsedRecipe.name };
      if (parsedRecipe.targetServings) entry.targetServings = parsedRecipe.targetServings;
      entries.push({ dayKey: currentDayKey, mealName: currentMealName, entry });
      return;
    }

    currentMealName = line;
  });

  const parsedDates = uniqueValues(entries.map((item) => item.dayKey)).sort();
  const fromKey = headerFrom || parsedDates[0] || "";
  const toKey = headerTo || parsedDates[parsedDates.length - 1] || fromKey;
  if (headerFrom && headerTo && headerFrom > headerTo) warnings.push("Header date range is reversed.");

  return {
    entries,
    warnings,
    fromKey,
    toKey,
    dayCount: parsedDates.length,
    mealCount: new Set(entries.map((item) => `${item.dayKey}::${item.mealName}`)).size,
  };
}

export function parseMealPlanRecipeLine(value: string): { name: string; targetServings: number | null } {
  const line = String(value || "").trim();
  const servingsMatch = line.match(/\s+\((?:servings|serving|份量|份):\s*(\d+(?:\.\d+)?)\)\s*$/i);
  if (!servingsMatch) return { name: line, targetServings: null };
  const targetServings = Number(servingsMatch[1]);
  return {
    name: line.slice(0, servingsMatch.index).trim(),
    targetServings: Number.isFinite(targetServings) && targetServings > 0 ? targetServings : null,
  };
}

export function resolveMealPlanRecipe(name: string, recipes: RecipeSummary[]): RecipeSummary | null {
  const normalized = String(name || "").trim();
  const recipeList = recipes || [];
  if (!normalized) return null;
  return recipeList.find((recipe) => recipe.name === normalized)
    || recipeList.find((recipe) => recipe.path === normalized)
    || recipeList.find((recipe) => recipe.name.toLowerCase() === normalized.toLowerCase())
    || null;
}

export function mealPlanEntriesMatch(a: MealPlanEntry, b: MealPlanEntry): boolean {
  return String(a?.path || "") === String(b?.path || "")
    && String(a?.name || "") === String(b?.name || "")
    && String(a?.targetServings || "") === String(b?.targetServings || "");
}
