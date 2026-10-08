import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button } from "../../../components";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";

const DAY_OPTIONS = [3, 7, 14, 30];
const AUTO_REFRESH_MS = 60 * 1000;

export const DietaryStockReport = () => {
  const [report, setReport] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReport = useCallback(async (selectedDays) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/dietary-stock-report`,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          params: { days: selectedDays },
        }
      );
      setReport(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dietary stock report:", err);
      setError(err.response?.data?.message || err.message);
      setReport([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(days);
  }, [days, fetchReport]);

  // Counts shift whenever a cancellation/customisation happens elsewhere in the
  // app, so this refreshes itself periodically instead of only ever showing
  // whatever was true when the page first loaded.
  useEffect(() => {
    const interval = setInterval(() => fetchReport(days), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [days, fetchReport]);

  const formatDayLabel = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const totals = report.reduce(
    (acc, day) => ({
      lunchVeg: acc.lunchVeg + (day.lunch?.veg || 0),
      lunchNonVeg: acc.lunchNonVeg + (day.lunch?.nonVeg || 0),
      dinnerVeg: acc.dinnerVeg + (day.dinner?.veg || 0),
      dinnerNonVeg: acc.dinnerNonVeg + (day.dinner?.nonVeg || 0),
    }),
    { lunchVeg: 0, lunchNonVeg: 0, dinnerVeg: 0, dinnerNonVeg: 0 }
  );

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-start p-4 w-full sm:p-6 md:p-8">
        <div className="w-full">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap gap-3 justify-between items-center mb-2">
                <h2 className="text-xl font-bold md:text-2xl">Dietary Stock Report</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex gap-1.5">
                    {DAY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDays(opt)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md border-2 ${
                          days === opt
                            ? "bg-theme-color-1 text-white border-theme-color-1"
                            : "bg-white text-theme-color-1 border-theme-color-1"
                        }`}
                      >
                        {opt} Days
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => fetchReport(days)}
                    className="px-4 py-2 font-medium text-white bg-green-500 rounded-lg transition duration-300 ease-in-out hover:bg-green-600"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <p className="mb-1 text-sm text-gray-500">
                Veg / non-veg counts projected across the next {days} delivery day{days === 1 ? "" : "s"}.
                Days marked <span className="font-semibold text-green-700">Confirmed</span> are locked and
                already committed — safe to buy raw materials against. Days marked{" "}
                <span className="font-semibold text-amber-700">Projected</span> are still outside the lock
                window, so a customer could still cancel, change their diet preference, or run out of meals
                before then — treat those as an estimate, not a purchase order.
              </p>
              {lastUpdated && (
                <p className="mb-6 text-xs text-gray-400">
                  Last updated {lastUpdated.toLocaleTimeString()} — refreshes automatically every minute.
                </p>
              )}

              {error && <p className="mb-4 text-red-500">{error}</p>}

              {isLoading && report.length === 0 ? (
                <p className="text-gray-500">Loading report...</p>
              ) : report.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            <span className="flex items-center gap-1.5">Lunch — Veg <VegNonVegIcon value="veg" /></span>
                          </th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            <span className="flex items-center gap-1.5">Lunch — Non-Veg <VegNonVegIcon value="non-veg" /></span>
                          </th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            <span className="flex items-center gap-1.5">Dinner — Veg <VegNonVegIcon value="veg" /></span>
                          </th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            <span className="flex items-center gap-1.5">Dinner — Non-Veg <VegNonVegIcon value="non-veg" /></span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.map((day) => (
                          <tr key={day.date} className="hover:bg-gray-100">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {formatDayLabel(day.date)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  day.locked ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {day.locked ? "Confirmed" : "Projected"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">{day.lunch?.veg || 0}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{day.lunch?.nonVeg || 0}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{day.dinner?.veg || 0}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{day.dinner?.nonVeg || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{days}-Day Total</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900"></td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{totals.lunchVeg}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{totals.lunchNonVeg}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{totals.dinnerVeg}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{totals.dinnerNonVeg}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-gray-500">No delivery days in the selected window.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default DietaryStockReport;
