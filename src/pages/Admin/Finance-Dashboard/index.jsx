import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useFinanceDashboard, PRESET_OPTIONS } from "./useFinanceDashboard";
import { GroupedBarChart } from "./GroupedBarChart";
import { LineChart } from "./LineChart";
import { StackedBarChart } from "./StackedBarChart";
import { PieChart } from "./PieChart";
import { formatINR, formatCompactINR, formatPercent, formatCount } from "./format";

// Same categorical palette used across the app's other charts (Expenses
// module) — assign fixed slots to the 3 known plans, fall back to the
// existing muted "Other" gray for anything outside that list.
const PLAN_COLORS = {
  "Monthly Plan": "#2a78d6",
  "Weekly Plan": "#eb6834",
  "Trial Meal Pack": "#1baf7a",
};
const getPlanColor = (plan) => PLAN_COLORS[plan] || "#898781";

const PAYMENT_METHOD_COLORS = {
  "Online (Razorpay)": "#2a78d6",
  Cash: "#eb6834",
  UPI: "#1baf7a",
  Card: "#eda100",
  "Bank Transfer": "#4a3aa7",
  "No Charge": "#898781",
};
const getPaymentMethodColor = (method) => PAYMENT_METHOD_COLORS[method] || "#898781";

const StatTile = ({ label, value, valueClassName = "text-gray-900" }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${valueClassName}`}>{value}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mb-1">{subtitle}</p>}
    <div className={subtitle ? "mt-2" : "mt-1"}>{children}</div>
  </div>
);

const SectionHeading = ({ children }) => (
  <h3 className="text-base font-bold text-gray-800 mt-8 mb-3 first:mt-0">{children}</h3>
);

// Parses "YYYY-MM-DD" as local date parts, not via `new Date(isoString)` —
// that parses as UTC midnight, which can render as the previous day in a
// browser timezone behind UTC.
const formatDateLabel = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const GRANULARITY_LABEL = { day: "daily", week: "weekly", month: "monthly" };

export const FinanceDashboard = () => {
  const { preset, customRange, selectPreset, applyCustomRange, data, isLoading, error } = useFinanceDashboard();

  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartInput, setCustomStartInput] = useState("");
  const [customEndInput, setCustomEndInput] = useState("");

  const handleApplyCustom = () => {
    if (!customStartInput || !customEndInput) return;
    applyCustomRange(customStartInput, customEndInput);
    setIsCustomOpen(false);
  };

  const series = data?.series || [];
  const totals = data?.totals;
  const planBreakdown = data?.planBreakdown || [];
  const paymentMethodBreakdown = data?.paymentMethodBreakdown || [];
  const expenseCategoryBreakdown = data?.expenseCategoryBreakdown || [];
  const expenseCategoryTrend = data?.expenseCategoryTrend;

  // Derived, computed client-side from the monthly series so the backend
  // response stays a plain fact table.
  let cumRevenue = 0;
  let cumExpenses = 0;
  const cumulativeSeries = series.map((row) => {
    cumRevenue += row.revenue;
    cumExpenses += row.expenses;
    return { ...row, cumulativeRevenue: cumRevenue, cumulativeExpenses: cumExpenses };
  });

  const marginSeries = series.map((row) => ({
    ...row,
    profitMargin: row.revenue > 0 ? Math.round((row.profit / row.revenue) * 1000) / 10 : 0,
  }));

  const planRevenueData = planBreakdown.map((p) => ({ label: p.plan, value: p.revenue, color: getPlanColor(p.plan) }));
  const planCountData = planBreakdown.map((p) => ({ label: p.plan, value: p.count, color: getPlanColor(p.plan) }));
  const paymentMethodData = paymentMethodBreakdown.map((p) => ({
    label: p.method,
    value: p.count,
    color: getPaymentMethodColor(p.method),
  }));
  const expenseCategoryData = expenseCategoryBreakdown.map((c) => ({
    label: c.category,
    value: c.amount,
    color: c.color,
  }));

  const trendSeriesKeys = expenseCategoryTrend?.categories.map((c) => ({ key: c.name, label: c.name, color: c.color })) || [];

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-start p-4 w-full sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
                <h2 className="text-xl font-bold md:text-2xl">Monetary Dashboard</h2>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => selectPreset(opt.key)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-md border-2 ${
                        !customRange && preset === opt.key
                          ? "bg-theme-color-1 text-white border-theme-color-1"
                          : "bg-white text-theme-color-1 border-theme-color-1"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomOpen((v) => !v)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md border-2 ${
                      customRange
                        ? "bg-theme-color-1 text-white border-theme-color-1"
                        : "bg-white text-theme-color-1 border-theme-color-1"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {isCustomOpen && (
                <div className="flex flex-wrap items-end gap-3 border-t pt-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start date</label>
                    <input
                      type="date"
                      value={customStartInput}
                      onChange={(e) => setCustomStartInput(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End date</label>
                    <input
                      type="date"
                      value={customEndInput}
                      onChange={(e) => setCustomEndInput(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustom}
                    disabled={!customStartInput || !customEndInput}
                    className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}

              {data && (
                <p className="text-xs text-gray-400 mb-4">
                  Showing {formatDateLabel(data.startDate)} – {formatDateLabel(data.endDate)}
                  {data.granularity && ` (${GRANULARITY_LABEL[data.granularity] || data.granularity} view)`}
                </p>
              )}

              {error && <p className="mb-4 text-red-500">{error}</p>}

              {isLoading && !data ? (
                <p className="text-gray-500 py-8 text-center">Loading dashboard...</p>
              ) : (
                <>
                  {/* Stat tiles */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <StatTile label="Revenue" value={formatINR(totals?.revenue)} />
                    <StatTile label="Expenses" value={formatINR(totals?.expenses)} />
                    <StatTile
                      label="Profit"
                      value={formatINR(totals?.profit)}
                      valueClassName={totals?.profit >= 0 ? "text-green-600" : "text-red-600"}
                    />
                    <StatTile label="Subscriptions" value={formatCount(totals?.subscriptionCount)} />
                  </div>

                  {/* ── Revenue & Profit ── */}
                  <SectionHeading>Revenue &amp; Profit</SectionHeading>
                  <div className="grid grid-cols-1 gap-4">
                    <ChartCard title="Revenue, Expenses & Profit Over Time">
                      <GroupedBarChart
                        data={series}
                        seriesKeys={[
                          { key: "revenue", label: "Revenue", color: "#2a78d6" },
                          { key: "expenses", label: "Expenses", color: "#eb6834" },
                          { key: "profit", label: "Profit", color: "#1baf7a" },
                        ]}
                        title="Revenue, expenses and profit over time"
                      />
                    </ChartCard>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ChartCard title="Cumulative Revenue vs Expenses" subtitle="Running total over the selected range">
                        <LineChart
                          data={cumulativeSeries}
                          seriesKeys={[
                            { key: "cumulativeRevenue", label: "Cumulative Revenue", color: "#2a78d6" },
                            { key: "cumulativeExpenses", label: "Cumulative Expenses", color: "#eb6834" },
                          ]}
                          title="Cumulative revenue vs expenses"
                          valueFormatter={formatCompactINR}
                        />
                      </ChartCard>
                      <ChartCard title="Profit Margin % Over Time" subtitle="Profit as a share of that period's revenue">
                        <LineChart
                          data={marginSeries}
                          seriesKeys={[{ key: "profitMargin", label: "Profit Margin", color: "#1baf7a" }]}
                          title="Profit margin percent over time"
                          valueFormatter={formatPercent}
                          allowNegative
                        />
                      </ChartCard>
                    </div>
                  </div>

                  {/* ── Subscriptions ── */}
                  <SectionHeading>Subscriptions</SectionHeading>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ChartCard title="Subscriptions Purchased Over Time">
                        <GroupedBarChart
                          data={series}
                          seriesKeys={[{ key: "subscriptionCount", label: "Subscriptions", color: "#2a78d6" }]}
                          title="Subscriptions purchased over time"
                        />
                      </ChartCard>
                      <ChartCard title="New vs Recurring Subscribers" subtitle="Recurring = user has purchased before">
                        <StackedBarChart
                          data={series}
                          seriesKeys={[
                            { key: "newCount", label: "New", color: "#2a78d6" },
                            { key: "recurringCount", label: "Recurring", color: "#4a3aa7" },
                          ]}
                          title="New vs recurring subscribers over time"
                          valueFormatter={formatCount}
                        />
                      </ChartCard>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <ChartCard title="Revenue by Plan">
                        <PieChart data={planRevenueData} title="Revenue by plan" valueFormatter={formatINR} />
                      </ChartCard>
                      <ChartCard title="Subscriptions by Plan" subtitle="By count, not revenue">
                        <PieChart data={planCountData} title="Subscriptions by plan" valueFormatter={formatCount} />
                      </ChartCard>
                      <ChartCard title="Payment Method Split">
                        <PieChart data={paymentMethodData} title="Payment method split" valueFormatter={formatCount} />
                      </ChartCard>
                    </div>
                  </div>

                  {/* ── Expenses ── */}
                  <SectionHeading>Expenses</SectionHeading>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ChartCard title="Expenses by Category">
                        <PieChart data={expenseCategoryData} title="Expenses by category" valueFormatter={formatINR} />
                      </ChartCard>
                      <ChartCard title="Expense Category Trend" subtitle="Top categories by spend; rest folded into Other">
                        <StackedBarChart
                          data={expenseCategoryTrend?.series || []}
                          seriesKeys={trendSeriesKeys}
                          title="Expense category trend over time"
                          valueFormatter={formatCompactINR}
                        />
                      </ChartCard>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-6">
                    Revenue is derived from each subscription's plan and meal count at today's prices — not a
                    stored transaction amount — since past prices, discounts and partial refunds aren't tracked.
                    Complimentary admin-created subscriptions with no recorded payment method count as ₹0 revenue
                    but still appear in subscription counts.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default FinanceDashboard;
