import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import Pagination from "../../../components/common/Pagination/Pagination";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { useUserMealTracking } from "./useUserMealTracking";
import { ACTIVITY_CATEGORY_LABELS } from "../../../activityCategories";
import { calculateSubEndDate, holidayDateKeysFrom } from "../../../subscriptionUtils";
import {
  CalendarDays,
  Download,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Percent,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Utensils,
  CreditCard,
  History,
  ArrowRight,
  X,
  Leaf,
  Beef,
  Wheat,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react";

const TABS = [
  { key: "history", label: "Meal History" },
  { key: "calendar", label: "Calendar View" },
  { key: "subscription", label: "Subscription Details" },
  { key: "holidays", label: "Holidays" },
  { key: "customisation", label: "Customisation" },
];

const STATUS_FILTER_OPTIONS = ["All", "Delivered", "Meal Updated", "Cancelled", "Subscribed", "Holiday", "Diet Updated", "Customisation", "Profile Updated", "Account", "Other"];

const USER_STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  Queued: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-gray-100 text-gray-700",
  "No Plan": "bg-gray-100 text-gray-500",
};

const SUB_STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  queued: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
};

const MEAL_TYPE_LABELS = { veg: "Veg", "non-veg": "Non-Veg", both: "Both (Flexible)" };

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const getLatestSub = (user) => (user?.subscriptions?.length ? user.subscriptions[user.subscriptions.length - 1] : null);

const getUserStatus = (user) => {
  const subs = user?.subscriptions || [];
  if (subs.some((s) => s.status === "active")) return "Active";
  if (subs.some((s) => s.status === "queued")) return "Queued";
  const latest = getLatestSub(user);
  if (latest?.status === "cancelled") return "Cancelled";
  if (latest?.status === "completed") return "Completed";
  return "No Plan";
};

const getSubscriptionEndLabel = (sub) => {
  if (sub.status === "completed" || sub.status === "cancelled") {
    return sub.updatedAt ? formatDisplayDate(sub.updatedAt) : "—";
  }
  if (sub.status === "active") return "Ongoing";
  return "Not started";
};

const capitalizeWords = (value) =>
  value ? value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-") : "—";

const dateKey = (value) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function formatDisplayDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "N/A";
}

const mealOf = (description = "") => {
  if (/lunch/i.test(description)) return "Lunch";
  if (/dinner/i.test(description)) return "Dinner";
  return "—";
};

const getRecordStatus = (record) => {
  const category = record.category || "other";
  if (category === "meal_count") {
    return /delivered on/i.test(record.description)
      ? { label: "Delivered", style: "bg-green-100 text-green-700" }
      : { label: "Meal Updated", style: "bg-teal-100 text-teal-700" };
  }
  if (category === "cancellation") return { label: "Cancelled", style: "bg-red-100 text-red-700" };
  if (category === "subscription") return { label: "Subscribed", style: "bg-blue-100 text-blue-700" };
  if (category === "holiday") return { label: "Holiday", style: "bg-purple-100 text-purple-700" };
  if (category === "diet") return { label: "Diet Updated", style: "bg-amber-100 text-amber-700" };
  if (category === "customisation") return { label: "Customisation", style: "bg-indigo-100 text-indigo-700" };
  if (category === "profile") return { label: "Profile Updated", style: "bg-gray-100 text-gray-700" };
  if (category === "account") return { label: "Account", style: "bg-blue-100 text-blue-700" };
  return { label: "Other", style: "bg-gray-100 text-gray-500" };
};

const SubscriptionField = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 items-center">
    <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
    <span className="w-28 text-sm text-gray-500 flex-shrink-0">{label}</span>
    <div className="text-sm font-semibold text-gray-900">{children}</div>
  </div>
);

const StatTile = ({ icon: Icon, tone, label, value }) => (
  <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`flex justify-center items-center w-8 h-8 rounded-lg ${tone}`}>
      <Icon className="w-4 h-4" />
    </div>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex gap-3 items-center p-3 text-left bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100"
  >
    <Icon className="w-4 h-4 text-theme-color-1" />
    <span className="text-sm font-semibold text-gray-900">{label}</span>
  </button>
);

