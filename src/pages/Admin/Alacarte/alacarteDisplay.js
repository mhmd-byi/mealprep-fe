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

export const ORDER_STEPS = [
  { status: "placed", label: "Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "delivered", label: "Delivered" },
];

export const STEP_HINTS = {
  placed:
    "New paid order. Click “Confirm” once you have accepted it. You can also skip straight to “Out for delivery”. The customer gets a notification at every step.",
  confirmed: "Accepted and being prepared. Click “Out for delivery” when it leaves the kitchen.",
  out_for_delivery: "On its way. Click “Mark delivered” once the customer has received it.",
};

export const FILTER_HINTS = {
  open: "Open: every paid order that is not delivered yet (Placed + Confirmed + Out for delivery). This is your to-do list.",
  placed: "Placed: paid and waiting for you. Nobody has confirmed these yet, so start here.",
  confirmed: "Confirmed: you have accepted these and they are being prepared.",
  out_for_delivery: "Out for delivery: on the way to the customer.",
  delivered: "Delivered: completed orders.",
  unpaid: "Unpaid: the customer started checkout but the payment did not complete (still waiting, or expired).",
  all: "All paid: every paid order, including the ones already delivered.",
};

export const MAX_SLOTS = 10;
export const MAX_SLOT_FEE = 5000;

const formatClock = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export const slotRangeLabel = (startTime, endTime) =>
  /^\d{2}:\d{2}$/.test(startTime) && /^\d{2}:\d{2}$/.test(endTime) && endTime > startTime
    ? `${formatClock(startTime)} – ${formatClock(endTime)}`
    : "";

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
