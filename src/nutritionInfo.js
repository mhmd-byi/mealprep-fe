// Sourced directly from https://mealprep.co.in/plans-pricing/ — keep these in
// sync with that page if the site's own figures ever change. "zero-carb" and
// "keto-meal" aren't listed there, so they intentionally have no entry here.
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
};

export const formatNutritionLine = (carbType) => {
  const info = CARB_TYPE_NUTRITION[carbType];
  if (!info) return null;
  return `~${info.protein}g Protein | ~${info.carbs}g Carbs | ~${info.fat}g Fat | ~${info.fiber}g Fiber | ~${info.kcal} kcal`;
};