const InfoRow = ({ label, children }) => (
  <div className="flex gap-3 justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-right text-gray-900">{children}</span>
  </div>
);

const DietChip = ({ icon: Icon, label, tone }) => (
  <span className={`flex gap-1.5 items-center px-3 py-1.5 text-xs font-semibold rounded-full ${tone}`}>
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

export const UserMealTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchName, setSearchName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("history");
  const [historyFilters, setHistoryFilters] = useState({ startDate: "", endDate: "", mealType: "All", status: "All" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const {
    activityRecords,
    userDetail,
    isLoading,
    error,
    searchUserMealTracking,
    filterUsers,
    allUsers,
    isFetchingUsers,
    holidays,
    cancelQueuedPlan,
    resetSearch,
  } = useUserMealTracking();

  const holidayDateKeys = useMemo(() => holidayDateKeysFrom(holidays), [holidays]);

  const userSuggestions = useMemo(() => filterUsers(debouncedSearchTerm), [debouncedSearchTerm, allUsers]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setShowSuggestions(value.trim().length >= 2);
    }, 300);
  };

  const handleSuggestionClick = (user) => {
    setSearchName(`${user.firstName} ${user.lastName}`);
    setShowSuggestions(false);
    setActiveTab("history");
    setCurrentPage(1);
    setHistoryFilters({ startDate: "", endDate: "", mealType: "All", status: "All" });
    searchUserMealTracking(user._id);
  };

  useEffect(() => {
    if (location.state?.user) handleSuggestionClick(location.state.user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setSearchName("");
    setShowSuggestions(false);
    setDebouncedSearchTerm("");
    setHistoryFilters({ startDate: "", endDate: "", mealType: "All", status: "All" });
    setCurrentPage(1);
    resetSearch();
  };

  const handleCancelQueuedPlan = async (subId) => {
    if (!window.confirm("Cancel this queued plan?")) return;
    try {
      await cancelQueuedPlan(subId);
      toast.success("Queued plan cancelled.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel queued plan.");
    }
  };

  const latestSub = getLatestSub(userDetail);
  const userStatus = userDetail ? getUserStatus(userDetail) : null;
  const subEnd = userDetail ? calculateSubEndDate(userDetail, holidayDateKeys) : null;
  const initials = userDetail ? `${userDetail.firstName?.[0] || ""}${userDetail.lastName?.[0] || ""}`.toUpperCase() : "";

  const now = new Date();
  const monthRecords = activityRecords.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const deliveredCount = monthRecords.filter((r) => r.category === "meal_count" && /delivered on/i.test(r.description)).length;
  const cancelledCount = monthRecords.filter((r) => r.category === "cancellation").length;
  const holidaysCount = monthRecords.filter((r) => r.category === "holiday").length;

  // Completion % is plan progress, not a monthly ratio — meals actually
  // delivered since this subscription started, out of what it was bought for.
  const planDeliveredCount = latestSub
    ? activityRecords.filter((r) => {
        if (r.category !== "meal_count" || !/delivered on/i.test(r.description)) return false;
        return new Date(r.date) >= new Date(latestSub.subscriptionStartDate);
      }).length
    : 0;
  const completionRate =
    latestSub?.totalMeals > 0 ? Math.round((planDeliveredCount / latestSub.totalMeals) * 100) : null;

  const nextDelivery = (() => {
    const mc = userDetail?.mealCounts;
    if (!mc) return null;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (mc.lunchMeals > 0) return { meal: "Lunch", date: today };
    if (mc.dinnerMeals > 0) return { meal: "Dinner", date: today };
    if (mc.nextDayLunchMeals > 0) return { meal: "Lunch", date: tomorrow };
    if (mc.nextDayDinnerMeals > 0) return { meal: "Dinner", date: tomorrow };
    return null;
  })();

  const filteredHistory = activityRecords
    .filter((record) => {
      const key = dateKey(record.date);
      if (historyFilters.startDate && key < historyFilters.startDate) return false;
      if (historyFilters.endDate && key > historyFilters.endDate) return false;
      if (historyFilters.mealType !== "All" && mealOf(record.description) !== historyFilters.mealType) return false;
      if (historyFilters.status !== "All" && getRecordStatus(record).label !== historyFilters.status) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const paginatedHistory = isPrinting
    ? filteredHistory
    : filteredHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportHistoryCSV = () => {
    const headers = ["Date", "Meal", "Description", "Status", "Type"];
    const rows = filteredHistory.map((r) => [
      formatDisplayDate(r.date),
      mealOf(r.description),
      r.description,
      getRecordStatus(r).label,
      ACTIVITY_CATEGORY_LABELS[r.category || "other"],
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `meal-history-${userDetail?._id || "user"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const monthMatrix = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calendarMonth]);

  const recordsByDate = useMemo(() => {
    const map = {};
    activityRecords.forEach((r) => {
      const key = dateKey(r.date);
      (map[key] = map[key] || []).push(r);
    });
    return map;
  }, [activityRecords]);

  const customisationRecords = activityRecords.filter((r) => r.category === "customisation");

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto w-full space-y-6">
          <div className="flex flex-wrap gap-3 justify-between items-start print:hidden">
            <div>
              <p className="text-sm text-gray-500">Dashboard &rsaquo; User Meal Tracking</p>
              <h2 className="text-2xl font-bold text-gray-900">User Meal Tracking</h2>
              <p className="text-sm text-gray-500">
                Track each user's meal history, deliveries, cancellations, holidays and subscription activity.
              </p>
            </div>
            {userDetail && (
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
                    <button type="button" onClick={exportHistoryCSV} className="flex gap-2 items-center px-4 py-2 w-full text-sm text-left hover:bg-gray-50">
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
            <div className="flex flex-col gap-4 items-end sm:flex-row">
              <div className="flex-1 relative w-full">
                <div ref={inputRef}>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Search User</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchName}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchName.trim().length >= 2 && userSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>
                {showSuggestions && searchName.trim().length >= 2 && (
                  <div
                    ref={suggestionsRef}
                    className="overflow-y-auto absolute z-50 mt-1 w-full max-h-80 bg-white rounded-lg border border-gray-300 shadow-xl"
                  >
                    {isFetchingUsers ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Loading users...</div>
                    ) : userSuggestions.length > 0 ? (
                      <ul>
                        {userSuggestions.map((user) => (
                          <li
                            key={user._id}
                            onClick={() => handleSuggestionClick(user)}
                            className="px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                          >
                            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No users found</div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {isLoading && <p className="py-10 text-center text-gray-500">Loading meal tracking...</p>}

          {!isLoading && userDetail && (
            <>
              <div className="grid grid-cols-1 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm lg:grid-cols-3">
                <div className="flex gap-4 items-center">
                  <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 text-xl font-bold text-green-800 bg-green-100 rounded-full">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="text-lg font-bold text-gray-900">{userDetail.firstName} {userDetail.lastName}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${USER_STATUS_STYLES[userStatus]}`}>{userStatus}</span>
                    </div>
                    <p className="flex gap-1.5 items-center text-sm text-gray-500 truncate"><Mail className="w-3.5 h-3.5 flex-shrink-0" />{userDetail.email || "No email on file"}</p>
                    <p className="flex gap-1.5 items-center text-sm text-gray-500"><Phone className="w-3.5 h-3.5 flex-shrink-0" />{userDetail.mobile || "No mobile on file"}</p>
                    <p className="flex gap-1.5 items-center text-sm text-gray-500 truncate"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{userDetail.postalAddress || "No address on file"}</p>
                    <p className="flex gap-1.5 items-center text-xs text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                      Member since {formatDisplayDate(userDetail.createdAt)} · {latestSub?.plan || "No plan"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <StatTile icon={Utensils} tone="bg-green-50 text-theme-color-1" label="Delivered" value={deliveredCount} />
                  <StatTile icon={X} tone="bg-red-50 text-red-600" label="Cancelled" value={cancelledCount} />
                  <StatTile icon={CalendarDays} tone="bg-purple-50 text-purple-600" label="Holidays" value={holidaysCount} />
                  <StatTile icon={Percent} tone="bg-blue-50 text-blue-600" label="Plan Completion" value={completionRate === null ? "—" : `${completionRate}%`} />
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-semibold tracking-wide text-theme-color-1 uppercase">Next Delivery</p>
                  {nextDelivery ? (
                    <>
                      <p className="text-lg font-bold text-gray-900">{nextDelivery.meal}</p>
                      <p className="text-sm text-gray-600">{formatDisplayDate(nextDelivery.date)}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-600">No upcoming delivery</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 rounded-xl print:hidden">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-colors ${
                          activeTab === tab.key ? "bg-white text-theme-color-1 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {activeTab === "history" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
                          <input
                            type="date"
                            value={historyFilters.startDate}
                            onChange={(e) => { setHistoryFilters((p) => ({ ...p, startDate: e.target.value })); setCurrentPage(1); }}
                            className={inputClass}
                          />
                          <input
                            type="date"
                            value={historyFilters.endDate}
                            onChange={(e) => { setHistoryFilters((p) => ({ ...p, endDate: e.target.value })); setCurrentPage(1); }}
                            className={inputClass}
                          />
                          <select
                            value={historyFilters.mealType}
                            onChange={(e) => { setHistoryFilters((p) => ({ ...p, mealType: e.target.value })); setCurrentPage(1); }}
                            className={inputClass}
                          >
                            <option value="All">All Meal Types</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                          </select>
                          <select
                            value={historyFilters.status}
                            onChange={(e) => { setHistoryFilters((p) => ({ ...p, status: e.target.value })); setCurrentPage(1); }}
                            className={inputClass}
                          >
                            {STATUS_FILTER_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => { setHistoryFilters({ startDate: "", endDate: "", mealType: "All", status: "All" }); setCurrentPage(1); }}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Reset Filters
                          </button>
                        </div>

                        {paginatedHistory.length > 0 ? (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    {["Date", "Meal", "Description", "Status", "Type"].map((h) => (
                                      <th key={h} className="px-3 py-2 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {paginatedHistory.map((record, i) => {
                                    const meal = mealOf(record.description);
                                    const status = getRecordStatus(record);
                                    return (
                                      <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDisplayDate(record.date)}</td>
                                        <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                                          {meal === "Lunch" && <Sun className="inline-block mr-1 w-4 h-4 text-amber-500" />}
                                          {meal === "Dinner" && <Moon className="inline-block mr-1 w-4 h-4 text-indigo-500" />}
                                          {meal}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-700">{record.description}</td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.style}`}>{status.label}</span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{ACTIVITY_CATEGORY_LABELS[record.category || "other"]}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <div className="print:hidden">
                              <Pagination
                                totalItems={filteredHistory.length}
                                currentPage={currentPage}
                                rowsPerPage={rowsPerPage}
                                onPageChange={setCurrentPage}
                                onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="py-10 text-center text-gray-500">No meal tracking activity found for this filter.</p>
                        )}
                      </div>
                    )}

                    {activeTab === "calendar" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <button type="button" onClick={() => setCalendarMonth((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <p className="font-bold text-gray-900">{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
                          <button type="button" onClick={() => setCalendarMonth((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-center text-gray-500">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {monthMatrix.map((date, i) => {
                            if (!date) return <div key={i} />;
                            const key = dateKey(date);
                            const records = recordsByDate[key] || [];
                            const delivered = records.some((r) => r.category === "meal_count" && /delivered on/i.test(r.description));
                            const cancelled = records.some((r) => r.category === "cancellation");
                            const holiday = records.some((r) => r.category === "holiday");
                            const isToday = key === dateKey(new Date());
                            return (
                              <div key={i} className={`p-2 h-16 rounded-lg border text-left ${isToday ? "border-theme-color-1" : "border-gray-100"}`}>
                                <p className="text-xs font-semibold text-gray-700">{date.getDate()}</p>
                                <div className="flex gap-1 mt-1">
                                  {delivered && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Delivered" />}
                                  {cancelled && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Cancelled" />}
                                  {holiday && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" title="Holiday" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex gap-1.5 items-center"><span className="w-2 h-2 bg-green-500 rounded-full" />Delivered</span>
                          <span className="flex gap-1.5 items-center"><span className="w-2 h-2 bg-red-500 rounded-full" />Cancelled</span>
                          <span className="flex gap-1.5 items-center"><span className="w-2 h-2 bg-purple-500 rounded-full" />Holiday</span>
                        </div>
                      </div>
                    )}

                    {activeTab === "subscription" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 sm:grid-cols-2">
                          <SubscriptionField icon={CreditCard} label="Plan">{latestSub?.plan || "No active plan"}</SubscriptionField>
                          <SubscriptionField icon={CalendarDays} label="Est. End Date">{subEnd?.formattedDate || subEnd?.status}</SubscriptionField>
                          <SubscriptionField icon={History} label="Status">
                            {latestSub ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${SUB_STATUS_STYLES[latestSub.status] || "bg-gray-100 text-gray-700"}`}>
                                {latestSub.status.charAt(0).toUpperCase() + latestSub.status.slice(1)}
                              </span>
                            ) : "—"}
                          </SubscriptionField>
                          <SubscriptionField icon={Utensils} label="Diet">
                            {latestSub ? (
                              <span className="flex gap-2 items-center">
                                {MEAL_TYPE_LABELS[latestSub.mealType] || latestSub.mealType}
                                <VegNonVegIcon value={latestSub.mealType} />
                              </span>
                            ) : "—"}
                          </SubscriptionField>
                          <SubscriptionField icon={CalendarDays} label="Start Date">
                            {latestSub?.subscriptionStartDate ? formatDisplayDate(latestSub.subscriptionStartDate) : "N/A"}
                          </SubscriptionField>
                          <SubscriptionField icon={Wheat} label="Carb Type">{capitalizeWords(latestSub?.carbType)}</SubscriptionField>
                          <SubscriptionField icon={AlertTriangle} label="Allergy">{latestSub?.allergy || "None"}</SubscriptionField>
                        </div>

                        <div>
                          <p className="mb-2 text-base font-bold text-gray-900">Subscription History</p>
                          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {userDetail.subscriptions && userDetail.subscriptions.length > 0 ? (
                              [...userDetail.subscriptions].reverse().map((sub) => (
                                <div key={sub._id} className="p-3 bg-white rounded-lg border shadow-sm">
                                  <div className="flex justify-between items-center font-bold text-theme-color-1">
                                    <span>{sub.plan}</span>
                                    {sub.status === "queued" && (
                                      <button
                                        type="button"
                                        onClick={() => handleCancelQueuedPlan(sub._id)}
                                        className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
                                      >
                                        Cancel Queued Plan
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Status:</span>{" "}
                                      <span className={`font-bold ${SUB_STATUS_STYLES[sub.status]?.split(" ")[1] || "text-gray-600"}`}>
                                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                      </span>
                                    </div>
                                    <div><span className="text-gray-500">Start Date:</span> {formatDisplayDate(sub.subscriptionStartDate)}</div>
                                    <div><span className="text-gray-500">End Date:</span> {getSubscriptionEndLabel(sub)}</div>
                                    <div><span className="text-gray-500">Carbs:</span> {capitalizeWords(sub.carbType)}</div>
                                    {sub.allergy && (
                                      <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="font-bold text-red-500">{sub.allergy}</span></div>
                                    )}
                                    <div><span className="text-gray-500">Remaining L:</span> {sub.lunchMeals} (Today) + {sub.nextDayLunchMeals} (Next)</div>
                                    <div><span className="text-gray-500">Remaining D:</span> {sub.dinnerMeals} (Today) + {sub.nextDayDinnerMeals} (Next)</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="py-4 text-center text-gray-500">No subscription history found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "holidays" && (
                      <div className="space-y-3">
                        {holidays.length === 0 ? (
                          <p className="py-10 text-center text-gray-500">No holidays recorded.</p>
                        ) : (
                          [...holidays]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((h) => {
                              const upcoming = dateKey(h.date) >= dateKey(new Date());
                              return (
                                <div key={h._id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                  <div>
                                    <p className="font-semibold text-gray-900">{h.description}</p>
                                    <p className="text-xs text-gray-500">{formatDisplayDate(h.date)}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${upcoming ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {upcoming ? "Upcoming" : "Past"}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}

                    {activeTab === "customisation" && (
                      <div className="space-y-3">
                        {customisationRecords.length === 0 ? (
                          <p className="py-10 text-center text-gray-500">No customisation requests found.</p>
                        ) : (
                          customisationRecords.map((r, i) => (
                            <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-sm font-semibold text-gray-900">{formatDisplayDate(r.date)}</p>
                              <p className="text-sm text-gray-700">{r.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <aside className="space-y-4 print:hidden">
                  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="mb-3 text-base font-bold text-gray-900">Quick Actions</p>
                    <div className="grid grid-cols-1 gap-2">
                      <QuickAction icon={CalendarPlus} label="Add Holiday" onClick={() => navigate("/dashboard/add-holiday")} />
                      <QuickAction icon={X} label="View Cancellations" onClick={() => navigate("/dashboard/user-cancel-request-list")} />
                      <QuickAction icon={Pencil} label="Edit Plan" onClick={() => navigate("/dashboard/manage-subscriptions")} />
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-base font-bold text-gray-900">Subscription Info</p>
                      <button type="button" onClick={() => setActiveTab("subscription")} className="flex gap-1 items-center text-xs font-semibold text-theme-color-1 hover:underline">
                        View Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <InfoRow label="Plan Name">{latestSub?.plan || "—"}</InfoRow>
                      <InfoRow label="Start Date">{latestSub?.subscriptionStartDate ? formatDisplayDate(latestSub.subscriptionStartDate) : "N/A"}</InfoRow>
                      <InfoRow label="Est. End Date">{subEnd?.formattedDate || subEnd?.status || "—"}</InfoRow>
                      <InfoRow label="Meals / Day">Lunch {userDetail.mealCounts.lunchMeals}, Dinner {userDetail.mealCounts.dinnerMeals}</InfoRow>
                      <InfoRow label="Status"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${USER_STATUS_STYLES[userStatus]}`}>{userStatus}</span></InfoRow>
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="mb-3 text-base font-bold text-gray-900">Dietary Preferences</p>
                    {latestSub ? (
                      <div className="flex flex-wrap gap-2">
                        <DietChip icon={latestSub.mealType === "veg" ? Leaf : Beef} label={MEAL_TYPE_LABELS[latestSub.mealType] || latestSub.mealType} tone="bg-green-50 text-green-700" />
                        <DietChip icon={Wheat} label={capitalizeWords(latestSub.carbType)} tone="bg-amber-50 text-amber-700" />
                        {latestSub.allergy && <DietChip icon={AlertTriangle} label={latestSub.allergy} tone="bg-red-50 text-red-700" />}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No active plan.</p>
                    )}
                  </div>

                  <div className="p-5 text-center bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-sm italic text-gray-600">"Good food fuels a better you."</p>
                    <p className="mt-1 text-xs text-gray-400">— MealPrep</p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {!isLoading && !userDetail && !error && (
            <p className="py-10 text-center text-gray-500">Search for a user by name or email to view their meal tracking.</p>
          )}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
