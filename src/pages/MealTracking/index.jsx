import React, { useState, useEffect } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import axios from "axios";

export const MealTracking = () => {

  const userId = sessionStorage.getItem("userId");
  const [isLoading, setIsLoading] = useState(true);
  const [activityRecords, setActivityRecords] = useState([]);
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
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
                Meal trackings
              </h2>

              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                {activityRecords.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Date",
                          "Description",
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
                    <tbody>
                      {activityRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 border-b md:border-none flex flex-col md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="md:hidden p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>{formatDate(record.date)}</span>
                              </div>
                              
                              <div className="flex justify-start">
                                <span className="capitalize">
                                  {record.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left hidden md:table-cell">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize text-left hidden md:table-cell">
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
