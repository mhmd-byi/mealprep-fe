import { useState, useEffect } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import Popup from "../../../components/common/Popup/Popup";
import Pagination from "../../../components/common/Pagination/Pagination";
import { useExpenses } from "./useExpenses";
import { CategoryManager } from "./CategoryManager";
import { PAYMENT_METHODS } from "./constants";
import { LineChart } from "../Finance-Dashboard/LineChart";
import { formatCompactINR } from "../Finance-Dashboard/format";
import {
  Wallet,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Download,
  Printer,
  CalendarDays,
} from "lucide-react";

const emptyForm = { date: "", category: "", subcategory: "", amount: "", description: "", paymentMethod: "" };

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue).toISOString().split("T")[0];
};

const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// More spend is the unwelcome direction on an expense dashboard, so an
// increase is shown in red and a decrease in green — the opposite of a
// revenue chart.
const ChangeBadge = ({ percent }) => {
  if (percent === null || percent === undefined) return null;
  if (percent === 0) return <span className="text-xs font-semibold text-gray-400">No change</span>;
  const up = percent > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? "text-red-600" : "text-green-600"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent)}%
    </span>
  );
};

export const Expenses = () => {
  const {
    expenses,
    summary,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    addExpense,
    editExpense,
    removeExpense,
    categories,
    addCategory,
    editCategory,
    removeCategory,
    addSubcategory,
    editSubcategory,
    removeSubcategory,
    monthlyTrend,
    trendMonths,
    setTrendMonths,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPrinting, setIsPrinting] = useState(false);
  const [monthFilter, setMonthFilter] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

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

  // monthFilter stays "YYYY-MM" internally; these are just the two parts for
  // the Month/Year selects below (a native <input type="month"> would be
  // simpler, but Safari has never supported that input type).
  const [monthFilterYearPart, monthFilterMonthPart] = monthFilter ? monthFilter.split("-") : ["", ""];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  });

  const applyMonthYearFilter = (month, year) => {
    if (!month || !year) {
      setMonthFilter("");
      return;
    }
    const value = `${year}-${month}`;
    setMonthFilter(value);
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    setFilters((prev) => ({
      ...prev,
      startDate: `${value}-01`,
      endDate: `${value}-${String(lastDay).padStart(2, "0")}`,
    }));
    setCurrentPage(1);
  };

  // Editing the dates directly deselects whichever month was quick-picked,
  // so the two controls never silently disagree.
  const handleDateFilterChange = (field, value) => {
    setMonthFilter("");
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const today = new Date();
    setMonthFilter(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
    resetFilters();
    setCurrentPage(1);
  };

  // Summary cards describe whichever period is filtered — the real current
  // month/week by default, the picked month when the month dropdown is used,
  // or the picked range when custom start/end dates are used instead.
  const hasDateFilter = !!(filters.startDate && filters.endDate);
  const isCurrentMonthSelected = monthFilter === `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const selectedMonthName = MONTH_OPTIONS.find((m) => m.value === monthFilterMonthPart)?.label;
  const periodLabel = monthFilter && selectedMonthName
    ? `${selectedMonthName} ${monthFilterYearPart}`
    : (hasDateFilter ? "Selected Period" : "This Month");
  const weekLabel = !monthFilter
    ? (hasDateFilter ? "Last 7 Days of Period" : "This Week")
    : (isCurrentMonthSelected ? "This Week" : "Last Week of Month");

  const colorByCategory = {};
  categories.forEach((c) => { colorByCategory[c.name] = c.color; });
  const getCategoryColor = (name) => colorByCategory[name] || "#898781";
  const renderCategoryBadge = (name) => (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${getCategoryColor(name)}1a`,
        color: getCategoryColor(name),
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: getCategoryColor(name) }}
      />
      {name}
    </span>
  );
  const subcategoriesFor = (categoryName) =>
    categories.find((c) => c.name === categoryName)?.subcategories || [];

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingId(expense._id);
    setForm({
      date: toInputDate(expense.date),
      category: expense.category,
      subcategory: expense.subcategory || "",
      amount: String(expense.amount),
      description: expense.description || "",
      paymentMethod: expense.paymentMethod,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      // switching category invalidates whichever subcategory was picked
      ...(field === "category" ? { subcategory: "" } : {}),
    }));
  };

  const handleSave = async () => {
    if (!form.date || !form.category || !form.amount || !form.paymentMethod) {
      setFormError("Date, category, amount and payment method are required.");
      return;
    }
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount < 0) {
      setFormError("Amount must be a valid non-negative number.");
      return;
    }

    const payload = {
      date: form.date,
      category: form.category,
      subcategory: form.subcategory,
      amount,
      description: form.description,
      paymentMethod: form.paymentMethod,
    };

    try {
      setIsSaving(true);
      setFormError(null);
      if (editingId) {
        await editExpense(editingId, payload);
      } else {
        await addExpense(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving expense:", err);
      setFormError(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete this ${expense.category} expense of ${formatCurrency(expense.amount)}?`)) {
      return;
    }
    try {
      await removeExpense(expense._id);
    } catch (err) {
      console.error("Error deleting expense:", err);
      window.alert(err.response?.data?.message || "Failed to delete expense.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Category", "Subcategory", "Description", "Amount", "Payment Method"];
    const csvData = expenses.map((e) => [
      formatDate(e.date),
      e.category,
      e.subcategory || "",
      (e.description || "").replace(/"/g, '""'),
      e.amount,
      e.paymentMethod,
    ]);
    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
      "\n"
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateRangeLabel = filters.startDate && filters.endDate
    ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
    : "All Time";

  const paginatedExpenses = isPrinting
    ? expenses
    : expenses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex flex-wrap gap-3 justify-between items-start print:hidden">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
              <p className="text-sm text-gray-500">Track and manage all your business expenses in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDateRangeOpen((v) => !v)}
                  className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <CalendarDays className="w-4 h-4" />
                  {dateRangeLabel}
                </button>
                {isDateRangeOpen && (
                  <div className="absolute right-0 z-30 p-4 mt-2 space-y-3 w-72 bg-white rounded-xl border border-gray-200 shadow-lg">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">Start date</label>
                      <Input type="date" value={filters.startDate} onChange={(e) => handleDateFilterChange("startDate", e.target.value)} />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">End date</label>
                      <Input type="date" value={filters.endDate} onChange={(e) => handleDateFilterChange("endDate", e.target.value)} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDateRangeOpen(false)}
                      className="px-4 py-2 w-full text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryManagerOpen(true)}
                className="px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 shadow-sm text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white whitespace-nowrap"
              >
                Manage Categories
              </button>
              <Button onClick={openAddModal} classes="w-full sm:w-auto">
                + Add Expense
              </Button>
            </div>
          </div>

          {/* Screen-only title, since the interactive header above is hidden when printing */}
          <h2 className="hidden print:block text-xl font-bold">Expenses</h2>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-center items-center mb-2 w-10 h-10 bg-green-50 rounded-xl text-theme-color-1">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{periodLabel}</p>
              <div className="flex flex-wrap gap-2 items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.monthTotal)}</p>
                <ChangeBadge percent={summary?.monthChangePercent} />
              </div>
              <p className="mt-0.5 text-xs text-gray-400">vs last month</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-center items-center mb-2 w-10 h-10 bg-orange-50 rounded-xl text-orange-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{weekLabel}</p>
              <div className="flex flex-wrap gap-2 items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.weekTotal)}</p>
                <ChangeBadge percent={summary?.weekChangePercent} />
              </div>
              <p className="mt-0.5 text-xs text-gray-400">vs last week</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-center items-center mb-2 w-10 h-10 bg-pink-50 rounded-xl text-pink-600">
                <PieChart className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Category</p>
              <p className="flex gap-2 items-center mt-1 text-2xl font-bold text-gray-900">
                {summary?.topCategory && (
                  <span
                    className="inline-block flex-shrink-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: summary.breakdown?.[0]?.color || "#898781" }}
                  />
                )}
                <span className="truncate">{summary?.topCategory || "—"}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{summary?.breakdown?.[0]?.percentage ?? 0}% of total expenses</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-center items-center mb-2 w-10 h-10 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Daily Spend</p>
              <div className="flex flex-wrap gap-2 items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.averageDailySpend)}</p>
                <ChangeBadge percent={summary?.averageDailyChangePercent} />
              </div>
              <p className="mt-0.5 text-xs text-gray-400">vs last month</p>
            </div>
          </div>

          {/* Category breakdown + Monthly trend */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:hidden">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-base font-bold text-gray-900">Expenses by Category</p>
                <span className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">{periodLabel}</span>
              </div>
              {summary?.breakdown?.length > 0 ? (
                <div className="space-y-3">
                  {summary.breakdown.map((item) => (
                    <div key={item.category} className="flex gap-3 items-center">
                      <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="flex-shrink-0 w-28 text-sm text-gray-600 truncate">{item.category}</span>
                      <div className="overflow-hidden flex-1 h-2.5 bg-gray-100 rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="flex-shrink-0 w-20 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="flex-shrink-0 w-10 text-xs text-right text-gray-500">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-sm text-center text-gray-400">No expenses in this period.</p>
              )}
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-base font-bold text-gray-900">Monthly Trend</p>
                <select
                  value={trendMonths}
                  onChange={(e) => setTrendMonths(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <option value={3}>Last 3 Months</option>
                  <option value={6}>Last 6 Months</option>
                  <option value={12}>Last 12 Months</option>
                </select>
              </div>
              <LineChart
                data={monthlyTrend}
                seriesKeys={[{ key: "total", label: "Expenses", color: "#2a78d6" }]}
                title="Monthly expense trend"
                valueFormatter={formatCompactINR}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm print:hidden">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setCurrentPage(1); }}
                placeholder="Search description..."
              />
              {/* Two plain selects instead of <input type="month"> — Safari has never
                  supported that input type and silently falls back to a text box. */}
              <Input
                type="select"
                value={monthFilterMonthPart}
                onChange={(e) => applyMonthYearFilter(e.target.value, monthFilterYearPart || String(currentYear))}
                placeholder="Month"
                options={MONTH_OPTIONS}
              />
              <Input
                type="select"
                value={monthFilterYearPart}
                onChange={(e) => applyMonthYearFilter(monthFilterMonthPart, e.target.value)}
                placeholder="Year"
                options={yearOptions}
              />
              <Input
                type="select"
                value={filters.category}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, category: e.target.value, subcategory: "" }));
                  setCurrentPage(1);
                }}
                placeholder="All Categories"
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
              />
              <Input
                type="select"
                value={filters.subcategory}
                onChange={(e) => { setFilters((prev) => ({ ...prev, subcategory: e.target.value })); setCurrentPage(1); }}
                placeholder="All Subcategories"
                options={subcategoriesFor(filters.category).map((s) => ({ value: s.name, label: s.name }))}
                disabled={!filters.category}
              />
              <Input
                type="select"
                value={filters.paymentMethod}
                onChange={(e) => { setFilters((prev) => ({ ...prev, paymentMethod: e.target.value })); setCurrentPage(1); }}
                placeholder="All Payment Methods"
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Print-only context, since the filter controls above are hidden when printing */}
          {(filters.startDate || filters.endDate || filters.category || filters.paymentMethod || filters.search) && (
            <p className="hidden print:block text-sm text-gray-500">
              {filters.startDate && `From: ${formatDate(filters.startDate)} `}
              {filters.endDate && `To: ${formatDate(filters.endDate)} `}
              {filters.category && `Category: ${filters.category}${filters.subcategory ? ` / ${filters.subcategory}` : ""} `}
              {filters.paymentMethod && `Payment: ${filters.paymentMethod} `}
              {filters.search && `Search: "${filters.search}"`}
            </p>
          )}

          {error && <p className="text-red-500">{error}</p>}

          {/* Table */}
          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            {expenses.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-between items-center p-4 border-b border-gray-100 print:hidden">
                <p className="text-base font-bold text-gray-900">Expense Records</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrinting(true)}
                    className="flex gap-2 items-center px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 shadow-sm text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
                  >
                    <Printer className="w-4 h-4" />
                    Print / PDF
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <p className="py-10 text-center text-gray-500">Loading expenses...</p>
            ) : expenses.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="hidden md:table print:table w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 w-[10%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 w-[15%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 w-[15%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Subcategory</th>
                        <th className="px-4 py-3 w-[30%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 w-[10%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 w-[10%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment</th>
                        <th className="px-4 py-3 w-[10%] text-xs font-medium tracking-wider text-left text-gray-500 uppercase print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedExpenses.map((expense) => (
                        <tr key={expense._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap print:whitespace-normal print:break-words">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-4 py-4 text-sm text-left whitespace-nowrap print:whitespace-normal print:break-words">
                            {renderCategoryBadge(expense.category)}
                          </td>
                          <td className="px-4 py-4 text-sm text-left text-gray-700 whitespace-normal break-words">
                            {expense.subcategory || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-left text-gray-700 whitespace-normal break-words">
                            {expense.description || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap print:whitespace-normal print:break-words">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap print:whitespace-normal print:break-words">
                            {expense.paymentMethod}
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap print:hidden">
                            <button
                              type="button"
                              onClick={() => openEditModal(expense)}
                              title="Edit"
                              className="p-1.5 mr-1 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-theme-color-1"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(expense)}
                              title="Delete"
                              className="p-1.5 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 space-y-4 md:hidden print:hidden">
                  {paginatedExpenses.map((expense) => (
                    <div key={expense._id} className="p-4 rounded-lg border border-gray-200 shadow-sm bg-white">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-gray-900">{formatDate(expense.date)}</span>
                        <span className="text-base font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center gap-3">
                          <span className="font-medium text-gray-500 flex-shrink-0">Category:</span>
                          {renderCategoryBadge(expense.category)}
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="font-medium text-gray-500 flex-shrink-0">Subcategory:</span>
                          <span className="text-gray-900 text-right break-words max-w-[60%]">{expense.subcategory || "—"}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="font-medium text-gray-500 flex-shrink-0">Description:</span>
                          <span className="text-gray-900 text-right break-words max-w-[60%]">{expense.description || "—"}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="font-medium text-gray-500 flex-shrink-0">Payment:</span>
                          <span className="text-gray-900 text-right break-words max-w-[60%]">{expense.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 mt-3 border-t">
                        <button
                          type="button"
                          onClick={() => openEditModal(expense)}
                          className="flex gap-1.5 items-center px-3 py-1.5 text-sm font-medium text-theme-color-1 bg-green-50 rounded-lg"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(expense)}
                          className="flex gap-1.5 items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 print:hidden">
                  <Pagination
                    totalItems={expenses.length}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                  />
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-gray-500">No expenses found</p>
            )}
          </div>
        </div>
      </div>

      <Popup
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Expense" : "New Expense"}
        content={
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Input
                type="select"
                value={form.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                placeholder="Select category"
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                required
              />
            </div>
            {subcategoriesFor(form.category).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <Input
                  type="select"
                  value={form.subcategory}
                  onChange={(e) => handleFormChange("subcategory", e.target.value)}
                  placeholder="Select subcategory (optional)"
                  options={subcategoriesFor(form.category).map((s) => ({ value: s.name, label: s.name }))}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <Input
                type="select"
                value={form.paymentMethod}
                onChange={(e) => handleFormChange("paymentMethod", e.target.value)}
                placeholder="Select payment method"
                options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                rows={3}
                placeholder="What was this for?"
                className="block w-full rounded-lg border-0 px-5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        }
        buttons={[
          {
            label: "Cancel",
            onClick: closeModal,
            className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
          },
          {
            label: isSaving ? "Saving..." : "Save Expense",
            onClick: handleSave,
            className: "bg-theme-color-1 text-white hover:bg-black",
          },
        ]}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        addCategory={addCategory}
        editCategory={editCategory}
        removeCategory={removeCategory}
        addSubcategory={addSubcategory}
        editSubcategory={editSubcategory}
        removeSubcategory={removeSubcategory}
      />
    </DashboardLayoutComponent>
  );
};

export default Expenses;
