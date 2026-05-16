import { clampIndex } from "./dates";
import { mealPlanEntriesMatch } from "./mealPlanText";
import type { MealPlanEntry, MealPlans } from "./types";

export interface TransferResult {
  changed: boolean;
  reason?: "missing-meal" | "missing-source" | "same-position";
}

export function cloneEntry(entry: MealPlanEntry): MealPlanEntry {
  return JSON.parse(JSON.stringify(entry));
}

export function cleanupEmptyPlan(plans: MealPlans, dayKey: string, mealName: string | null): void {
  const dayPlans = plans[dayKey];
  if (!dayPlans) return;
  if (mealName && !dayPlans[mealName]?.length) delete dayPlans[mealName];
  if (!Object.keys(dayPlans).length) delete plans[dayKey];
}

export function addEntryToPlans(plans: MealPlans, dayKey: string, mealName: string, recipe: { path: string; name: string; servingsNumber?: number | null }, targetServings?: number | null): MealPlanEntry {
  if (!plans[dayKey]) plans[dayKey] = {};
  if (!plans[dayKey][mealName]) plans[dayKey][mealName] = [];
  const entry: MealPlanEntry = { path: recipe.path, name: recipe.name };
  if (targetServings && targetServings !== recipe.servingsNumber) {
    entry.targetServings = targetServings;
  }
  plans[dayKey][mealName].push(entry);
  return entry;
}

export function importEntriesIntoPlans(plans: MealPlans, parsed: { fromKey: string; toKey: string; entries: Array<{ dayKey: string; mealName: string; entry: MealPlanEntry }> }, mode: string, rangeDateKeys: (fromKey: string, toKey: string) => string[]): { imported: number; skipped: number } {
  if (mode === "replace") {
    rangeDateKeys(parsed.fromKey, parsed.toKey).forEach((dayKey) => {
      delete plans[dayKey];
    });
  }

  let imported = 0;
  let skipped = 0;
  parsed.entries.forEach(({ dayKey, mealName, entry }) => {
    if (!plans[dayKey]) plans[dayKey] = {};
    if (!plans[dayKey][mealName]) plans[dayKey][mealName] = [];
    if (mode === "merge" && plans[dayKey][mealName].some((existing) => mealPlanEntriesMatch(existing, entry))) {
      skipped += 1;
      return;
    }
    plans[dayKey][mealName].push(cloneEntry(entry));
    imported += 1;
  });

  return { imported, skipped };
}

export function transferEntryInPlans(plans: MealPlans, sourceDayKey: string, sourceMealName: string, sourceIndex: number, targetDayKey: string, targetMealName: string | null, mode: string, targetIndex: number | null = null): TransferResult {
  const finalMealName = String(targetMealName || sourceMealName || "").trim();
  if (!finalMealName) return { changed: false, reason: "missing-meal" };

  const sourceEntries = plans[sourceDayKey]?.[sourceMealName];
  const sourceEntry = sourceEntries?.[sourceIndex];
  if (!sourceEntry) return { changed: false, reason: "missing-source" };

  if (!plans[targetDayKey]) plans[targetDayKey] = {};
  if (!plans[targetDayKey][finalMealName]) plans[targetDayKey][finalMealName] = [];
  const targetEntries = plans[targetDayKey][finalMealName];
  const isSameMeal = sourceDayKey === targetDayKey && sourceMealName === finalMealName;
  const requestedIndex = Number.isInteger(targetIndex) ? Number(targetIndex) : targetEntries.length;

  if (mode === "copy") {
    targetEntries.splice(clampIndex(requestedIndex, targetEntries.length), 0, cloneEntry(sourceEntry));
    return { changed: true };
  }

  if (isSameMeal && (requestedIndex === sourceIndex || requestedIndex === sourceIndex + 1)) {
    return { changed: false, reason: "same-position" };
  }

  const [movedEntry] = sourceEntries.splice(sourceIndex, 1);
  let insertIndex = requestedIndex;
  if (isSameMeal && insertIndex > sourceIndex) insertIndex -= 1;
  targetEntries.splice(clampIndex(insertIndex, targetEntries.length), 0, movedEntry);

  cleanupEmptyPlan(plans, sourceDayKey, sourceMealName);
  return { changed: true };
}
