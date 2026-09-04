export const PLANS = ["Trial Meal Pack", "Weekly Plan", "Monthly Plan"];

export const LUNCH_DINNER_OPTIONS = [
  { value: "lunch", label: "Only Lunch" },
  { value: "dinner", label: "Only Dinner" },
  { value: "lunchAndDinner", label: "Both" },
];

export const MEAL_TYPES = [
  { value: "veg", label: "Veg" },
  { value: "non-veg", label: "Non-Veg" },
  { value: "both", label: "Both (Flexible)" },
];

export const CARB_TYPES = [
  { value: "low-carb-high-protein", label: "Low Carb High Protein Meal" },
  { value: "balanced-meal", label: "Balanced Meal" },
  { value: "high-carb-high-protein", label: "High Carb High Protein Meal" },
  { value: "zero-carb", label: "Zero Carb Meal" },
  { value: "keto-meal", label: "Keto Meal" },
];

export const STATUSES = ["active", "queued", "completed", "cancelled"];

export const MEAL_COUNT_FIELDS = [
  { key: "lunchMeals", label: "Lunch (Today)" },
  { key: "dinnerMeals", label: "Dinner (Today)" },
  { key: "nextDayLunchMeals", label: "Lunch (Next Day)" },
  { key: "nextDayDinnerMeals", label: "Dinner (Next Day)" },
];
