export const MAX_RANGE_DAYS = 366;

const pad = (value) => String(value).padStart(2, "0");

export const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const daysAgo = (count) => {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return date;
};

export const SALES_PRESETS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
];

export const presetRange = (key) => {
  const now = new Date();
  const today = toDateKey(now);

  if (key === "today") return { startDate: today, endDate: today };
  if (key === "yesterday") {
    const yesterday = toDateKey(daysAgo(1));
    return { startDate: yesterday, endDate: yesterday };
  }
  if (key === "30d") return { startDate: toDateKey(daysAgo(29)), endDate: today };
  if (key === "thisMonth") return { startDate: toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: today };
  if (key === "lastMonth") {
    return {
      startDate: toDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      endDate: toDateKey(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return { startDate: toDateKey(daysAgo(6)), endDate: today };
};

export const rangeProblem = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return "Pick both a start date and an end date.";
  if (startDate > endDate) return "The start date must be on or before the end date.";
  const days = (Date.parse(endDate) - Date.parse(startDate)) / 86400000 + 1;
  if (days > MAX_RANGE_DAYS) return `Choose a range of ${MAX_RANGE_DAYS} days or fewer.`;
  return "";
};

const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const line = (cells) => cells.map(cell).join(",");

export const buildSalesCSV = (data) => {
  const lines = [
    line(["À la carte day-wise sales"]),
    line(["Range", `${data.startDate} to ${data.endDate}`]),
    line(["Counted on", "Day the customer paid (IST)"]),
    "",
    line(["Date", "Orders", "Items", "Items amount", "Delivery fees", "Total sales"]),
    ...data.days.map((day) => line([day.date, day.orders, day.items, day.subtotal, day.deliveryFee, day.total])),
    line(["Total", data.totals.orders, data.totals.items, data.totals.subtotal, data.totals.deliveryFee, data.totals.total]),
  ];
  return lines.join("\n");
};
