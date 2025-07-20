import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import { FileDownload } from "@mui/icons-material";

export const UserListWithCancelRequest = () => {
  const [cancelledMeals, setCancelledMeals] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
  });

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const currentDate = getCurrentDate();
    const dayOfWeek = new Date(selectedDate).getDay();

    if (dayOfWeek === 0) {
      // 0 = Sunday
      alert("Sundays are not allowed. Please select another date.");
      return;
    }

    if (selectedDate >= currentDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    } else {
      console.warn("Cannot select a date in the past");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/cancelled-meals?date=${formData.date}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setCancelledMeals(response.data);
        setError(null);
      } else {
        setError("Received unexpected data format from server.");
        setCancelledMeals([]);
      }
    } catch (error) {
      setError(
        `Failed to fetch cancelled meals: ${
          error.response?.data?.message || error.message
        }`
      );
      setCancelledMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const exportToCSV = () => {
    // Define headers
    const headers = ["User Id", "Name", "Start Date", "End Date", "Meal Type"];

    // Convert data to CSV format
    const csvData = cancelledMeals.map((meal) => [
      meal.userId,
      meal.name,
      formatDate(meal.startDate),
      formatDate(meal.endDate),
      meal.mealType,
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cancelled-meals-${formData.date || "all"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayoutComponent>
        <div className="p-5">
          <p>Loading cancelled meals...</p>
        </div>
      </DashboardLayoutComponent>
    );
  }

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full h-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
                Cancelled Meals
              </h2>

              {/* Form Container - Responsive Grid */}
              <form onSubmit={handleFormSubmit} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={handleDateChange}
                      min={getCurrentDate()}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>

              {/* Export Button */}
              {cancelledMeals.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <Button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {/* <Download size={16} /> */}
                    Export CSV
                  </Button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-center mb-4">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                {cancelledMeals.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "User Id",
                          "Name",
                          "Start Date",
                          "End Date",
                          "Meal Type",
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
                      {cancelledMeals.map((meal, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 border-b md:border-none flex flex-col md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="md:hidden p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">User Id:</span>
                                <span>{meal.userId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{meal.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Start Date:</span>
                                <span>{formatDate(meal.startDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">End Date:</span>
                                <span>{formatDate(meal.endDate)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Meal Type:</span>
                                <span className="capitalize">
                                  {meal.mealType}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                            {meal.userId}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hidden md:table-cell">
                            {meal.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                            {formatDate(meal.startDate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                            {formatDate(meal.endDate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize hidden md:table-cell">
                            {meal.mealType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    No cancelled meals found
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
