export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Supplies",
  "Utilities",
  "Delivery",
  "Salary",
  "Rent",
  "Equipment/Maintenance",
  "Marketing",
  "Other",
];

export const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];

// Fixed category -> color mapping (validated categorical palette), reused
// consistently across the breakdown bars, table badges and CSV.
export const CATEGORY_COLORS = {
  Groceries: "#2a78d6",
  Supplies: "#eb6834",
  Utilities: "#1baf7a",
  Delivery: "#eda100",
  Salary: "#e87ba4",
  Rent: "#008300",
  "Equipment/Maintenance": "#4a3aa7",
  Marketing: "#e34948",
  Other: "#898781",
};
