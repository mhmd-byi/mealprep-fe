// The 5 diet types a customer can currently choose on the Plans page. Any
// other stored value — most commonly "regular", real historical data from
// before this 5-option system existed — is legacy, not a current option, and
// gets its own honest label below rather than being hidden or guessed into
// one of the 5.
export const CARB_TYPE_LABELS = {
  "balanced-meal": "Balanced Meal",
  "low-carb-high-protein": "Low Carb High Protein (LCHP)",
  "high-carb-high-protein": "High Carb High Protein (HCHP)",
  "zero-carb": "Zero Carb Meal",
  "keto-meal": "Keto Meal",
  "regular": "Regular (Legacy)",
};

// Kept distinct from OTHER_COLOR (the gray a donut chart folds small/unknown
// slices into) so "Regular (Legacy)" never visually blends into a chart's
// own "Other" bucket, even though neither is one of the 5 current types.
export const CARB_TYPE_COLORS = {
  "balanced-meal": "#2a78d6",
  "low-carb-high-protein": "#1baf7a",
  "high-carb-high-protein": "#eb6834",
  "zero-carb": "#e87ba4",
  "keto-meal": "#4a3aa7",
  "regular": "#c9a227",
};

const OTHER_COLOR = "#898781";
export const getCarbTypeColor = (carbType) => CARB_TYPE_COLORS[carbType] || OTHER_COLOR;

// Short codes for the delivery label (not enough room there for the full name).
export const CARB_TYPE_SHORT_CODES = {
  "low-carb-high-protein": "LCHP",
  "high-carb-high-protein": "HCHP",
  "balanced-meal": "BAL",
  "zero-carb": "ZC",
  "keto-meal": "KETO",
};
export const getCarbTypeShortCode = (carbType) =>
  CARB_TYPE_SHORT_CODES[carbType] || (carbType || "").replace(/-/g, "").slice(0, 4).toUpperCase() || "—";

// Falls back to a readable title-cased version of any value this map doesn't
// recognize (e.g. a future stray value), rather than showing a raw hyphenated
// string as-is.
export const formatCarbType = (carbType) => {
  if (!carbType) return "—";
  if (CARB_TYPE_LABELS[carbType]) return CARB_TYPE_LABELS[carbType];
  return carbType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
