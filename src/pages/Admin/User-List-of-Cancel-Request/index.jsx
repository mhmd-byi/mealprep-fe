import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import Pagination from "../../../components/common/Pagination/Pagination";
import {
  CalendarDays,
  Search,
  Users,
  XCircle,
  UtensilsCrossed,
  Moon,
  Download,
  Printer,
  RotateCcw,
} from "lucide-react";

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const formatDateTime = (dateString) =>
  dateString ? new Date(dateString).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

const calculateDaysOff = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const generateCustomUserId = (name = "", mobile = "") => {
  const [firstName = "", lastName = ""] = name.split(" ");
  return `${firstName.slice(0, 4).toUpperCase()}${lastName.slice(0, 4).toUpperCase()}${(mobile || "").slice(0, 4)}`;
};

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
};

const ChangeBadge = ({ change, goodWhenUp }) => {
  if (change === null) return <p className="text-xs text-gray-500">New vs last week</p>;
  if (change === 0) return <p className="text-xs text-gray-500">No change from last week</p>;
  const up = change > 0;
  const good = up === goodWhenUp;
  return (
    <p className={`text-xs font-medium ${good ? "text-green-600" : "text-red-600"}`}>
      {up ? "↑" : "↓"} {Math.abs(change)}% from last week
    </p>
  );
};

