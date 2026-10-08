import { useRef, useState } from "react";
import { ShieldCheck, Wallet, TrendingUp, TrendingDown, Users, Download, ChevronDown, RefreshCw } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useFinanceDashboard, PRESET_OPTIONS } from "./useFinanceDashboard";
import { GroupedBarChart } from "./GroupedBarChart";
import { LineChart } from "./LineChart";
import { StackedBarChart } from "./StackedBarChart";
import { PieChart } from "./PieChart";
import { RecentTransactions } from "./RecentTransactions";
import { formatINR, formatCompactINR, formatPercent, formatCount } from "./format";
import { buildFinanceReportCSV, downloadCSV } from "./exportCsv";

// Same categorical palette used across the app's other charts (Expenses
// module) — assign fixed slots to the 3 known plans, fall back to the
// existing muted "Other" gray for anything outside that list.
export const PLAN_COLORS = {
  "Monthly Plan": "#2a78d6",
  "Weekly Plan": "#eb6834",
  "Trial Meal Pack": "#1baf7a",
};
export const getPlanColor = (plan) => PLAN_COLORS[plan] || "#898781";

const PAYMENT_METHOD_COLORS = {
  "Online (Razorpay)": "#2a78d6",
  Cash: "#eb6834",
  UPI: "#1baf7a",
  Card: "#eda100",
  "Bank Transfer": "#4a3aa7",
  "No Charge": "#898781",
};
const getPaymentMethodColor = (method) => PAYMENT_METHOD_COLORS[method] || "#898781";

export const CARB_TYPE_LABELS = {
  "low-carb-high-protein": "Low Carb High Protein (LCHP)",
  "high-carb-high-protein": "High Carb High Protein (HCHP)",
  "keto-meal": "Keto Meal",
  "balanced-meal": "Balanced Meal",
  "zero-carb": "Zero Carb Meal",
};
export const CARB_TYPE_COLORS = {
  "balanced-meal": "#2a78d6",
  "low-carb-high-protein": "#1baf7a",
  "high-carb-high-protein": "#eb6834",
  "keto-meal": "#4a3aa7",
  "zero-carb": "#e87ba4",
};
export const getCarbTypeColor = (carbType) => CARB_TYPE_COLORS[carbType] || "#898781";

const ChangeBadge = ({ percent, invert = false }) => {
  if (percent === null || percent === undefined) return null;
  if (percent === 0) return <span className="text-xs font-semibold text-gray-400">No change</span>;
  const up = percent > 0;
  const good = invert ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${good ? "text-green-600" : "text-red-600"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent)}%
    </span>
  );
};

