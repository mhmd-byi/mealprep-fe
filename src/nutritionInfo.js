// Sourced directly from https://mealprep.co.in/plans-pricing/ — keep these in
// sync with that page if the site's own figures ever change. "zero-carb" and
// "keto-meal" are given as ranges (protein/carbs/fat/kcal), with no fiber
// figure provided for either.
export const CARB_TYPE_NUTRITION = {
  "balanced-meal": {
    label: "Balanced Mealbox",
    protein: 39,
    carbs: 55,
    fat: 21,
    fiber: 5,
    kcal: 544,
  },
  "low-carb-high-protein": {
    label: "Low-Carb, High-Protein",
    protein: 33,
    carbs: 49,
    fat: 16,
    fiber: 7,
    kcal: 472,
  },
  "high-carb-high-protein": {
    label: "Weight Gain Mealbox",
    protein: 37,
    carbs: 97,
    fat: 23,
    fiber: 5,
    kcal: 710,
  },
  "zero-carb": {
    label: "Zero Carb Meal",
    protein: [33, 47],
    carbs: [0, 6],
    fat: [12, 18],
    kcal: [265, 375],
  },
  "keto-meal": {
    label: "Keto Meal",
    protein: [25, 35],
    carbs: [10, 15],
    fat: [15, 40],
    kcal: [275, 515],
  },
};

// A single number renders as "~Ng" (approximate point figure); a [min, max]
// pair renders as "N–Mg" (a real range, not an approximation of one).
const formatMacro = (value, unit) => {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return `${value[0]}–${value[1]}${unit}`;
  return `~${value}${unit}`;
};

export const formatNutritionLine = (carbType) => {
  const info = CARB_TYPE_NUTRITION[carbType];
  if (!info) return null;
  return [
    formatMacro(info.protein, "g Protein"),
    formatMacro(info.carbs, "g Carbs"),
    formatMacro(info.fat, "g Fat"),
    formatMacro(info.fiber, "g Fiber"),
    formatMacro(info.kcal, " kcal"),
  ]
    .filter(Boolean)
    .join(" | ");
};