export const UserListWithCancelRequest = () => {
  const [cancelledMeals, setCancelledMeals] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey());
  const [mealTypeFilter, setMealTypeFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPrinting, setIsPrinting] = useState(false);
  const [previousWeekMeals, setPreviousWeekMeals] = useState([]);

  // Printing should include every filtered row, not just the current page.
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

  const shiftDate = (dateKey, days) => {
    const date = new Date(`${dateKey}T00:00:00`);
    date.setDate(date.getDate() + days);
    return getLocalDateKey(date);
  };

  const requestCancelledMeals = async (date) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/cancelled-meals?date=${date}`,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      if (err.response?.status === 404) return [];
      throw err;
    }
  };

  const fetchCancelledMeals = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      const [current, previous] = await Promise.all([
        requestCancelledMeals(date),
        requestCancelledMeals(shiftDate(date, -7)),
      ]);
      setCancelledMeals(current);
      setPreviousWeekMeals(previous);
    } catch (err) {
      setCancelledMeals([]);
      setPreviousWeekMeals([]);
      setError(`Failed to fetch cancelled meals: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchCancelledMeals(selectedDate);
  }, []);

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value || value < getLocalDateKey()) return;
    if (new Date(`${value}T00:00:00`).getDay() === 0) {
      alert("Sundays are not allowed. Please select another date.");
      return;
    }
    setSelectedDate(value);
  };

  const handleApply = (e) => {
    e.preventDefault();
    fetchCancelledMeals(selectedDate);
  };

  const handleReset = () => {
    const today = getLocalDateKey();
    setSelectedDate(today);
    setMealTypeFilter("All");
    setUserFilter("All");
    setSearchQuery("");
    fetchCancelledMeals(today);
  };

  const userOptions = [...new Map(cancelledMeals.map((m) => [String(m.userId), m.name])).entries()];

  const matchesFilters = (meal) => {
    const mealMatch = mealTypeFilter === "All" || meal.mealType === mealTypeFilter || meal.mealType === "both";
    const userMatch = userFilter === "All" || String(meal.userId) === userFilter;
    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      meal.name.toLowerCase().includes(query) ||
      generateCustomUserId(meal.name, meal.mobile).toLowerCase().includes(query);
    return mealMatch && userMatch && searchMatch;
  };

  const filteredMeals = cancelledMeals.filter(matchesFilters);
  const previousFilteredMeals = previousWeekMeals.filter(matchesFilters);

  const total = filteredMeals.length;
  const uniqueUsers = new Set(filteredMeals.map((m) => String(m.userId))).size;
  const lunchCount = filteredMeals.filter((m) => m.mealType === "lunch" || m.mealType === "both").length;
  const dinnerCount = filteredMeals.filter((m) => m.mealType === "dinner" || m.mealType === "both").length;
  const sharePercent = (count) => (total ? Math.round((count / total) * 100) : 0);

  const previousTotal = previousFilteredMeals.length;
  const previousUniqueUsers = new Set(previousFilteredMeals.map((m) => String(m.userId))).size;

  const statCards = [
    {
      label: "Total Cancelled Requests",
      value: total,
      icon: XCircle,
      tone: "bg-red-50 text-red-600",
      change: percentChange(total, previousTotal),
      goodWhenUp: false,
    },
    {
      label: "Unique Users",
      value: uniqueUsers,
      icon: Users,
      tone: "bg-green-50 text-theme-color-1",
      change: percentChange(uniqueUsers, previousUniqueUsers),
      goodWhenUp: true,
    },
    { label: "Lunch Cancelled", value: lunchCount, icon: UtensilsCrossed, tone: "bg-blue-50 text-blue-600", share: sharePercent(lunchCount), bar: "bg-blue-500" },
    { label: "Dinner Cancelled", value: dinnerCount, icon: Moon, tone: "bg-purple-50 text-purple-600", share: sharePercent(dinnerCount), bar: "bg-purple-500" },
  ];

  const pageRows = isPrinting
    ? filteredMeals
    : filteredMeals.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportToCSV = () => {
    const headers = ["User Id", "Name", "Start Date", "End Date", "Days Off", "Meal Type", "Request Time"];
    const rows = filteredMeals.map((meal) => [
      generateCustomUserId(meal.name, meal.mobile),
      meal.name,
      formatDate(meal.startDate),
      formatDate(meal.endDate),
      calculateDaysOff(meal.startDate, meal.endDate),
      meal.mealType,
      formatDateTime(meal.createdAt),
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `cancelled-meals-${selectedDate || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto w-full space-y-6">
          <div className="print:hidden">
            <h2 className="text-2xl font-bold text-gray-900">Cancelled Meals</h2>
            <p className="text-sm text-gray-500">View and manage all cancelled meal requests</p>
          </div>

          <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
            <form onSubmit={handleApply} className="grid grid-cols-1 gap-3 items-center sm:grid-cols-2 xl:grid-cols-6">
              <div className="flex gap-2 items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  min={getLocalDateKey()}
                  onChange={handleDateChange}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
              <select value={mealTypeFilter} onChange={(e) => { setMealTypeFilter(e.target.value); setCurrentPage(1); }} className={inputClass}>
                <option value="All">All Meal Types</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }} className={inputClass}>
                <option value="All">All Users</option>
                {userOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <div className="sm:col-span-2 xl:col-span-2 flex gap-2 items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by name or user ID..."
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-60"
                >
                  {isLoading ? "Loading..." : "Apply"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex gap-1 items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className={`flex flex-shrink-0 justify-center items-center w-11 h-11 rounded-xl ${card.tone}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    {card.change !== undefined && <ChangeBadge change={card.change} goodWhenUp={card.goodWhenUp} />}
                    {card.bar && (
                      <>
                        <p className="text-xs text-gray-500">{card.share}% of total</p>
                        <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${card.bar}`} style={{ width: `${card.share}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Print-only context, since the controls above are hidden when printing */}
          <div className="hidden print:block">
            <h2 className="text-xl font-bold">Cancelled Meals</h2>
            <p className="text-sm text-gray-500">
              Date: {formatDate(selectedDate)}
              {mealTypeFilter !== "All" && ` | Meal Type: ${mealTypeFilter}`}
              {userFilter !== "All" && ` | User: ${userOptions.find(([id]) => id === userFilter)?.[1]}`}
            </p>
          </div>

          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col gap-3 justify-between p-5 border-b border-gray-100 sm:flex-row sm:items-center print:hidden">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancelled Meal Requests</h3>
                <p className="text-sm text-gray-500">A list of all cancelled meal requests within the selected period.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  disabled={filteredMeals.length === 0}
                  className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-white bg-theme-color-1 rounded-lg hover:bg-black disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setIsPrinting(true)}
                  disabled={filteredMeals.length === 0}
                  className="flex gap-2 items-center px-4 py-2 text-sm font-semibold bg-white rounded-lg border border-theme-color-1 text-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>
            </div>

            {error && <p className="px-5 pt-4 text-sm text-red-500">{error}</p>}

            {isLoading ? (
              <p className="py-10 text-center text-gray-500">Loading cancelled meals...</p>
            ) : filteredMeals.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block print:block">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["User ID", "Name", "Start Date", "End Date", "Days Off", "Meal Type", "Request Time", "Status"].map((header) => (
                          <th key={header} className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pageRows.map((meal, index) => (
                        <tr key={`${meal.userId}-${meal.startDate}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-mono text-sm text-gray-900 whitespace-nowrap">{generateCustomUserId(meal.name, meal.mobile)}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{meal.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(meal.startDate)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(meal.endDate)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{calculateDaysOff(meal.startDate, meal.endDate)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 capitalize whitespace-nowrap">{meal.mealType}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDateTime(meal.createdAt)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Cancelled</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 space-y-4 md:hidden print:hidden">
                  {pageRows.map((meal, index) => (
                    <div key={`${meal.userId}-${meal.startDate}-${index}`} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">{meal.name}</span>
                        <span className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Cancelled</span>
                      </div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">User ID</span><span className="font-mono">{generateCustomUserId(meal.name, meal.mobile)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Dates</span><span>{formatDate(meal.startDate)} – {formatDate(meal.endDate)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Days Off</span><span>{calculateDaysOff(meal.startDate, meal.endDate)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Meal Type</span><span className="capitalize">{meal.mealType}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Requested</span><span>{formatDateTime(meal.createdAt)}</span></div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 print:hidden">
                  <Pagination
                    totalItems={filteredMeals.length}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                  />
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-gray-500">
                {cancelledMeals.length > 0 ? "No requests match these filters." : "No cancelled meals found for this date."}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