const KpiCard = ({ icon: Icon, tone, label, value, loading, changePercent, invert }) => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className={`flex items-center justify-center w-10 h-10 mb-3 rounded-xl ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    {loading ? (
      <div className="flex items-center py-1.5">
        <div className="w-5 h-5 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent"></div>
      </div>
    ) : (
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    )}
    {!loading && (changePercent === 0 || changePercent) && (
      <div className="flex items-center gap-1.5 mt-1">
        <ChangeBadge percent={changePercent} invert={invert} />
        <span className="text-xs text-gray-400">vs previous period</span>
      </div>
    )}
  </div>
);

const ChartCard = ({ title, subtitle, badge, children }) => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm print:border print:break-inside-avoid">
    <div className="flex items-start justify-between gap-3 mb-1">
      <p className="text-base font-bold text-gray-900">{title}</p>
      {badge && (
        <span className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-50 rounded-md border border-gray-200 whitespace-nowrap">
          {badge}
        </span>
      )}
    </div>
    {subtitle && <p className="mb-1 text-xs text-gray-400">{subtitle}</p>}
    <div className={subtitle ? "mt-2" : "mt-1"}>{children}</div>
  </div>
);

const SectionHeading = ({ children }) => (
  <h3 className="text-base font-bold text-gray-800 mt-8 mb-3 first:mt-0 print:break-after-avoid">{children}</h3>
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

const GRANULARITY_LABEL = { day: "Daily", week: "Weekly", month: "Monthly" };

// The dashboard's actual content, with no page layout/shell of its own — so
// it can be rendered standalone (below, at its own route) or embedded inside
// another page without nesting a second Header/Sidebar.
export const FinanceDashboardContent = () => {
  const { preset, customRange, selectPreset, applyCustomRange, data, isLoading, error, refresh } = useFinanceDashboard();

  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartInput, setCustomStartInput] = useState("");
  const [customEndInput, setCustomEndInput] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const transactionsRef = useRef(null);

  const handleApplyCustom = () => {
    if (!customStartInput || !customEndInput) return;
    applyCustomRange(customStartInput, customEndInput);
    setIsCustomOpen(false);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csv = buildFinanceReportCSV(data);
    downloadCSV(csv, `monetary-dashboard-${data.startDate}-to-${data.endDate}.csv`);
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    window.print();
    setIsExportOpen(false);
  };

  const series = data?.series || [];
  const totals = data?.totals;
  const changePercent = data?.changePercent;
  const planBreakdown = data?.planBreakdown || [];
  const paymentMethodBreakdown = data?.paymentMethodBreakdown || [];
  const carbBreakdown = data?.carbBreakdown || [];
  const expenseCategoryBreakdown = data?.expenseCategoryBreakdown || [];
  const expenseCategoryTrend = data?.expenseCategoryTrend;
  const granularityLabel = GRANULARITY_LABEL[data?.granularity] || "Monthly";

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
  const carbMealsData = carbBreakdown.map((c) => ({
    label: CARB_TYPE_LABELS[c.carbType] || c.carbType,
    value: c.meals,
    color: getCarbTypeColor(c.carbType),
  }));
  const expenseCategoryData = expenseCategoryBreakdown.map((c) => ({
    label: c.category,
    value: c.amount,
    color: c.color,
  }));

  const trendSeriesKeys = expenseCategoryTrend?.categories.map((c) => ({ key: c.name, label: c.name, color: c.color })) || [];

  return (
    <div className="flex flex-col items-start justify-start w-full p-4 text-left sm:p-6 md:p-8">
      <div className="w-full">
        <div className="flex flex-col justify-between gap-3 mb-5 sm:flex-row sm:items-center print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Monetary Dashboard</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Track your revenue, expenses, subscriptions and business growth all in one place.
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen((v) => !v)}
              disabled={!data}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gray-900 hover:bg-black disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 z-10 mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg w-52">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="block w-full px-4 py-2.5 text-sm font-medium text-left text-gray-700 hover:bg-gray-50"
                >
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="block w-full px-4 py-2.5 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  Export Report (Print / PDF)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Screen-only title, since the interactive header above is hidden when printing */}
        <h2 className="hidden mb-2 text-xl font-bold print:block">Monetary Dashboard</h2>

        <div className="flex flex-col justify-between gap-3 mb-5 sm:flex-row sm:items-center print:hidden">
          <div className="flex flex-wrap gap-1.5">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => selectPreset(opt.key)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md ${
                  !customRange && preset === opt.key
                    ? "bg-theme-color-1 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-theme-color-1"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomOpen((v) => !v)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md ${
                customRange
                  ? "bg-theme-color-1 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-theme-color-1"
              }`}
            >
              Custom
            </button>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center self-start gap-1.5 px-3 py-1.5 text-sm font-semibold bg-white border border-gray-200 rounded-md text-gray-700 hover:border-theme-color-1 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isCustomOpen && (
          <div className="flex flex-wrap items-end gap-3 p-4 mb-5 bg-white border border-gray-100 rounded-2xl print:hidden">
            <div>
              <label className="block mb-1 text-xs text-gray-500">Start date</label>
              <input
                type="date"
                value={customStartInput}
                onChange={(e) => setCustomStartInput(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">End date</label>
              <input
                type="date"
                value={customEndInput}
                onChange={(e) => setCustomEndInput(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
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
          <p className="mb-4 text-xs text-gray-400">
            Showing {formatDateLabel(data.startDate)} – {formatDateLabel(data.endDate)} ({granularityLabel.toLowerCase()} view)
          </p>
        )}

        {error && <p className="mb-4 text-red-500">{error}</p>}

        {isLoading && !data ? (
          <p className="py-8 text-center text-gray-500">Loading dashboard...</p>
        ) : (
          <>
            <div className="flex flex-col items-start justify-between gap-2 p-4 mb-4 bg-white border border-gray-100 shadow-sm rounded-2xl sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold tracking-wider text-gray-600 uppercase">Today&apos;s Sales</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatINR(data?.todaySales?.revenue)}</p>
              </div>
              <p className="text-sm text-gray-500">
                {formatCount(data?.todaySales?.subscriptionCount)} subscription(s) bought today
              </p>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 gap-4 mb-4 lg:grid-cols-4">
              <KpiCard
                icon={ShieldCheck}
                tone="bg-emerald-50 text-emerald-600"
                label="Total Revenue"
                value={formatINR(totals?.revenue)}
                changePercent={changePercent?.revenue}
              />
              <KpiCard
                icon={Wallet}
                tone="bg-red-50 text-red-600"
                label="Total Expenses"
                value={formatINR(totals?.expenses)}
                changePercent={changePercent?.expenses}
                invert
              />
              <KpiCard
                icon={TrendingUp}
                tone="bg-green-50 text-theme-color-1"
                label="Profit"
                value={formatINR(totals?.profit)}
                changePercent={changePercent?.profit}
              />
              <KpiCard
                icon={Users}
                tone="bg-purple-50 text-purple-600"
                label="New Subscriptions"
                value={formatCount(totals?.subscriptionCount)}
                changePercent={changePercent?.subscriptionCount}
              />
            </div>

            {/* ── Revenue & Profit ── */}
            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
              <ChartCard title="Revenue, Expenses & Profit" badge={granularityLabel}>
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
              <ChartCard title="Cumulative Revenue vs Expenses" subtitle="Running total over the selected range" badge="All Time">
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
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-3">
              <ChartCard title="Profit Margin %" subtitle="Profit as a share of revenue" badge={granularityLabel}>
                <LineChart
                  data={marginSeries}
                  seriesKeys={[{ key: "profitMargin", label: "Profit Margin", color: "#1baf7a" }]}
                  title="Profit margin percent over time"
                  valueFormatter={formatPercent}
                  allowNegative
                />
              </ChartCard>
              <ChartCard title="Revenue by Plan" badge="All Time">
                <PieChart data={planRevenueData} title="Revenue by plan" valueFormatter={formatINR} />
              </ChartCard>
              <ChartCard title="Subscriptions by Plan" subtitle="By count, not revenue" badge="All Time">
                <PieChart data={planCountData} title="Subscriptions by plan" valueFormatter={formatCount} />
              </ChartCard>
            </div>

            <div className="mb-4">
              <ChartCard title="Expenses by Category" badge="All Time">
                <PieChart data={expenseCategoryData} title="Expenses by category" valueFormatter={formatINR} />
              </ChartCard>
            </div>
            <div ref={transactionsRef} className="mb-4">
              <RecentTransactions />
            </div>

            {/* ── More insights (additional detail beyond the headline view) ── */}
            <SectionHeading>More Insights</SectionHeading>
            <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
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
              <ChartCard title="Payment Method Split">
                <PieChart data={paymentMethodData} title="Payment method split" valueFormatter={formatCount} />
              </ChartCard>
              <ChartCard title="Meals by Category" subtitle="Meals sold by carb type, from subscriptions bought in this range">
                <PieChart data={carbMealsData} title="Meals by category" valueFormatter={formatCount} />
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

            <button
              type="button"
              onClick={() => transactionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="relative flex flex-col items-start justify-between w-full gap-4 p-6 mb-4 overflow-hidden text-left bg-theme-color-1 rounded-2xl sm:flex-row sm:items-center print:hidden"
            >
              <div>
                <p className="text-lg font-bold text-white">Grow Healthier. Grow Bigger.</p>
                <p className="text-sm text-green-50">Track smart. Plan better. Build a healthier tomorrow.</p>
              </div>
              <span className="flex items-center flex-shrink-0 gap-1.5 px-4 py-2 text-sm font-semibold bg-white rounded-lg text-theme-color-1 whitespace-nowrap">
                View Transactions →
              </span>
            </button>

            <p className="mt-2 text-xs text-gray-400">
              Revenue is derived from each subscription's plan and meal count at today's prices — not a
              stored transaction amount — since past prices, discounts and partial refunds aren't tracked.
              Complimentary admin-created subscriptions with no recorded payment method count as ₹0 revenue
              but still appear in subscription counts. "vs previous period" compares the selected range to
              the immediately preceding period of equal length.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const FinanceDashboard = () => (
  <DashboardLayoutComponent>
    <FinanceDashboardContent />
  </DashboardLayoutComponent>
);

export default FinanceDashboard;
