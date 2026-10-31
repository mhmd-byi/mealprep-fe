import {
  Sun,
  ChefHat,
  Package,
  Truck,
  IndianRupee,
  Headset,
  MoreHorizontal,
  StickyNote,
  Wallet,
  ShoppingCart,
  Utensils,
  Users,
  Phone,
  ClipboardList,
  Wrench,
  Megaphone,
} from "lucide-react";

export const CATEGORY_ICONS = {
  Sun,
  ChefHat,
  Package,
  Truck,
  IndianRupee,
  Headset,
  MoreHorizontal,
  StickyNote,
  Wallet,
  ShoppingCart,
  Utensils,
  Users,
  Phone,
  ClipboardList,
  Wrench,
  Megaphone,
};

export const getCategoryIcon = (iconName) => CATEGORY_ICONS[iconName] || StickyNote;

export const CATEGORY_SWATCHES = [
  "#f59e0b",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#e11d48",
  "#0d9488",
  "#6b7280",
  "#ea580c",
  "#db2777",
];

export const UNCATEGORISED_COLOR = "#6b7280";

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low" };

export const PRIORITY_CHIP_STYLES = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export const PRIORITY_DOT_STYLES = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

export const QUICK_FILTERS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Priority" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All notes" },
  { value: "open", label: "Open" },
  { value: "done", label: "Completed" },
];

export const withAlpha = (hex, alphaHex) => `${hex}${alphaHex}`;

const pad = (value) => String(value).padStart(2, "0");

export const formatNoteDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTimeOnly = (date) => date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatDueLabel = (value) => {
  const due = new Date(value);
  const dayDifference = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000);
  if (dayDifference === 0) return `Today, ${formatTimeOnly(due)}`;
  if (dayDifference === 1) return `Tomorrow, ${formatTimeOnly(due)}`;
  if (dayDifference === -1) return `Yesterday, ${formatTimeOnly(due)}`;
  return `${due.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}, ${formatTimeOnly(due)}`;
};

export const isOverdue = (note) => Boolean(!note.isDone && note.dueAt && new Date(note.dueAt) < new Date());

export const formatActivityTime = (value) => {
  const date = new Date(value);
  const sameDay = startOfDay(date).getTime() === startOfDay(new Date()).getTime();
  return sameDay
    ? formatTimeOnly(date)
    : `${date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}, ${formatTimeOnly(date)}`;
};

export const toDateTimeInputValue = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromDateTimeInputValue = (inputValue) => (inputValue ? new Date(inputValue).toISOString() : null);
