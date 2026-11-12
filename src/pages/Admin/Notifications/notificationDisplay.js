export const TITLE_MAX = 65;
export const BODY_MAX = 500;

export const ROUTE_OPTIONS = [
  { value: "", label: "Just open the app" },
  { value: "/home", label: "Home" },
  { value: "/my-plan", label: "My Plan" },
  { value: "/menu", label: "Menu" },
  { value: "/meals", label: "History" },
  { value: "/plans", label: "Subscription plans" },
  { value: "/cancel-meals", label: "Cancel meals" },
  { value: "/customise-meal", label: "Customise a meal" },
  { value: "/help", label: "Help & FAQs" },
  { value: "/profile", label: "Profile" },
  { value: "/alacarte", label: "À la carte shop" },
  { value: "/alacarte-orders", label: "À la carte orders" },
];

export const CATEGORY_OPTIONS = [
  { value: "announcement", label: "Announcement (customers can turn off)" },
  { value: "service", label: "Service update (always delivered)" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "queued", label: "Queued" },
  { value: "ended", label: "Plan ended" },
  { value: "never", label: "Never subscribed" },
];

export const DIET_OPTIONS = [
  { value: "veg", label: "Veg" },
  { value: "non-veg", label: "Non-veg" },
  { value: "both", label: "Flexible" },
];

export const SLOT_OPTIONS = [
  { value: "lunch", label: "Lunch only" },
  { value: "dinner", label: "Dinner only" },
  { value: "both", label: "Lunch and dinner" },
];

export const CARB_OPTIONS = [
  { value: "low-carb-high-protein", label: "Low Carb High Protein" },
  { value: "balanced-meal", label: "Balanced Meal" },
  { value: "high-carb-high-protein", label: "High Carb High Protein" },
  { value: "zero-carb", label: "Zero Carb" },
  { value: "keto-meal", label: "Keto" },
];

export const OPERATOR_OPTIONS = [
  { value: ">", label: "More than" },
  { value: "<", label: "Fewer than" },
  { value: "=", label: "Exactly" },
];

export const STATUS_STYLES = {
  sent: "bg-green-100 text-green-700",
  sending: "bg-blue-100 text-blue-700",
  scheduled: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export const PUSH_STYLES = {
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  "no-device": "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
};

export const PUSH_LABELS = {
  sent: "Push sent",
  failed: "Push failed",
  "no-device": "No app",
  pending: "Pending",
};

export const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

export const primaryButton =
  "px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50 whitespace-nowrap";

export const outlineButton =
  "px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap";

export const toggleValue = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "");
