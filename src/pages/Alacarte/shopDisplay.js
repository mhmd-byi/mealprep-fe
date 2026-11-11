import { DAY_OPTIONS } from "../../alacarteDisplay";

const DAY_LABEL = Object.fromEntries(DAY_OPTIONS.map((day) => [day.value, day.label]));

export const discountPercent = (product) =>
  product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

const formatCutoffTime = (time) => {
  const [hours, minutes] = String(time || "18:00").split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes || 0).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export const daysText = (product) => {
  const days = (product.availableDays || []).filter((day) => DAY_LABEL[day]).sort((a, b) => a - b);
  return days.length === DAY_OPTIONS.length ? "Mon–Sat" : days.map((day) => DAY_LABEL[day]).join(", ");
};

export const cutoffText = (product) => {
  const time = formatCutoffTime(product.cutoffTime);
  if (!product.cutoffDaysBefore) return `Order by ${time} on the delivery day`;
  if (product.cutoffDaysBefore === 1) return `Order by ${time} the day before`;
  return `Order by ${time}, ${product.cutoffDaysBefore} days before`;
};

export const primaryButton =
  "px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50 whitespace-nowrap";
