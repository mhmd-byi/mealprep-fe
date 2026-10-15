import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import { FileDownload } from "@mui/icons-material";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export const UserListWithCustomisationRequest = () => {
  const [customisationRequests, setCustomisationRequests] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split("T")[0] });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const currentDate = getCurrentDate();

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
        `${process.env.REACT_APP_API_URL}meal/get-customisation-requests?date=${formData.date}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const resData = response.data;
      if (Array.isArray(resData)) {
        resData.sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
  
          return aDate > bDate ? 1 : -1;
        });
        const usrToRequestInfo = new Map();
        resData.forEach((info) => usrToRequestInfo.set(info.userId, info))
        setCustomisationRequests(Array.from(usrToRequestInfo.values()));
        setError(null);
      } else {
        setError("Received unexpected data format from server.");
        setCustomisationRequests([]);
      }
    } catch (error) {
      setError(
        `Failed to fetch customisation requests: ${
          error.response?.data?.message || error.message
        }`
      );
      setCustomisationRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateString) =>
    dateString ? new Date(dateString).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedRequests = [...customisationRequests].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    if (sortConfig.key === "name") {
      aValue = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`.toLowerCase();
      bValue = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.toLowerCase();
    } else if (sortConfig.key === "date") {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    } else if (sortConfig.key === "mealType") {
      aValue = (a.mealType || "").toLowerCase();
      bValue = (b.mealType || "").toLowerCase();
    } else if (sortConfig.key === "requestTime") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="inline-block ml-1 w-3 h-3 text-theme-color-1" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline-block ml-1 w-4 h-4 font-bold text-theme-color-1" />
    ) : (
      <ChevronDown className="inline-block ml-1 w-4 h-4 font-bold text-theme-color-1" />
    );
  };

  const exportToCSV = () => {
    const headers = ["User Id", "User Name", "Date", "Meal Type", "Item Name", "Item Weight/Count", "Exclude", "Request Time"];

    // Convert data to CSV format
    const csvData = sortedRequests.reduce((fArr, meal) => {
      const upItems = meal.items.map((item) => {
        return [
          meal.userId || "",
          (meal.user.firstName || "") + " " + (meal.user.lastName || ""),
          formatDate(meal.date),
          meal.mealType || "",
          item.name || "",
          item.weight || "",
          item.exclude || "",
          formatDateTime(meal.createdAt),
        ]
      });

      if (fArr.length < 1) return [...upItems];
      return [...fArr, [], ...upItems];
    }, []);

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
      `Customisation-Requests-${formData.date || "all"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 w-full h-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
                Customisation Meal Requests
              </h2>

              {/* Form Container - Responsive Grid */}
              <form onSubmit={handleFormSubmit} className="mb-6 print:hidden">
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

              {/* Print-only context, since the date form above is hidden when printing */}
              {formData.date && (
                <p className="hidden print:block text-sm text-gray-500 mb-3">
                  Date: {formatDate(formData.date)}
                </p>
              )}

              {/* Export Buttons */}
              {customisationRequests.length > 0 && (
                <div className="mb-4 flex gap-2 justify-end print:hidden">
                  <Button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    {/* <Download size={16} /> */}
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-white font-semibold py-2 px-4 rounded-lg border-2 shadow-sm transition-colors duration-300 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
                  >
                    Export (Print / PDF)
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
                {sortedRequests.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          onClick={() => handleSort("name")}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell print:table-cell cursor-pointer hover:text-theme-color-1"
                        >
                          Name <SortIcon columnKey="name" />
                        </th>
                        <th
                          onClick={() => handleSort("date")}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell print:table-cell cursor-pointer hover:text-theme-color-1"
                        >
                          Date <SortIcon columnKey="date" />
                        </th>
                        <th
                          onClick={() => handleSort("mealType")}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell print:table-cell cursor-pointer hover:text-theme-color-1"
                        >
                          Meal Type <SortIcon columnKey="mealType" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell print:table-cell">
                          Items
                        </th>
                        <th
                          onClick={() => handleSort("requestTime")}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell print:table-cell cursor-pointer hover:text-theme-color-1"
                        >
                          Request Time <SortIcon columnKey="requestTime" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRequests.map((request, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 border-b md:border-none flex flex-col md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="md:hidden print:hidden p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{request.user.firstName} {request.user.lastName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>{formatDate(request.date)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Meal Type:</span>
                                <span className="capitalize">{request.mealType}</span>
                              </div>
                              <div className="flex justify-start">
                                <span className="font-medium">Items:</span>
                                <span className="capitalize" style={{ textDecorationLine: request.items.exclude ? "line-through" : undefined }}>
                                  Name: {request.items.name}
                                </span>
                                <span className="capitalize line-through" style={{ textDecorationLine: request.items.exclude ? "line-through" : undefined }}>
                                  Weight/Count: {request.items.weight}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Requested:</span>
                                <span>{formatDateTime(request.createdAt)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left hidden md:table-cell print:table-cell">
                            {request.user.firstName} {request.user.lastName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-left hidden md:table-cell print:table-cell">
                            {formatDate(request.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize text-left hidden md:table-cell print:table-cell">
                            {request.mealType}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize text-left hidden md:table-cell print:table-cell">
                            {request.items.map((item) => (
                              <>
                                <tr>
                                  <td><span style={{ textDecorationLine: item.exclude ? "line-through" : undefined }}>Name: {item.name} - Weight/Count: {item.weight}</span></td>
                                </tr>
                              </>
                            ))}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-left hidden md:table-cell print:table-cell">
                            {formatDateTime(request.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    No customisation meal requests found
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
