import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "../../../components";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";
import FilterPopup from "../../../components/common/FilterPopup/FilterPopup";
import Pagination from "../../../components/common/Pagination/Pagination";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CalendarDays,
  SlidersHorizontal,
  Download,
  Printer,
  RotateCcw,
  Users,
  Leaf,
  Beef,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  History,
} from "lucide-react";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const StatTile = ({ icon: Icon, tone, label, value, highlight }) => (
  <div className={`flex gap-3 items-center p-4 rounded-xl border ${highlight ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
    <div className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className={`text-xs font-medium ${highlight ? "text-red-500" : "text-gray-500"}`}>{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  </div>
);

export const UserListOfMealDelivery = () => {
  const [mealDeliveryList, setMealDeliveryList] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    mealType: '',
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    planType: 'All',
    mealCount: '',
    operator: '>',
    category: 'All', // veg / non-veg
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isPrinting, setIsPrinting] = useState(false);

  // Printing should include every filtered row, not just the current page —
  // switch to the full sorted list right before print, then restore paging.
  useEffect(() => {
    if (!isPrinting) return;
    const timer = setTimeout(() => window.print(), 50);
    return () => clearTimeout(timer);
  }, [isPrinting]);

  useEffect(() => {
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
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

    // Category filter — matches resolved veg/non-veg pick for the day
    let categoryMatch = true;
    if (filterCriteria.category && filterCriteria.category !== 'All') {
      categoryMatch = meal.dietaryPreference === filterCriteria.category;
    }

    return searchMatch && planMatch && mealCountMatch && categoryMatch;
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
    } else if (sortConfig.key === 'plan') {
      aValue = (a.plan || '').toLowerCase();
      bValue = (b.plan || '').toLowerCase();
    } else if (sortConfig.key === 'category') {
      aValue = (a.dietaryPreference || '').toLowerCase();
      bValue = (b.dietaryPreference || '').toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginated slice (printing bypasses paging and shows every filtered row)
  const paginatedMeals = isPrinting
    ? sortedMeals
    : sortedMeals.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );

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

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  // end date only exists once a plan stops delivering — updatedAt is when that happened
  const getSubscriptionEndLabel = (sub) => {
    if (sub.status === 'completed' || sub.status === 'cancelled') {
      return sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : '—';
    }
    if (sub.status === 'active') return 'Ongoing';
    return 'Not started';
  };

  // "Both" plans don't say what to actually pack — show the resolved pick for
  // this specific date instead, with a note that the plan itself is flexible.
  const formatDietLabel = (meal) => {
    if (meal?.mealType === "both") {
      return `${capitalize(meal.dietaryPreference)} (Flexible plan)`;
    }
    return capitalize(meal?.mealType);
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
        setCurrentPage(1);
      } else {
        setError("Received unexpected data format from server.");
        setMealDeliveryList([]);
        setCurrentPage(1);
      }
    } catch (error) {
      setError(`Failed to fetch meal deliver list: ${error.response?.data?.message || error.message}`);
      setMealDeliveryList([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCriteria({ planType: 'All', mealCount: '', operator: '>', category: 'All' });
    setCurrentPage(1);
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
      formatDietLabel(meal),
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
    setShowExportMenu(false);
  };

  // Summary counts over the filtered set — mirrors the stat-row pattern used
  // across the other redesigned admin pages.
  const summary = filteredMeals.reduce(
    (acc, meal) => {
      const lunchCount = (meal.lunchMeals || 0) + (meal.nextDayLunchMeals || 0);
      const dinnerCount = (meal.dinnerMeals || 0) + (meal.nextDayDinnerMeals || 0);
      const pref = meal.dietaryPreference || meal.mealType;
      if (pref === "veg") acc.veg += 1;
      else if (pref === "non-veg") acc.nonVeg += 1;
      if (lunchCount === 0 && dinnerCount === 0) acc.zeroMeals += 1;
      return acc;
    },
    { veg: 0, nonVeg: 0, zeroMeals: 0 }
  );

  return (
    <>
      <DashboardLayoutComponent>
        <div className="p-4 w-full text-left sm:p-6 md:p-8">
          <div className="mx-auto space-y-6 w-full">
            <div className="flex flex-wrap gap-3 justify-between items-start print:hidden">
              <div>
                <p className="text-sm text-gray-500">Dashboard &rsaquo; Meal Delivery List</p>
                <h2 className="text-2xl font-bold text-gray-900">Meal Delivery List</h2>
                <p className="text-sm text-gray-500">
                  Pick a date and meal type to see exactly who's getting delivered to, and what to pack.
                </p>
              </div>
              {mealDeliveryList.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu((v) => !v)}
                    className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                  >
                    <Download className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 z-20 mt-2 w-44 bg-white rounded-lg border border-gray-200 shadow-lg">
                      <button type="button" onClick={exportToCSV} className="flex gap-2 items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowExportMenu(false); setIsPrinting(true); }}
                        className="flex gap-2 items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-50"
                      >
                        <Printer className="w-4 h-4" />
                        Print / PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 items-end sm:flex-row">
                <div className="flex-1 w-full">
                  <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    min={getCurrentDate()}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Meal Type</label>
                  <Input
                    type="select"
                    value={formData.mealType}
                    onChange={handleMealTypeChange}
                    placeholder="Select Meal Type"
                    options={[
                      { value: "lunch", label: "Lunch" },
                      { value: "dinner", label: "Dinner" },
                    ]}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 w-full text-sm font-semibold text-white rounded-lg shadow-sm bg-theme-color-1 hover:bg-black disabled:opacity-50 sm:w-auto whitespace-nowrap"
                >
                  {isLoading ? "Loading..." : "Load List"}
                </button>
              </form>
            </div>

            {/* Screen-only title + filter context, since the toolbar above is hidden when printing */}
            <h2 className="hidden mb-2 text-xl font-bold text-left print:block">Meal Delivery List</h2>
            <p className="hidden mb-3 text-sm text-left text-gray-500 print:block">
              {formData.date && `Date: ${formData.date} `}
              {formData.mealType && `Meal Type: ${capitalize(formData.mealType)} `}
              {searchQuery && `Search: "${searchQuery}" `}
              {filterCriteria.category !== 'All' && `Category: ${filterCriteria.category} `}
              {filterCriteria.planType !== 'All' && `Plan: ${filterCriteria.planType}`}
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {isLoading && (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
                <p className="mt-4 font-medium text-gray-500">Loading delivery list...</p>
              </div>
            )}

            {!isLoading && mealDeliveryList.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
                  <StatTile icon={Users} tone="bg-blue-50 text-blue-600" label="Total Customers" value={filteredMeals.length} />
                  <StatTile icon={Leaf} tone="bg-green-50 text-theme-color-1" label="Veg" value={summary.veg} />
                  <StatTile icon={Beef} tone="bg-orange-50 text-orange-600" label="Non-Veg" value={summary.nonVeg} />
                  <StatTile icon={AlertTriangle} tone="bg-red-100 text-red-600" label="Zero Meals Left" value={summary.zeroMeals} highlight={summary.zeroMeals > 0} />
                </div>

                <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
                  <div className="flex flex-col gap-3 items-end sm:flex-row sm:flex-wrap">
                    <div className="flex-1 min-w-[200px] w-full sm:w-auto">
                      <SearchBar
                        value={searchQuery}
                        onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                        placeholder="Search name or email..."
                      />
                    </div>
                    <Input
                      type="select"
                      value={filterCriteria.category || 'All'}
                      onChange={(e) => { setFilterCriteria((prev) => ({ ...prev, category: e.target.value })); setCurrentPage(1); }}
                      options={[
                        { value: 'All', label: 'All Meal Types' },
                        { value: 'veg', label: 'Veg' },
                        { value: 'non-veg', label: 'Non-Veg' },
                      ]}
                      classes={inputClass}
                    />
                    <Input
                      type="select"
                      value={filterCriteria.planType}
                      onChange={(e) => { setFilterCriteria((prev) => ({ ...prev, planType: e.target.value })); setCurrentPage(1); }}
                      options={[
                        { value: 'All', label: 'All Plans' },
                        { value: 'Trial', label: 'Trial Pack' },
                        { value: 'Weekly', label: 'Weekly Plan' },
                        { value: 'Monthly', label: 'Monthly Plan' },
                      ]}
                      classes={inputClass}
                    />
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilterPopup(true)}
                      type="button"
                      className="flex gap-2 items-center px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 shadow-sm transition-colors duration-300 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white whitespace-nowrap"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Meal Count Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                  {sortedMeals.length > 0 ? (
                    <div className="w-full">
                      {/* Desktop View */}
                      <div className="hidden overflow-x-auto md:block print:block">
                        <table className="w-full text-left divide-y divide-gray-200">
                          <thead className="bg-gray-50 print:static">
                            <tr>
                              <th
                                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase cursor-pointer min-w-[200px] hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                              >
                                Customer Info <SortIcon columnKey="name" />
                              </th>
                              <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase min-w-[120px]">
                                Mobile
                              </th>
                              <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase min-w-[200px]">
                                Address
                              </th>
                              <th
                                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase cursor-pointer min-w-[150px] hover:bg-gray-100"
                                onClick={() => handleSort('category')}
                              >
                                Meal Type <SortIcon columnKey="category" />
                              </th>
                              <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase min-w-[150px]">
                                Carb Type
                              </th>
                              <th
                                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase cursor-pointer min-w-[150px] hover:bg-gray-100"
                                onClick={() => handleSort('plan')}
                              >
                                Selected Plan <SortIcon columnKey="plan" />
                              </th>
                              <th
                                className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase cursor-pointer min-w-[150px] hover:bg-gray-100"
                                onClick={() => handleSort('mealCount')}
                              >
                                Meal Counts Left <SortIcon columnKey="mealCount" />
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {paginatedMeals.map((meal, index) => {
                              const lunchCount = (meal.lunchMeals || 0) + (meal.nextDayLunchMeals || 0);
                              const dinnerCount = (meal.dinnerMeals || 0) + (meal.nextDayDinnerMeals || 0);
                              const isZeroMeals = lunchCount === 0 && dinnerCount === 0;

                              return (
                                <tr key={index} className={`hover:bg-gray-50 ${isZeroMeals ? 'bg-red-50' : 'bg-white'}`}>
                                  <td className="px-4 py-4 text-sm font-medium max-w-[250px]">
                                    <div
                                      className="font-bold break-words cursor-pointer text-theme-color-1 hover:underline"
                                      onClick={() => fetchUserDetails(meal.userId)}
                                    >
                                      {meal.name}
                                    </div>
                                    <div className="text-xs text-gray-500 break-all">{meal.email}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="break-words">{meal.mobile}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="break-words">{meal.address}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="flex items-center break-words">
                                      {formatDietLabel(meal)}
                                      <VegNonVegIcon value={meal.dietaryPreference || meal.mealType} className="ml-2" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="break-words">
                                      {meal?.carbType?.charAt(0).toUpperCase() + meal?.carbType?.slice(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="break-words">
                                      {meal?.plan}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="break-words">
                                      Lunch: {lunchCount},<br/>
                                      Dinner: {dinnerCount}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="p-4 space-y-4 md:hidden print:hidden">
                        {paginatedMeals.map((meal, index) => {
                          const lunchCount = (meal.lunchMeals || 0) + (meal.nextDayLunchMeals || 0);
                          const dinnerCount = (meal.dinnerMeals || 0) + (meal.nextDayDinnerMeals || 0);
                          const isZeroMeals = lunchCount === 0 && dinnerCount === 0;

                          return (
                            <div key={index} className={`p-4 rounded-xl border border-gray-100 shadow-sm ${isZeroMeals ? 'bg-red-50' : 'bg-white'}`}>
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
                                  <span className="flex items-center text-gray-900 text-right break-words max-w-[60%]">
                                    {formatDietLabel(meal)}
                                    <VegNonVegIcon value={meal.dietaryPreference || meal.mealType} className="ml-2" />
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
                                    Lunch: {lunchCount}, Dinner: {dinnerCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      <div className="p-4 border-t border-gray-100 print:hidden">
                        <Pagination
                          totalItems={sortedMeals.length}
                          currentPage={currentPage}
                          rowsPerPage={rowsPerPage}
                          onPageChange={setCurrentPage}
                          onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="py-10 text-center text-gray-500">No meal delivery data matches these filters.</p>
                  )}
                </div>
              </>
            )}

            {!isLoading && mealDeliveryList.length === 0 && !error && (
              <p className="py-10 text-center text-gray-500">Pick a date and meal type, then load the list.</p>
            )}
          </div>
        </div>
      </DashboardLayoutComponent>

      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        criteria={filterCriteria}
        setCriteria={(val) => { setFilterCriteria(val); setCurrentPage(1); }}
        title="Filter Meal Delivery"
        showEndDateFilter={false}
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
                    <p className="flex gap-1.5 items-center text-gray-500"><Mail className="w-3.5 h-3.5" />Email</p>
                    <p className="font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="flex gap-1.5 items-center text-gray-500"><Phone className="w-3.5 h-3.5" />Mobile</p>
                    <p className="font-semibold">{selectedUser.mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="flex gap-1.5 items-center text-gray-500"><MapPin className="w-3.5 h-3.5" />Address</p>
                    <p className="font-semibold">{selectedUser.postalAddress}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 mb-4 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <p className="text-gray-500">Meal Counts Left</p>
                    <p className="text-lg font-bold text-theme-color-1">
                      Lunch: {(selectedUser.mealCounts?.lunchMeals || 0) + (selectedUser.mealCounts?.nextDayLunchMeals || 0)},
                      Dinner: {(selectedUser.mealCounts?.dinnerMeals || 0) + (selectedUser.mealCounts?.nextDayDinnerMeals || 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="flex gap-1.5 items-center mb-2 text-base font-bold text-gray-900">
                    <History className="w-4 h-4" />
                    Subscription History
                  </h3>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                      [...selectedUser.subscriptions].reverse().map((sub, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex gap-1.5 justify-between items-center font-bold text-theme-color-1">
                            <span className="flex gap-1.5 items-center"><CreditCard className="w-4 h-4" />{sub.plan}</span>
                            <span>₹{sub.price}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div><span className="text-gray-500">Status:</span> <span className={`${sub.status === 'Active' ? 'text-green-600' : 'text-gray-600'} font-bold`}>{sub.status}</span></div>
                            <div><span className="text-gray-500">Start Date:</span> {new Date(sub.subscriptionStartDate).toLocaleDateString()}</div>
                            <div><span className="text-gray-500">End Date:</span> {getSubscriptionEndLabel(sub)}</div>
                            <div className="flex items-center"><span className="text-gray-500">Meals:</span>&nbsp;{sub.mealType?.charAt(0).toUpperCase() + sub.mealType?.slice(1)}<VegNonVegIcon value={sub.mealType} className="ml-2" /></div>
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
