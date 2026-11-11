export { formatINR, formatDateKey, formatDateTime, SLOT_LABELS, ORDER_STATUS, DAY_OPTIONS } from "../../../alacarteDisplay";

export const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

export const primaryButton =
  "px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50 whitespace-nowrap";

export const outlineButton =
  "px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap";

export const NEXT_ACTIONS = {
  placed: [
    { status: "confirmed", label: "Confirm" },
    { status: "out_for_delivery", label: "Out for delivery" },
  ],
  confirmed: [{ status: "out_for_delivery", label: "Out for delivery" }],
  out_for_delivery: [{ status: "delivered", label: "Mark delivered" }],
  delivered: [],
};

export const STATUS_FILTERS = [
  { value: "open", label: "Open" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "unpaid", label: "Unpaid" },
  { value: "all", label: "All paid" },
];

export const CUTOFF_DAY_OPTIONS = [
  { value: 0, label: "On the delivery day" },
  { value: 1, label: "1 day before" },
  { value: 2, label: "2 days before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "7 days before" },
];

export const DIET_OPTIONS = [
  { value: "veg", label: "Veg" },
  { value: "non-veg", label: "Non-veg" },
];
