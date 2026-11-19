import { formatINR } from "../../../alacarteDisplay";

export const MODULE_LABELS = {
  plan: "Plan",
  product: "À la carte product",
  category: "Product category",
  slots: "Delivery slots",
  "carb-type": "Carb type",
};

export const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label }));

export const PLAN_MODULES = ["plan"];
export const ALACARTE_MODULES = ["product", "category", "slots"];

export const ACTION_BADGES = {
  created: { label: "Added", style: "bg-green-100 text-green-700" },
  updated: { label: "Edited", style: "bg-blue-100 text-blue-700" },
  deleted: { label: "Deleted", style: "bg-red-100 text-red-700" },
  activated: { label: "Made available", style: "bg-teal-100 text-teal-700" },
  deactivated: { label: "Hidden / archived", style: "bg-amber-100 text-amber-700" },
  setup: { label: "Set up", style: "bg-indigo-100 text-indigo-700" },
};

export const ACTION_OPTIONS = Object.entries(ACTION_BADGES).map(([value, badge]) => ({ value, label: badge.label }));

export const formatLogTime = (value) =>
  new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const formatValue = (kind, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "money") return formatINR(value);
  if (kind === "flag") return value ? "Yes" : "No";
  if (kind === "list") return Array.isArray(value) && value.length > 0 ? value.join(", ") : "—";
  if (kind === "images") return `${Array.isArray(value) ? value.length : 0} image${Array.isArray(value) && value.length === 1 ? "" : "s"}`;
  if (kind === "range") return value.max === null || value.max === undefined ? `${value.min}` : `${value.min}–${value.max}`;
  return String(value);
};

export const percentText = (percent) => {
  if (percent === null || percent === undefined) return "";
  return `${percent > 0 ? "+" : ""}${percent}%`;
};

export const priceTrend = (change) => {
  if (change.kind !== "money" || typeof change.before !== "number" || typeof change.after !== "number") return "neutral";
  if (change.after > change.before) return "up";
  if (change.after < change.before) return "down";
  return "neutral";
};

export const TREND_STYLES = {
  up: "bg-amber-50 text-amber-900 border-amber-200",
  down: "bg-green-50 text-green-800 border-green-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
};
