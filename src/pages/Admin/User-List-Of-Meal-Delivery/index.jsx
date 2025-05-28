import { useState } from "react";
import axios from "axios";
import { Button, Input } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";

export const UserListOfMealDelivery = () => {
  const [mealDeliveryList, setMealDeliveryList] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    mealType: '',
  });

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

  const handleMealTypeChange = (e) =>
    setFormData((prev) => ({ ...prev, mealType: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/get-meal-delivery-details?date=${formData.date}&mealType=${formData.mealType}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setMealDeliveryList(response.data);
        setError(null);
      } else {
        setError("Received unexpected data format from server.");
        setMealDeliveryList([]);
      }
    } catch (error) {
      setError(`Failed to fetch meal deliver list: ${error.response?.data?.message || error.message}`);
      setMealDeliveryList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    // Define headers
    const headers = ["Name", "Email", "Mobile", "Address", "Meal Type", "Carb Type", "Selected Plan"];
    
    // Convert data to CSV format
    const csvData = mealDeliveryList.map(meal => [
      meal.name,
      meal.email,
      meal.mobile,
      meal.address,
      meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1),
      meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1),
      meal.plan,
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `meal-delivery-${formData.date}-${formData.mealType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <DashboardLayoutComponent>
        <div className="p-5">
          <p>Loading meal delivery list...</p>
        </div>
      </DashboardLayoutComponent>
    );
  }
  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="min-w-[300px] md:min-w-[600px] lg:min-w-[900px] py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold mb-4">Meal Delivery List</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col">
                <div className="flex flex-col p-5 text-center min-w-full">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={handleDateChange}
                          min={getCurrentDate()}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        />
                      </div>
                      <div>
                        <Input
                          type="select"
                          value={formData.mealType}
                          onChange={handleMealTypeChange}
                          placeholder="Select Meal Type"
                          options={[
                            { value: "lunch", label: "Lunch" },
                            { value: "dinner", label: "Dinner" },
                          ]}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        {isLoading ? "Submitting..." : "Submit"}
                      </Button>
                      
                      {mealDeliveryList.length > 0 && (
                        <Button
                          onClick={exportToCSV}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          Export CSV
                        </Button>
                      )}
                    </div>
                  </form>
                  
                  {error && (
                    <p className="text-red-500 mt-4 mb-2">{error}</p>
                  )}

                  <div className="mt-4 overflow-x-auto">
                    {mealDeliveryList.length > 0 ? (
                      <div className="min-w-full">
                        {/* Desktop View */}
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left hidden md:table">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mobile
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Veg/Non-Veg
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Carb Type
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Selected Plan
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {mealDeliveryList.map((meal, index) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {meal.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal.mobile}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal?.plan || ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                          {mealDeliveryList.map((meal, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Name:</span>
                                  <span className="text-gray-900">{meal.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Email:</span>
                                  <span className="text-gray-900">{meal.email}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Mobile:</span>
                                  <span className="text-gray-900">{meal.mobile}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">Address:</span>
                                  <span className="text-gray-900 text-right">{meal.address}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        No meal delivery data found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};