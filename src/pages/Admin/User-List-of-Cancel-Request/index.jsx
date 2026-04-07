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

  const formatDateTime = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : "N/A";
  };

  const exportToCSV = () => {
    // Define headers
    const headers = [
      "User Id",
      "Name",
      "Start Date",
      "End Date",
      "Meal Type",
      "Request Time",
    ];

    // Convert data to CSV format
    const csvData = cancelledMeals.map((meal) => [
      meal.userId,
      meal.name,
      formatDate(meal.startDate),
      formatDate(meal.endDate),
      meal.mealType,
      formatDateTime(meal.createdAt),
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
      <div className="flex flex-col justify-center items-center p-4 w-full h-full sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <h2 className="mb-4 text-xl font-bold text-center md:text-2xl">
                Cancelled Meals
              </h2>

              {/* Form Container - Responsive Grid */}
              <form onSubmit={handleFormSubmit} className="mb-6">
                <div className="grid grid-cols-1 gap-4 items-center md:grid-cols-3">
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
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={exportToCSV}
                    className="flex gap-2 items-center px-4 py-2 font-medium text-white bg-blue-500 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {/* <Download size={16} /> */}
                    Export CSV
                  </Button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              {/* Responsive Table Container */}
              {console.log('these are cancelled meals', cancelledMeals)}
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
                          "Request Time",
                        ].map((header) => (
                          <th
                            key={header}
                            className="hidden px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase md:table-cell"
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
                          className="flex flex-col border-b hover:bg-gray-100 md:border-none md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="p-4 md:hidden">
                            <div className="space-y-2">
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">User Id:</span>
                                <span className="text-left">{meal.userId}</span>
                              </div>
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">Name:</span>
                                <span className="text-left">{meal.name}</span>
                              </div>
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">Start Date:</span>
                                <span className="text-left">{formatDate(meal.startDate)}</span>
                              </div>
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">End Date:</span>
                                <span className="text-left">{formatDate(meal.endDate)}</span>
                              </div>
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">Meal Type:</span>
                                <span className="capitalize text-left">
                                  {meal.mealType}
                                </span>
                              </div>
                              <div className="flex text-left justify-between">
                                <span className="font-medium text-left">Request Time:</span>
                                <span className="text-left">{formatDateTime(meal.createdAt)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="hidden px-4 py-4 text-sm text-left text-gray-900 whitespace-nowrap md:table-cell">
                            {meal.userId}
                          </td>
                          <td className="hidden px-4 py-4 text-sm font-medium text-left text-gray-900 whitespace-nowrap md:table-cell">
                            {meal.name}
                          </td>
                          <td className="hidden px-4 py-4 text-sm text-left text-gray-900 whitespace-nowrap md:table-cell">
                            {formatDate(meal.startDate)}
                          </td>
                          <td className="hidden px-4 py-4 text-sm text-left text-gray-900 whitespace-nowrap md:table-cell">
                            {formatDate(meal.endDate)}
                          </td>
                          <td className="hidden px-4 py-4 text-sm text-left text-gray-900 capitalize whitespace-nowrap md:table-cell">
                            {meal.mealType}
                          </td>
                          <td className="hidden px-4 py-4 text-sm text-left text-gray-900 whitespace-nowrap md:table-cell">
                            {formatDateTime(meal.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="py-4 text-center text-gray-500">
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
