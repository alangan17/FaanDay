import { describe, expect, it } from "vitest";
import { transferEntryInPlans } from "../../src/domain/mealPlanMutations";
import type { MealPlans } from "../../src/domain/types";

describe("meal plan mutations", () => {
  it("moves within the same meal with index adjustment", () => {
    const plans: MealPlans = {
      "2026-05-18": {
        Dinner: [
          { path: "a.md", name: "A" },
          { path: "b.md", name: "B" },
          { path: "c.md", name: "C" },
        ],
      },
    };

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-18", "Dinner", "move", 3);

    expect(result.changed).toBe(true);
    expect(plans["2026-05-18"].Dinner.map((entry) => entry.name)).toEqual(["B", "C", "A"]);
  });

  it("copies without mutating the source entry", () => {
    const plans: MealPlans = {
      "2026-05-18": { Dinner: [{ path: "a.md", name: "A", targetServings: 2 }] },
      "2026-05-19": { Lunch: [] },
    };

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "copy");

    expect(result.changed).toBe(true);
    expect(plans["2026-05-18"].Dinner).toHaveLength(1);
    expect(plans["2026-05-19"].Lunch).toEqual([{ path: "a.md", name: "A", targetServings: 2 }]);
    expect(plans["2026-05-19"].Lunch[0]).not.toBe(plans["2026-05-18"].Dinner[0]);
  });

  it("cleans up empty source meal and day after move", () => {
    const plans: MealPlans = {
      "2026-05-18": { Dinner: [{ path: "a.md", name: "A" }] },
    };

    transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "move");

    expect(plans["2026-05-18"]).toBeUndefined();
    expect(plans["2026-05-19"].Lunch).toEqual([{ path: "a.md", name: "A" }]);
  });

  it("reports missing source entries without creating target plans", () => {
    const plans: MealPlans = {};

    const result = transferEntryInPlans(plans, "2026-05-18", "Dinner", 0, "2026-05-19", "Lunch", "move");

    expect(result).toEqual({ changed: false, reason: "missing-source" });
    expect(plans).toEqual({});
  });
});
