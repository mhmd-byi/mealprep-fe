import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useAllRegisteredUsers } from "./useAllRegisteredUsers";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";
import FilterPopup from "../../../components/common/FilterPopup/FilterPopup";
import Pagination from "../../../components/common/Pagination/Pagination";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  Pencil,
  Users,
  UserCheck,
  PauseCircle,
  UserPlus,
  RotateCcw,
  SlidersHorizontal,
  CreditCard,
  Clock,
  Package,
  Droplets,
  Sun,
  History,
  CalendarDays,
  Utensils,
} from "lucide-react";
import { calculateSubEndDate } from "../../../subscriptionUtils";

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  Queued: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-gray-100 text-gray-700",
  "No Plan": "bg-gray-100 text-gray-500",
};

const PLAN_STYLES = {
  Weekly: "bg-green-100 text-green-800",
  Monthly: "bg-blue-100 text-blue-800",
  Trial: "bg-amber-100 text-amber-800",
};

const getPlanStyle = (plan) => {
  const key = Object.keys(PLAN_STYLES).find((k) => plan?.includes(k));
  return key ? PLAN_STYLES[key] : "bg-gray-100 text-gray-600";
};

const getLatestSub = (user) =>
  user.subscriptions?.length ? user.subscriptions[user.subscriptions.length - 1] : null;

const getStatus = (user) => {
  const subs = user.subscriptions || [];
  if (subs.some((s) => s.status === "active")) return "Active";
  if (subs.some((s) => s.status === "queued")) return "Queued";
  const latest = getLatestSub(user);
  if (latest?.status === "cancelled") return "Cancelled";
  if (latest?.status === "completed") return "Completed";
  return "No Plan";
};

const isInactive = (status) => ["Cancelled", "Completed", "No Plan"].includes(status);

const STATUS_TABS = [
  { key: "all", label: "All Users", match: () => true },
  { key: "active", label: "Active", match: (u) => getStatus(u) === "Active" },
  { key: "queued", label: "Queued", match: (u) => getStatus(u) === "Queued" },
  { key: "inactive", label: "Cancelled / Inactive", match: (u) => isInactive(getStatus(u)) },
  { key: "trial", label: "Trial", match: (u) => Boolean(getLatestSub(u)?.plan?.includes("Trial")) },
];

const selectClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const outlineButtonClass =
  "flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white rounded-lg border shadow-sm transition-colors text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white";

const DetailRow = ({ label, children }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="font-semibold text-gray-900 break-words">{children}</div>
  </div>
);

const SubscriptionField = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 items-center">
    <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
    <span className="w-24 text-sm text-gray-500 flex-shrink-0">{label}</span>
    <div className="text-sm font-semibold text-gray-900">{children}</div>
  </div>
);

