import { useState } from "react";
import axios from "axios";
import { Button, Input } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";
import FilterPopup from "../../../components/common/FilterPopup/FilterPopup";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

  const sortedMeals = [...filteredMeals].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    if (sortConfig.key === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (sortConfig.key === 'mealCount') {
      aValue = (a.lunchMeals || 0) + (a.nextDayLunchMeals || 0) + 
               (a.dinnerMeals || 0) + (a.nextDayDinnerMeals || 0);
      bValue = (b.lunchMeals || 0) + (b.nextDayLunchMeals || 0) + 
               (b.dinnerMeals || 0) + (b.nextDayDinnerMeals || 0);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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
      <div className="block flex-col justify-start items-start p-5 w-full lg:flex">
        <div className="px-4 py-8 w-full max-w-full sm:px-6 lg:px-8">
          <div className="mx-auto">
            <h2 className="mb-4 text-2xl font-bold">Meal Delivery List</h2>
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="flex flex-col">
                <div className="flex flex-col p-5 w-full text-center">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        className="px-4 py-2 font-medium text-white bg-green-500 rounded-lg transition duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        {isLoading ? "Submitting..." : "Submit"}
                      </Button>
                      
                      {mealDeliveryList.length > 0 && (
                        <div className="flex flex-col gap-4 items-center sm:flex-row">
                          <SearchBar 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search name or email..."
                          />
                          <button
                            onClick={() => setShowFilterPopup(true)}
                            type="button"
                            className="flex justify-center items-center px-4 py-2 text-sm font-semibold bg-white rounded-md border-2 shadow-sm transition-colors duration-300 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
                          >
                            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                            Filter
                          </button>
                          <Button
                            onClick={() => exportToCSV(sortedMeals)}
                            className="px-4 py-2 font-medium text-white bg-blue-500 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            Export to CSV
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                  
                  {error && (
                    <p className="mt-4 mb-2 text-red-500">{error}</p>
                  )}

                  <div className="mt-4 w-full">
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center py-20">
                        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
                        <p className="mt-4 font-medium text-gray-500">Loading delivery list...</p>
                      </div>
                    ) : sortedMeals.length > 0 ? (
                      <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full text-left divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                              <tr>
                                <th 
                                  className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort('name')}
                                >
                                  Customer Info <SortIcon columnKey="name" />
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Mobile
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Address
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Meal Type
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Carb Type
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Selected Plan
                                </th>
                                <th 
                                  className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort('mealCount')}
                                >
                                  Meal Counts Left <SortIcon columnKey="mealCount" />
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sortedMeals.map((meal, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-4 py-4 text-sm font-medium border-b max-w-[250px]">
                                    <div 
                                      className="font-bold break-words cursor-pointer text-theme-color-1 hover:underline"
                                      onClick={() => fetchUserDetails(meal.userId)}
                                    >
                                      {meal.name}
                                    </div>
                                    <div className="text-xs text-gray-500 break-all">{meal.email}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">{meal.mobile}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">{meal.address}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      {meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      {meal?.plan}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      Lunch: {meal.lunchMeals + meal.nextDayLunchMeals},<br/>
                                      Dinner: {meal.dinnerMeals + meal.nextDayDinnerMeals}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="mt-4 space-y-4 md:hidden">
                          {sortedMeals.map((meal, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Name:</span>
                                  <span 
                                    className="font-bold text-right cursor-pointer text-theme-color-1 hover:underline"
                                    onClick={() => fetchUserDetails(meal.userId)}
                                  >
                                    {meal.name}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Email:</span>
                                  <span className="text-gray-900 text-right break-all max-w-[60%]">{meal.email}</span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Mobile:</span>
                                  <span className="text-right text-gray-900">{meal.mobile}</span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Address:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal.postalAddress}</span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Meal Type:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {meal?.mealType?.charAt(0).toUpperCase() + meal?.mealType?.slice(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Carb Type:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium text-gray-500">Selected Plan:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">{meal?.plan || ""}</span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
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
                      <div className="flex flex-col justify-center items-center py-10">
                        <p className="font-medium text-center text-gray-500">No meal delivery data found</p>
                      </div>
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
            <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
          </div>
        ) : (
          selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
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

              <div className="flex justify-between items-center p-3 mb-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-500">Meal Counts Left</p>
                  <p className="text-lg font-bold text-theme-color-1">
                    Lunch: {(selectedUser.mealCounts?.lunchMeals || 0) + (selectedUser.mealCounts?.nextDayLunchMeals || 0)}, 
                    Dinner: {(selectedUser.mealCounts?.dinnerMeals || 0) + (selectedUser.mealCounts?.nextDayDinnerMeals || 0)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-bold">Subscription History</h3>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                    [...selectedUser.subscriptions].reverse().map((sub, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border shadow-sm">
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
                            <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="font-bold text-red-500">{sub.allergy}</span></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">No subscription history found.</p>
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