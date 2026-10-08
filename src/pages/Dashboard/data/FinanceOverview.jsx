import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useFinanceDashboard } from "../../Admin/Finance-Dashboard/useFinanceDashboard";
import { GroupedBarChart } from "../../Admin/Finance-Dashboard/GroupedBarChart";
import { LineChart } from "../../Admin/Finance-Dashboard/LineChart";
import { PieChart } from "../../Admin/Finance-Dashboard/PieChart";
import { formatINR, formatCount } from "../../Admin/Finance-Dashboard/format";
import { getPlanColor, CARB_TYPE_LABELS, getCarbTypeColor } from "../../Admin/Finance-Dashboard/index";

const percentChange = (current, previous) => {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const ChangeBadge = ({ percent }) => {
  if (percent === null || percent === undefined) return null;
  if (percent === 0) return <span className="text-xs font-semibold text-gray-400">No change</span>;
  const up = percent > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-green-600" : "text-red-600"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent)}%
    </span>
  );
};

export const FinanceOverview = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFinanceDashboard();

  if (isLoading && !data) {
    return (
      <section className="px-4 mb-8">
        <p className="py-10 text-center text-gray-500">Loading business overview...</p>
      </section>
    );
  }
  if (!data) return null;

  const series = (data.series || []).slice(-6);
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const revenueChange = latest && previous ? percentChange(latest.revenue, previous.revenue) : undefined;
  const expensesChange = latest && previous ? percentChange(latest.expenses, previous.expenses) : undefined;
  const profitChange = latest && previous ? percentChange(latest.profit, previous.profit) : undefined;

  const carbData = (data.carbBreakdown || []).map((c) => ({
    label: CARB_TYPE_LABELS[c.carbType] || c.carbType,
    value: c.meals,
    color: getCarbTypeColor(c.carbType),
  }));

  const revenueByPlanData = (data.planBreakdown || []).map((p) => ({
    label: p.plan,
    value: p.revenue,
    color: getPlanColor(p.plan),
  }));

  const activeSubscribersNow = (data.planBreakdown || []).reduce((sum, p) => sum + p.count, 0);

  return (
    <section className="px-4 mb-8 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold text-gray-900">Business Overview</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/finance-dashboard")}
          className="flex gap-1 items-center text-sm font-semibold text-theme-color-1 hover:underline"
        >
          View Detailed Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap gap-4 justify-between items-start mb-3">
            <p className="text-base font-bold text-gray-900">Sales Overview</p>
            {latest && (
              <div className="flex flex-wrap gap-5 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Revenue ({latest.label})</p>
                  <p className="flex gap-1.5 items-baseline font-bold text-gray-900">
                    {formatINR(latest.revenue)} <ChangeBadge percent={revenueChange} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expenses</p>
                  <p className="flex gap-1.5 items-baseline font-bold text-gray-900">
                    {formatINR(latest.expenses)} <ChangeBadge percent={expensesChange} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profit</p>
                  <p className="flex gap-1.5 items-baseline font-bold text-gray-900">
                    {formatINR(latest.profit)} <ChangeBadge percent={profitChange} />
                  </p>
                </div>
              </div>
            )}
          </div>
          <GroupedBarChart
            data={series}
            seriesKeys={[
              { key: "revenue", label: "Revenue", color: "#2a78d6" },
              { key: "expenses", label: "Expenses", color: "#eb6834" },
              { key: "profit", label: "Profit", color: "#1baf7a" },
            ]}
            title="Revenue, expenses and profit, last 6 months"
          />
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="mb-3 text-base font-bold text-gray-900">Meals by Category</p>
          <PieChart data={carbData} title="Meals by category" valueFormatter={formatCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-base font-bold text-gray-900">New Subscriptions</p>
            <span className="px-3 py-1 text-xs font-bold text-theme-color-1 bg-green-50 rounded-full whitespace-nowrap">
              {formatCount(activeSubscribersNow)} Active now
            </span>
          </div>
          <LineChart
            data={series}
            seriesKeys={[{ key: "subscriptionCount", label: "New Subscriptions", color: "#2a78d6" }]}
            title="New subscriptions per month"
            valueFormatter={formatCount}
          />
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="mb-3 text-base font-bold text-gray-900">Revenue by Plan</p>
          <PieChart data={revenueByPlanData} title="Revenue by plan" valueFormatter={formatINR} />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <p className="text-base font-bold text-gray-900">Subscription Plan Performance</p>
        </div>
        {data.planBreakdown?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Plan", "Subscribers", "Revenue"].map((h) => (
                    <th key={h} className="px-4 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.planBreakdown.map((p) => (
                  <tr key={p.plan}>
                    <td className="flex gap-2 items-center px-4 py-3 font-semibold text-gray-900">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getPlanColor(p.plan) }} />
                      {p.plan}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatCount(p.count)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-gray-500">No subscriptions in this range.</p>
        )}
      </div>
    </section>
  );
};

export default FinanceOverview;
