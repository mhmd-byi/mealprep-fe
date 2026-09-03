import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button } from "../../../components";

export const DietaryStockReport = () => {
  const [report, setReport] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/dietary-stock-report`,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      setReport(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching dietary stock report:", err);
      setError(err.response?.data?.message || err.message);
      setReport([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
        <div className="mx-auto w-full max-w-7xl">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold md:text-2xl">Dietary Stock Report</h2>
                <Button
                  onClick={fetchReport}
                  className="px-4 py-2 font-medium text-white bg-green-500 rounded-lg transition duration-300 ease-in-out hover:bg-green-600"
                >
                  Refresh
                </Button>
              </div>
              <p className="mb-6 text-sm text-gray-500">
                Confirmed veg / non-veg counts for the next 3 delivery days — these are locked and
                already committed, so it's safe to buy raw materials against these numbers.
              </p>

              {error && <p className="mb-4 text-red-500">{error}</p>}

              {isLoading ? (
                <p className="text-gray-500">Loading report...</p>
              ) : report.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Lunch — Veg</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Lunch — Non-Veg</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Dinner — Veg</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Dinner — Non-Veg</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.map((day) => (
                          <tr key={day.date} className="hover:bg-gray-100">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {formatDayLabel(day.date)}
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
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">3-Day Total</td>
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
                <p className="py-4 text-center text-gray-500">No delivery days in the confirmed window.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default DietaryStockReport;
