import { useState } from "react";
import axios from "axios";
import { Button, Input } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";
import FilterPopup from "../../../components/common/FilterPopup/FilterPopup";

export const UserListOfMealDelivery = () => {
  const [mealDeliveryList, setMealDeliveryList] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    mealType: '',
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    planType: 'All',
    mealCount: '',
    operator: '>'
  });

  const fetchUserDetails = async (userId) => {
    try {
      setIsPopupLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}user/${userId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Error fetching user details", error);
      alert("Failed to fetch user details. Please try again.");
    } finally {
      setIsPopupLoading(false);
    }
  };

  const filteredMeals = mealDeliveryList.filter(meal => {
    // Search filter
    const searchMatch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Plan Type filter
    let planMatch = true;
    if (filterCriteria.planType !== 'All') {
      planMatch = meal.plan?.includes(filterCriteria.planType);
    }

    // Meal Count filter
    let mealCountMatch = true;
    if (filterCriteria.mealCount !== '') {
      const totalMeals = (meal.lunchMeals || 0) + (meal.nextDayLunchMeals || 0) + 
                        (meal.dinnerMeals || 0) + (meal.nextDayDinnerMeals || 0);
      const targetCount = parseInt(filterCriteria.mealCount);
      
      if (filterCriteria.operator === '>') mealCountMatch = totalMeals > targetCount;
      else if (filterCriteria.operator === '<') mealCountMatch = totalMeals < targetCount;
      else if (filterCriteria.operator === '=') mealCountMatch = totalMeals === targetCount;
    }

    return searchMatch && planMatch && mealCountMatch;
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
      alert("Sundays are not allowed. Please select another date.");
      return;
    }

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
    const headers = ["Name", "Email", "Mobile", "Address", "Meal Type", "Carb Type", "Allergy", "Selected Plan", "Meal Counts Left"];
    
    // Convert data to CSV format
    const csvData = filteredMeals.map(meal => [
      meal.name,
      meal.email,
      meal.mobile,
      meal.address,
      meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1),
      meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1),
      meal.allergy,
      meal.plan,
      `Lunch: ${meal.lunchMeals + meal.nextDayLunchMeals}, Dinner: ${meal.dinnerMeals + meal.nextDayDinnerMeals}`,
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
    <>
      <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-start items-start p-5 w-full">
        <div className="w-full max-w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold mb-4">Meal Delivery List</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col">
                <div className="flex flex-col p-5 text-center w-full">
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
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <SearchBar 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search name or email..."
                          />
                          <button
                            onClick={() => setShowFilterPopup(true)}
                            type="button"
                            className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-white text-theme-color-1 shadow-sm border-2 border-theme-color-1 hover:bg-theme-color-1 hover:text-white transition-colors duration-300"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            Filter
                          </button>
                          <Button
                            onClick={exportToCSV}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            Export to CSV
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                  
                  {error && (
                    <p className="text-red-500 mt-4 mb-2">{error}</p>
                  )}

                  <div className="mt-4 w-full">
                    {filteredMeals.length > 0 ? (
                      <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Mobile
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Address
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Veg/Non-Veg
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Carb Type
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Allergy
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Selected Plan
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Meal Counts Left
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredMeals.map((meal, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-4 py-4 text-sm font-medium">
                                    <div 
                                      className="break-words cursor-pointer text-theme-color-1 hover:underline"
                                      onClick={() => fetchUserDetails(meal.userId)}
                                    >
                                      {meal.name}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {meal.email}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {meal.mobile}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words max-w-[200px]">
                                      {meal.address}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {meal?.allergy || "None"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="break-words">
                                      {meal?.plan || ""}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      Lunch: {meal.lunchMeals + meal.nextDayLunchMeals}, Dinner: {meal.dinnerMeals + meal.nextDayDinnerMeals}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden mt-4 space-y-4">
                          {filteredMeals.map((meal, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Name:</span>
                                  <span 
                                    className="text-theme-color-1 cursor-pointer hover:underline text-right break-words max-w-[60%]"
                                    onClick={() => fetchUserDetails(meal.userId)}
                                  >
                                    {meal.name}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Email:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal.email}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Mobile:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal.mobile}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Address:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal.address}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Veg/Non-Veg:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Carb Type:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Selected Plan:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal?.plan || ""}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">Allergy:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal?.allergy || "None"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">Meal Counts Left:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    Lunch: {meal.lunchMeals + meal.nextDayLunchMeals}, Dinner: {meal.dinnerMeals + meal.nextDayDinnerMeals}
                                  </span>
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

    <FilterPopup
      isOpen={showFilterPopup}
      onClose={() => setShowFilterPopup(false)}
      criteria={filterCriteria}
      setCriteria={setFilterCriteria}
      title="Filter Meal Delivery"
    />

    <Popup
      isOpen={!!selectedUser || isPopupLoading}
      onClose={() => setSelectedUser(null)}
      title="Customer Details"
      content={
        isPopupLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-color-1"></div>
          </div>
        ) : (
          selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mobile</p>
                  <p className="font-semibold">{selectedUser.mobile}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Address</p>
                  <p className="font-semibold">{selectedUser.postalAddress}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
                <div>
                  <p className="text-gray-500">Meal Counts Left</p>
                  <p className="font-bold text-lg text-theme-color-1">
                    Lunch: {(selectedUser.mealCounts?.lunchMeals || 0) + (selectedUser.mealCounts?.nextDayLunchMeals || 0)}, 
                    Dinner: {(selectedUser.mealCounts?.dinnerMeals || 0) + (selectedUser.mealCounts?.nextDayDinnerMeals || 0)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Subscription History</h3>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                    [...selectedUser.subscriptions].reverse().map((sub, i) => (
                      <div key={i} className="border p-3 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between font-bold text-theme-color-1">
                          <span>{sub.plan}</span>
                          <span>₹{sub.price}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><span className="text-gray-500">Status:</span> <span className={`${sub.status === 'Active' ? 'text-green-600' : 'text-gray-600'} font-bold`}>{sub.status}</span></div>
                          <div><span className="text-gray-500">Date:</span> {new Date(sub.subscriptionStartDate).toLocaleDateString()}</div>
                          <div><span className="text-gray-500">Meals:</span> {sub.mealType?.charAt(0).toUpperCase() + sub.mealType?.slice(1)}</div>
                          <div><span className="text-gray-500">Carbs:</span> {sub.carbType?.charAt(0).toUpperCase() + sub.carbType?.slice(1)}</div>
                          {sub.allergy && (
                            <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="text-red-500 font-bold">{sub.allergy}</span></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No subscription history found.</p>
                  )}
                </div>
              </div>
            </div>
          )
        )
      }
      buttons={[
        {
          label: "Close",
          onClick: () => setSelectedUser(null),
          className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      ]}
    />
    </>
  );
};