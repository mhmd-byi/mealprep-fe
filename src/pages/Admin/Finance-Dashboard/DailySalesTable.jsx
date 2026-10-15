import { useDailySales } from "./useDailySales";
import { formatINR, formatCount } from "./format";

const pad2 = (n) => String(n).padStart(2, "0");

const MONTH_OPTIONS = [
  { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
  { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
  { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
  { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
];

const formatDayLabel = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

export const DailySalesTable = () => {
  const { days, totals, isLoading, error, month, setMonth } = useDailySales();
  const [yearPart, monthPart] = month.split("-");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div>
          <p className="text-base font-bold text-gray-900">Daily Sales</p>
          <p className="text-sm text-gray-500">Revenue collected each day vs. the actual sale value of meals delivered that day.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={monthPart}
            onChange={(e) => setMonth(`${yearPart}-${e.target.value}`)}
            className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg border border-gray-200"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={yearPart}
            onChange={(e) => setMonth(`${e.target.value}-${monthPart}`)}
            className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg border border-gray-200"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {isLoading ? (
        <p className="py-8 text-sm text-center text-gray-500">Loading daily sales...</p>
      ) : days.length > 0 ? (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">Date</th>
                <th className="px-3 py-2 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase whitespace-nowrap">Revenue Collected</th>
                <th className="px-3 py-2 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase whitespace-nowrap">Subs Sold</th>
                <th className="px-3 py-2 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase whitespace-nowrap">Meals Delivered</th>
                <th className="px-3 py-2 text-xs font-semibold tracking-wide text-right text-gray-500 uppercase whitespace-nowrap">Actual Sale (Delivered)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {days.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{formatDayLabel(day.date)}</td>
                  <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatINR(day.saleAmount)}</td>
                  <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatCount(day.subscriptionCount)}</td>
                  <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatCount(day.mealsDelivered)}</td>
                  <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatINR(day.mealsDeliveredAmount)}</td>
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot className="bg-gray-50 sticky bottom-0">
                <tr>
                  <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap">Total</td>
                  <td className="px-3 py-2 font-bold text-right text-gray-900 whitespace-nowrap">{formatINR(totals.saleAmount)}</td>
                  <td className="px-3 py-2 font-bold text-right text-gray-900 whitespace-nowrap">{formatCount(totals.subscriptionCount)}</td>
                  <td className="px-3 py-2 font-bold text-right text-gray-900 whitespace-nowrap">{formatCount(totals.mealsDelivered)}</td>
                  <td className="px-3 py-2 font-bold text-right text-gray-900 whitespace-nowrap">{formatINR(totals.mealsDeliveredAmount)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <p className="py-8 text-sm text-center text-gray-400">No data for this month.</p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        "Revenue Collected" is cash collected when a subscription was bought, all at once. "Actual Sale (Delivered)" values each meal actually delivered that day at that subscription's price ÷ its total meals — an estimate, not a separate real transaction. Free/complimentary and refunded plans count as ₹0.
      </p>
    </div>
  );
};

export default DailySalesTable;
