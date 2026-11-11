export const formatINR = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const formatDateKey = (key) =>
  key
    ? new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "—";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const SLOT_LABELS = {
  morning: "8:00 AM – 12:00 PM",
  midday: "12:00 PM – 4:00 PM",
  evening: "4:00 PM – 7:00 PM",
};

export const ORDER_STATUS = {
  pending_payment: { label: "Awaiting payment", style: "bg-gray-100 text-gray-700" },
  expired: { label: "Expired", style: "bg-red-100 text-red-700" },
  placed: { label: "Placed", style: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed", style: "bg-amber-100 text-amber-700" },
  out_for_delivery: { label: "Out for delivery", style: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", style: "bg-green-100 text-green-700" },
};

export const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];
