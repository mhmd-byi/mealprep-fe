import { useState, useEffect } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import axios from "axios";
import { ACTIVITY_CATEGORY_LABELS, ACTIVITY_CATEGORY_COLORS, ACTIVITY_CATEGORIES } from "../../activityCategories";

export const MealTracking = () => {

  const userId = sessionStorage.getItem("userId");
  const [isLoading, setIsLoading] = useState(true);
  const [activityRecords, setActivityRecords] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const getActivityRecords = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}activity/get-activities?userId=${userId}`,
      );
      setActivityRecords(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity records:", error);
    }
  };

  useEffect(() => {
    getActivityRecords();
  }, [userId]);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const categoryOf = (record) => record.category || "other";

  const filteredRecords = categoryFilter === "All"
    ? activityRecords
    : activityRecords.filter((record) => categoryOf(record) === categoryFilter);

  if (isLoading) {
    return (
      <DashboardLayoutComponent>
        <div className="p-5">
          <p>Loading...</p>
        </div>
      </DashboardLayoutComponent>
    );
  }

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col p-4 sm:p-6 md:p-8 w-full h-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-center sm:text-left">
                  Meal Tracking
                </h2>
                {activityRecords.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  >
                    <option value="All">All Categories</option>
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{ACTIVITY_CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                {filteredRecords.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "When",
                          "Category",
                          "Details",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 border-b md:border-none flex flex-col md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="md:hidden p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">When:</span>
                                <span>{formatDate(record.date)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Category:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTIVITY_CATEGORY_COLORS[categoryOf(record)]}`}>
                                  {ACTIVITY_CATEGORY_LABELS[categoryOf(record)]}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Details:</span>
                                <span className="text-right max-w-[60%]">{record.description}</span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left hidden md:table-cell">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-left hidden md:table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTIVITY_CATEGORY_COLORS[categoryOf(record)]}`}>
                              {ACTIVITY_CATEGORY_LABELS[categoryOf(record)]}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-left hidden md:table-cell">
                            {record.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    No meal tracking activity found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
