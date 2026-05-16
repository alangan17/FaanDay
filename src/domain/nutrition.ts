import { conversionFactor, type ParsedQuantity } from "./servings";
import { titleCase } from "./text";

export interface NutrientEstimate {
  name: string;
  value: number;
  unit: string;
}

export function estimateNutrients(meta: Record<string, unknown>, quantity: ParsedQuantity): NutrientEstimate[] {
  const estimates: NutrientEstimate[] = [];
  Object.entries(meta).forEach(([key, rawValue]) => {
    const match = key.match(/^([a-z_]+)_per_(100g|100ml|1g|tbsp|tsp|pack|unit)$/);
    if (!match || typeof rawValue !== "number") return;

    const nutrientName = nutrientLabel(match[1]);
    const base = match[2];
    const factor = conversionFactor(quantity, base);
    if (!factor) return;
    estimates.push({
      name: nutrientName,
      value: rawValue * factor,
      unit: nutrientUnit(nutrientName),
    });
  });
  return estimates;
}

export function nutrientLabel(key: string): string {
  return key.split("_").map(titleCase).join(" ");
}

export function nutrientUnit(name: string): string {
  if (["Sodium", "Calcium", "Potassium"].includes(name)) return "mg";
  if (name === "Energy") return "kcal";
  return "g";
}
