// Builds one CSV file with several labeled sections (Excel opens this fine —
// each section is its own little table separated by a blank line), covering
// every number behind the dashboard's charts for the currently selected range.

const escapeCell = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
};

const row = (cells) => cells.map(escapeCell).join(",");

export const buildFinanceReportCSV = (data) => {
  if (!data) return "";
  const lines = [];

  lines.push(row(["Monetary Dashboard Report"]));
  lines.push(row(["Range", `${data.startDate} to ${data.endDate}`]));
  lines.push(row(["Granularity", data.granularity]));
  lines.push(row(["Generated", new Date().toISOString()]));
  lines.push("");

  lines.push(row(["Summary"]));
  lines.push(row(["Revenue", "Expenses", "Profit", "Subscriptions", "New Subscribers", "Recurring Subscribers"]));
  lines.push(
    row([
      data.totals?.revenue ?? 0,
      data.totals?.expenses ?? 0,
      data.totals?.profit ?? 0,
      data.totals?.subscriptionCount ?? 0,
      data.totals?.newCount ?? 0,
      data.totals?.recurringCount ?? 0,
    ])
  );
  lines.push("");

  lines.push(row(["Revenue, Expenses & Profit Over Time"]));
  lines.push(row(["Period", "Revenue", "Expenses", "Profit", "Subscriptions", "New", "Recurring"]));
  (data.series || []).forEach((r) => {
    lines.push(row([r.label, r.revenue, r.expenses, r.profit, r.subscriptionCount, r.newCount, r.recurringCount]));
  });
  lines.push("");

  lines.push(row(["Revenue & Subscriptions by Plan"]));
  lines.push(row(["Plan", "Subscription Count", "Revenue"]));
  (data.planBreakdown || []).forEach((p) => {
    lines.push(row([p.plan, p.count, p.revenue]));
  });
  lines.push("");

  lines.push(row(["Payment Method Split"]));
  lines.push(row(["Method", "Count"]));
  (data.paymentMethodBreakdown || []).forEach((p) => {
    lines.push(row([p.method, p.count]));
  });
  lines.push("");

  lines.push(row(["Expenses by Category"]));
  lines.push(row(["Category", "Amount", "Percentage"]));
  (data.expenseCategoryBreakdown || []).forEach((c) => {
    lines.push(row([c.category, c.amount, `${c.percentage}%`]));
  });
  lines.push("");

  if (data.expenseCategoryTrend?.categories?.length) {
    lines.push(row(["Expense Category Trend Over Time"]));
    const categoryNames = data.expenseCategoryTrend.categories.map((c) => c.name);
    lines.push(row(["Period", ...categoryNames]));
    (data.expenseCategoryTrend.series || []).forEach((r) => {
      lines.push(row([r.label, ...categoryNames.map((name) => r[name] || 0)]));
    });
  }

  return lines.join("\n");
};

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