const DayBalanceCard = ({ icon: Icon, tone, label, lunch, dinner }) => (
  <div className="flex gap-4 items-center p-4 bg-white rounded-xl border border-gray-200">
    <div className={`flex flex-shrink-0 justify-center items-center w-11 h-11 rounded-full ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="w-20 font-bold text-gray-900">{label}</p>
    <div className="flex flex-1 divide-x divide-gray-200 text-center">
      <div className="flex-1 px-4">
        <p className="text-xs text-gray-500">Lunch</p>
        <p className="text-xl font-bold text-theme-color-1">{lunch}</p>
      </div>
      <div className="flex-1 px-4">
        <p className="text-xs text-gray-500">Dinner</p>
        <p className="text-xl font-bold text-orange-600">{dinner}</p>
      </div>
    </div>
  </div>
);

const MEAL_TYPE_LABELS = { veg: "Veg", "non-veg": "Non-Veg", both: "Both (Flexible)" };

const capitalizeWords = (value) =>
  value ? value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("-") : "—";

export const AllRegisteredUsers = () => {
  const navigate = useNavigate();
  const { allRegisteredUsers, isLoading, isBackgroundLoading, planFilter, downloadCSV, cancelQueuedPlan, holidayDateKeys } = useAllRegisteredUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showZeroMeals, setShowZeroMeals] = useState(false);
  const [statusTab, setStatusTab] = useState("all");
  const [dietFilter, setDietFilter] = useState("All");
  const [allergyFilter, setAllergyFilter] = useState("All");
  const [filterCriteria, setFilterCriteria] = useState({
    mealCount: "",
    operator: ">",
    planType: "All",
    endDateOperator: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
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
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // end date only exists once a plan stops delivering — updatedAt is when that happened
  const getSubscriptionEndLabel = (sub) => {
    if (sub.status === "completed" || sub.status === "cancelled") {
      return sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : "—";
    }
    if (sub.status === "active") return "Ongoing";
    return "Not started";
  };

  const handleCancelPlan = async (subId, userName) => {
    if (window.confirm(`Are you sure you want to cancel the queued plan for ${userName}?`)) {
      try {
        await cancelQueuedPlan(subId);
        alert("Queued plan cancelled successfully.");
        setSelectedUser(null);
      } catch (err) {
        alert("Failed to cancel queued plan: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusTab("all");
    setDietFilter("All");
    setAllergyFilter("All");
    setShowZeroMeals(false);
    setFilterCriteria({ mealCount: "", operator: ">", planType: "All", endDateOperator: "", endDate: "" });
    setCurrentPage(1);
  };

  const tabCounts = Object.fromEntries(
    STATUS_TABS.map((tab) => [tab.key, allRegisteredUsers.filter((u) => tab.match(u)).length])
  );

  const now = new Date();
  const newThisMonth = allRegisteredUsers.filter((user) => {
    const created = new Date(user.createdAt || user.created_date);
    return !Number.isNaN(created.getTime()) && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const statCards = [
    { label: "Total Users", value: allRegisteredUsers.length, icon: Users },
    { label: "Active Subscribers", value: tabCounts.active, icon: UserCheck },
    { label: "Cancelled / Inactive", value: tabCounts.inactive, icon: PauseCircle },
    { label: "New This Month", value: newThisMonth, icon: UserPlus },
  ];

  const activeTab = STATUS_TABS.find((tab) => tab.key === statusTab);

  const filteredUsers = allRegisteredUsers.filter((user) => {
    const searchMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const totalMeals = (user.mealCounts?.lunchMeals || 0) +
                      (user.mealCounts?.nextDayLunchMeals || 0) +
                      (user.mealCounts?.dinnerMeals || 0) +
                      (user.mealCounts?.nextDayDinnerMeals || 0);

    const presenceMatch = showZeroMeals ? true : totalMeals > 0;

    const latestSub = getLatestSub(user);

    let planMatch = true;
    if (filterCriteria.planType !== "All") {
      planMatch = latestSub?.plan?.includes(filterCriteria.planType);
    }

    const statusMatch = Boolean(activeTab.match(user));
    const dietMatch = dietFilter === "All" || latestSub?.mealType === dietFilter;
    const allergyMatch =
      allergyFilter === "All" ||
      (allergyFilter === "Has" ? Boolean(latestSub?.allergy) : !latestSub?.allergy);

    let mealCountMatch = true;
    if (filterCriteria.mealCount !== "") {
      const targetCount = parseInt(filterCriteria.mealCount);
      if (filterCriteria.operator === ">") mealCountMatch = totalMeals > targetCount;
      else if (filterCriteria.operator === "<") mealCountMatch = totalMeals < targetCount;
      else if (filterCriteria.operator === "=") mealCountMatch = totalMeals === targetCount;
    }

    let endDateMatch = true;
    if (filterCriteria.endDateOperator && filterCriteria.endDate) {
      const { date } = calculateSubEndDate(user, holidayDateKeys);
      if (date) {
        const userEndDate = new Date(date);
        userEndDate.setHours(0, 0, 0, 0);
        const filterDate = new Date(filterCriteria.endDate);
        filterDate.setHours(0, 0, 0, 0);

        if (filterCriteria.endDateOperator === "<") endDateMatch = userEndDate < filterDate;
        else if (filterCriteria.endDateOperator === ">") endDateMatch = userEndDate > filterDate;
        else if (filterCriteria.endDateOperator === "=") endDateMatch = userEndDate.getTime() === filterDate.getTime();
      } else {
        endDateMatch = false;
      }
    }

    return searchMatch && mealCountMatch && presenceMatch && planMatch && endDateMatch && statusMatch && dietMatch && allergyMatch;
  });

  const latestSubscriptionTime = (user) => {
    const times = (user.subscriptions || [])
      .map((sub) => new Date(sub.createdAt).getTime())
      .filter((time) => !Number.isNaN(time));
    return times.length ? Math.max(...times) : 0;
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return latestSubscriptionTime(b) - latestSubscriptionTime(a);

    let aValue, bValue;
    if (sortConfig.key === "name") {
      aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
      bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortConfig.key === "mealCount") {
      aValue = (a.mealCounts?.lunchMeals || 0) + (a.mealCounts?.nextDayLunchMeals || 0) +
               (a.mealCounts?.dinnerMeals || 0) + (a.mealCounts?.nextDayDinnerMeals || 0);
      bValue = (b.mealCounts?.lunchMeals || 0) + (b.mealCounts?.nextDayLunchMeals || 0) +
               (b.mealCounts?.dinnerMeals || 0) + (b.mealCounts?.nextDayDinnerMeals || 0);
    } else if (sortConfig.key === "startDate") {
      const subA = a.subscriptions?.[a.subscriptions.length - 1];
      const subB = b.subscriptions?.[b.subscriptions.length - 1];
      aValue = subA ? new Date(subA.subscriptionStartDate).getTime() : 0;
      bValue = subB ? new Date(subB.subscriptionStartDate).getTime() : 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedUsers = isPrinting
    ? sortedUsers
    : sortedUsers.slice(
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

  const pageTitle = planFilter ? `${planFilter} Plan Subscribers` : "All Registered Users";

  const detailLatestSub = selectedUser ? getLatestSub(selectedUser) : null;
  const detailStatus = selectedUser ? getStatus(selectedUser) : "No Plan";
  const detailLunchLeft = (selectedUser?.mealCounts?.lunchMeals || 0) + (selectedUser?.mealCounts?.nextDayLunchMeals || 0);
  const detailDinnerLeft = (selectedUser?.mealCounts?.dinnerMeals || 0) + (selectedUser?.mealCounts?.nextDayDinnerMeals || 0);
  const detailToday = { lunch: selectedUser?.mealCounts?.lunchMeals || 0, dinner: selectedUser?.mealCounts?.dinnerMeals || 0 };
  const detailUpcoming = { lunch: selectedUser?.mealCounts?.nextDayLunchMeals || 0, dinner: selectedUser?.mealCounts?.nextDayDinnerMeals || 0 };
  const detailRegistered = selectedUser
    ? (selectedUser.createdAt || selectedUser.created_date)?.split("T")[0].split("-").reverse().join("-") || "N/A"
    : "";
  const detailInitials = selectedUser
    ? `${selectedUser.firstName?.[0] || ""}${selectedUser.lastName?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <>
      <DashboardLayoutComponent>
        <div className="p-4 w-full text-left sm:p-6 md:p-8">
          <div className="mx-auto w-full space-y-6">
            <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center print:hidden">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
                <p className="text-sm text-gray-500">Manage and view all your customers, their plans, meal usage and more.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard/manage-subscriptions")}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
              >
                + Add New User
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
              {statCards.map((card) => (
                <div key={card.label} className="flex gap-4 items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-xl bg-green-50 text-theme-color-1">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
              <div className="flex flex-col gap-3 justify-between lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-2">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => { setStatusTab(tab.key); setCurrentPage(1); }}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                        statusTab === tab.key
                          ? "bg-theme-color-1 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label} ({tabCounts[tab.key].toLocaleString()})
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadCSV(sortedUsers)}
                    type="button"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    Export CSV
                  </button>
                  <button onClick={() => setIsPrinting(true)} type="button" className={outlineButtonClass}>
                    Export (Print / PDF)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 items-center sm:grid-cols-2 xl:grid-cols-6">
                <div className="sm:col-span-2 xl:col-span-2">
                  <SearchBar
                    value={searchQuery}
                    onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                    placeholder="Search users by name or email..."
                  />
                </div>
                <select
                  value={filterCriteria.planType}
                  onChange={(e) => { setFilterCriteria({ ...filterCriteria, planType: e.target.value }); setCurrentPage(1); }}
                  className={selectClass}
                >
                  <option value="All">Plan: All</option>
                  <option value="Weekly">Weekly Plan</option>
                  <option value="Monthly">Monthly Plan</option>
                  <option value="Trial">Trial Pack</option>
                </select>
                <select
                  value={dietFilter}
                  onChange={(e) => { setDietFilter(e.target.value); setCurrentPage(1); }}
                  className={selectClass}
                >
                  <option value="All">Diet: All</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="both">Both (Flexible)</option>
                </select>
                <select
                  value={allergyFilter}
                  onChange={(e) => { setAllergyFilter(e.target.value); setCurrentPage(1); }}
                  className={selectClass}
                >
                  <option value="All">Allergy: All</option>
                  <option value="None">No allergy</option>
                  <option value="Has">Has allergy</option>
                </select>
                {/*
                <label className="flex gap-2 items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showZeroMeals}
                    onChange={(e) => { setShowZeroMeals(e.target.checked); setCurrentPage(1); }}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer text-theme-color-1 focus:ring-theme-color-1"
                  />
                  0 meals
                  {isBackgroundLoading && showZeroMeals && (
                    <span className="text-xs italic text-gray-400">(Loading all...)</span>
                  )}
                </label>
                */}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <button type="button" onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white rounded-lg border border-gray-300 shadow-sm transition-colors hover:bg-gray-100">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button type="button" onClick={() => setShowFilterPopup(true)} className={outlineButtonClass}>
                  <SlidersHorizontal className="w-4 h-4" />
                  Meal Count Filter
                </button>
              </div>
            </div>

            {/* Print-only title + filter context, since the controls above are hidden when printing */}
            <div className="hidden print:block px-4 mb-3 text-left">
              <h2 className="mb-1 text-xl font-bold">{pageTitle}</h2>
              <p className="text-sm text-gray-500">
                {searchQuery && `Search: "${searchQuery}" `}
                {statusTab !== "all" && `Status: ${activeTab.label} `}
                {showZeroMeals && `Including users with 0 meals `}
                {filterCriteria.planType !== "All" && `Plan: ${filterCriteria.planType} `}
                {dietFilter !== "All" && `Diet: ${dietFilter} `}
                {allergyFilter !== "All" && `Allergy: ${allergyFilter} `}
                {filterCriteria.mealCount !== "" && `Meal Count ${filterCriteria.operator} ${filterCriteria.mealCount} `}
                {filterCriteria.endDateOperator && filterCriteria.endDate && `End Date ${filterCriteria.endDateOperator} ${filterCriteria.endDate}`}
              </p>
            </div>

            <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="w-12 h-12 rounded-full border-b-2 animate-spin" style={{ borderColor: "#3c9b62" }}></div>
                  <p className="mt-4 font-medium text-gray-500">Loading user data...</p>
                </div>
              ) : sortedUsers.length > 0 ? (
                <>
                  {/* Desktop View */}
                  <div className="hidden overflow-x-auto md:block print:block">
                    <table className="w-full text-left divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase cursor-pointer min-w-[220px] hover:bg-gray-100"
                            onClick={() => handleSort("name")}
                          >
                            Customer <SortIcon columnKey="name" />
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase whitespace-nowrap">Contact</th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase min-w-[200px]">Address</th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase whitespace-nowrap">Current Plan</th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Diet</th>
                          <th
                            className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase whitespace-nowrap cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("mealCount")}
                          >
                            Meal Counts Left <SortIcon columnKey="mealCount" />
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Allergy</th>
                          <th
                            className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase whitespace-nowrap cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("startDate")}
                          >
                            Start Date <SortIcon columnKey="startDate" />
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase whitespace-nowrap">Est. End Date</th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedUsers.map((user) => {
                          const latestSub = getLatestSub(user);
                          const status = getStatus(user);
                          // Meal counts are summed across every active subscription (see user.mealCounts, computed server-side).
                          const lunchCount = (user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0);
                          const dinnerCount = (user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0);
                          const isZeroMeals = lunchCount === 0 && dinnerCount === 0;
                          const endInfo = calculateSubEndDate(user, holidayDateKeys);
                          const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

                          return (
                            <tr key={user._id} className={`hover:bg-gray-50 ${isZeroMeals ? "bg-red-50" : "bg-white"}`}>
                              <td className="px-4 py-4">
                                <div className="flex gap-3 items-center">
                                  <div className="flex flex-shrink-0 justify-center items-center w-9 h-9 text-xs font-bold text-green-800 bg-green-100 rounded-full">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedUser(user)}
                                      className="font-semibold text-left text-gray-900 hover:text-theme-color-1 hover:underline"
                                    >
                                      {user.firstName} {user.lastName}
                                    </button>
                                    <div className="text-xs text-gray-500 break-all max-w-[220px]">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{user.mobile}</td>
                              <td className="px-4 py-4 text-sm text-gray-700 max-w-[220px] break-words">{user.postalAddress}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {latestSub ? (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPlanStyle(latestSub.plan)}`}>
                                    {latestSub.plan}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">No active plan</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {latestSub && <VegNonVegIcon value={latestSub.mealType} />}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                Lunch: {lunchCount}
                                <br />
                                Dinner: {dinnerCount}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 max-w-[160px] break-words">{latestSub?.allergy || "None"}</td>
                              <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {latestSub?.subscriptionStartDate?.split("T")[0].split("-").reverse().join("-") || "N/A"}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold whitespace-nowrap text-theme-color-1">
                                {endInfo.formattedDate || endInfo.status}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap print:hidden">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    title="View details"
                                    onClick={() => setSelectedUser(user)}
                                    className="p-2 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Manage subscription"
                                    onClick={() => navigate("/dashboard/manage-subscriptions")}
                                    className="p-2 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
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
                    {paginatedUsers.map((user) => {
                      const latestSub = getLatestSub(user);
                      const lunchCount = (user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0);
                      const dinnerCount = (user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0);
                      const isZeroMeals = lunchCount === 0 && dinnerCount === 0;
                      const endInfo = calculateSubEndDate(user, holidayDateKeys);

                      return (
                        <div
                          key={user._id}
                          className={`p-4 rounded-lg border border-gray-200 shadow-sm ${isZeroMeals ? "bg-red-50" : "bg-white"}`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Name:</span>
                              <span
                                className="text-theme-color-1 cursor-pointer hover:underline text-right break-words max-w-[60%]"
                                onClick={() => setSelectedUser(user)}
                              >
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Email:</span>
                              <span className="text-gray-900 text-right break-all max-w-[60%]">{user.email}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Mobile:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">{user.mobile}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Address:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">{user.postalAddress}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Current Plan:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">
                                {latestSub?.plan || "No active plan"}
                              </span>
                            </div>
                            {latestSub && (
                              <div className="flex justify-between pb-2 border-b">
                                <span className="font-medium text-gray-500">Diet:</span>
                                <span className="flex justify-end items-center text-right">
                                  <VegNonVegIcon value={latestSub.mealType} />
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Meal Counts Left:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">
                                Lunch: {lunchCount}, Dinner: {dinnerCount}
                              </span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Allergy:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">{latestSub?.allergy || "None"}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b">
                              <span className="font-medium text-gray-500">Meal Start Date:</span>
                              <span className="text-gray-900 text-right break-words max-w-[60%]">
                                {latestSub?.subscriptionStartDate ? new Date(latestSub.subscriptionStartDate).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-500">Est. End Date:</span>
                              <span className="text-theme-color-1 font-bold text-right break-words max-w-[60%]">
                                {endInfo.formattedDate || endInfo.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100 print:hidden">
                    <Pagination
                      totalItems={sortedUsers.length}
                      currentPage={currentPage}
                      rowsPerPage={rowsPerPage}
                      onPageChange={setCurrentPage}
                      onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center items-center py-10">
                  <p className="font-medium text-gray-500">No user data found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayoutComponent>

      <FilterPopup
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        criteria={filterCriteria}
        setCriteria={(val) => { setFilterCriteria(val); setCurrentPage(1); }}
      />

      <Popup
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        maxWidthClass="max-w-3xl"
        content={
          selectedUser && (
            <div className="space-y-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-shrink-0 justify-center items-center w-14 h-14 text-lg font-bold text-green-800 bg-green-100 rounded-full">
                      {detailInitials}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                      <p className="text-gray-500">Customer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[detailStatus]}`}>
                      {detailStatus === "Active" ? "Active User" : "Inactive User"}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">Registered on {detailRegistered}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 mt-4 sm:grid-cols-2">
                  <DetailRow label="Email">{selectedUser.email}</DetailRow>
                  <DetailRow label="Mobile">{selectedUser.mobile}</DetailRow>
                  <div className="sm:col-span-2">
                    <DetailRow label="Address">{selectedUser.postalAddress}</DetailRow>
                  </div>
                </div>
              </div>

              <section>
                <p className="text-base font-bold text-gray-900">Meal Balance</p>
                <p className="mb-3 text-xs text-gray-500">Remaining meal counts across active plans.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-semibold text-theme-color-1">Lunch</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {detailLunchLeft} <span className="text-sm font-medium text-gray-600">meals left</span>
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs font-semibold text-orange-700">Dinner</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {detailDinnerLeft} <span className="text-sm font-medium text-gray-600">meals left</span>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex gap-3 items-center">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-base font-bold text-gray-900">Subscription</p>
                    <p className="text-xs text-gray-500">Current plan and preferences.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-5 mt-3 bg-gray-50 rounded-xl border border-gray-100 sm:grid-cols-2">
                  <div className="space-y-4">
                    <SubscriptionField icon={Package} label="Plan">{detailLatestSub?.plan || "No active plan"}</SubscriptionField>
                    <SubscriptionField icon={Clock} label="Status">
                      {detailLatestSub ? (
                        <span
                          className={`flex gap-1.5 items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            detailLatestSub.status === "active" ? "bg-green-50 text-green-700" :
                            detailLatestSub.status === "queued" ? "bg-amber-50 text-amber-700" :
                            detailLatestSub.status === "cancelled" ? "bg-red-50 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {detailLatestSub.status.charAt(0).toUpperCase() + detailLatestSub.status.slice(1)}
                        </span>
                      ) : "—"}
                    </SubscriptionField>
                    <SubscriptionField icon={CalendarDays} label="Start Date">
                      {detailLatestSub?.subscriptionStartDate
                        ? new Date(detailLatestSub.subscriptionStartDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                        : "N/A"}
                    </SubscriptionField>
                  </div>
                  <div className="space-y-4">
                    <SubscriptionField icon={CalendarDays} label="End Date">
                      {detailLatestSub ? getSubscriptionEndLabel(detailLatestSub) : "—"}
                    </SubscriptionField>
                    <SubscriptionField icon={Utensils} label="Meal Type">
                      {MEAL_TYPE_LABELS[detailLatestSub?.mealType] || "—"}
                    </SubscriptionField>
                    <SubscriptionField icon={Droplets} label="Carb Preference">
                      {capitalizeWords(detailLatestSub?.carbType)}
                    </SubscriptionField>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex gap-3 items-center">
                  <CalendarDays className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-base font-bold text-gray-900">Meal Balance by Day</p>
                    <p className="text-xs text-gray-500">Today's usage and upcoming meal allocation.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
                  <DayBalanceCard icon={Sun} tone="bg-orange-50 text-orange-500" label="Today" lunch={detailToday.lunch} dinner={detailToday.dinner} />
                  <DayBalanceCard icon={CalendarDays} tone="bg-green-50 text-theme-color-1" label="Upcoming" lunch={detailUpcoming.lunch} dinner={detailUpcoming.dinner} />
                </div>
              </section>

              <section>
                <p className="mb-3 text-base font-bold text-gray-900">Subscription History</p>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                  {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                    [...selectedUser.subscriptions].reverse().map((sub, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border shadow-sm">
                        <div className="flex justify-between font-bold text-theme-color-1">
                          <span>{sub.plan}</span>
                          {sub.status === "queued" && (
                            <button
                              onClick={() => handleCancelPlan(sub._id, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
                            >
                              Cancel Queued Plan
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`${
                              sub.status === "active" || sub.status === "Active" ? "text-green-600" :
                              sub.status === "queued" ? "text-amber-600" :
                              sub.status === "cancelled" ? "text-red-600" :
                              "text-gray-600"
                            } font-bold`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </div>
                          <div><span className="text-gray-500">Start Date:</span> {new Date(sub.subscriptionStartDate).toLocaleDateString()}</div>
                          <div><span className="text-gray-500">End Date:</span> {getSubscriptionEndLabel(sub)}</div>
                          <div className="flex items-center"><span className="text-gray-500">Meals:</span>&nbsp;{sub.mealType?.charAt(0).toUpperCase() + sub.mealType?.slice(1)}<VegNonVegIcon value={sub.mealType} className="ml-2" /></div>
                          <div><span className="text-gray-500">Carbs:</span> {sub.carbType?.charAt(0).toUpperCase() + sub.carbType?.slice(1)}</div>
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
              </section>
            </div>
          )
        }
        footerLeft={
          selectedUser && (
            <>
              <button
                type="button"
                onClick={() => navigate("/dashboard/manage-subscriptions")}
                className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                Edit User
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/user-meal-tracking", { state: { user: selectedUser } })}
                className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <History className="w-4 h-4" />
                View Meal History
              </button>
            </>
          )
        }
        buttons={[
          {
            label: "Close",
            onClick: () => setSelectedUser(null),
            className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          },
        ]}
      />
    </>
  );
};
