import React, { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import Popup from "../../../components/common/Popup/Popup";
import { useExpenses } from "./useExpenses";
import { CategoryManager } from "./CategoryManager";
import { PAYMENT_METHODS } from "./constants";

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

export const Expenses = () => {
  const {
    expenses,
    summary,
    isLoading,
    error,
    filters,
    setFilters,
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
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState("");

  const handleMonthFilterChange = (value) => {
    setMonthFilter(value);
    if (!value) return;
    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    setFilters((prev) => ({
      ...prev,
      startDate: `${value}-01`,
      endDate: `${value}-${String(lastDay).padStart(2, "0")}`,
    }));
  };

  // Editing the dates directly deselects whichever month was quick-picked,
  // so the two controls never silently disagree.
  const handleDateFilterChange = (field, value) => {
    setMonthFilter("");
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Summary cards describe whichever period is filtered — the real current
  // month/week by default, the picked month when the month dropdown is used,
  // or the picked range when custom start/end dates are used instead.
  const hasDateFilter = !!(filters.startDate && filters.endDate);
  const periodLabel = monthFilter ? "Selected Month" : hasDateFilter ? "Selected Period" : "This Month";
  const weekLabel = monthFilter ? "Last Week of Month" : hasDateFilter ? "Last 7 Days of Period" : "This Week";

  const colorByCategory = {};
  categories.forEach((c) => { colorByCategory[c.name] = c.color; });
  const getCategoryColor = (name) => colorByCategory[name] || "#898781";
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

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-start p-4 w-full sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 print:hidden">
                <h2 className="text-xl font-bold md:text-2xl">Expenses</h2>
                <div className="flex gap-2">
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
              <h2 className="hidden print:block text-xl font-bold mb-4">Expenses</h2>

              {/* Summary cards — labels flip to describe whichever period is filtered,
                  since the numbers below them now come from that period, not always
                  the real current month/week (see useExpenses.fetchSummary). */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{periodLabel}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summary?.monthTotal)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{weekLabel}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summary?.weekTotal)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Category</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                    {summary?.topCategory && (
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: summary.breakdown?.[0]?.color || "#898781" }}
                      />
                    )}
                    <span className="truncate">{summary?.topCategory || "—"}</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Daily Spend</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summary?.averageDailySpend)}
                  </p>
                </div>
              </div>

              {/* Category breakdown */}
              {summary?.breakdown?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {periodLabel} by Category
                  </p>
                  <div className="space-y-2">
                    {summary.breakdown.map((item) => (
                      <div key={item.category} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-40 flex-shrink-0 truncate">
                          {item.category}
                        </span>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-24 flex-shrink-0 text-right">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-xs text-gray-500 w-12 flex-shrink-0 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-6 print:hidden">
                <Input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => handleMonthFilterChange(e.target.value)}
                  placeholder="Select month"
                />
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleDateFilterChange("startDate", e.target.value)}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleDateFilterChange("endDate", e.target.value)}
                  placeholder="End date"
                />
                <Input
                  type="select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, category: e.target.value, subcategory: "" }))
                  }
                  placeholder="All Categories"
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                />
                <Input
                  type="select"
                  value={filters.subcategory}
                  onChange={(e) => setFilters((prev) => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="All Subcategories"
                  options={subcategoriesFor(filters.category).map((s) => ({ value: s.name, label: s.name }))}
                  disabled={!filters.category}
                />
                <Input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search description..."
                />
                {expenses.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={exportToCSV}
                      classes="bg-blue-500 hover:bg-blue-600 flex-1"
                    >
                      Export CSV
                    </Button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 text-sm font-semibold bg-white rounded-lg border-2 shadow-sm text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white whitespace-nowrap"
                    >
                      Print / PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Print-only context, since the filter controls above are hidden when printing */}
              {(filters.startDate || filters.endDate || filters.category || filters.search) && (
                <p className="hidden print:block text-sm text-gray-500 mb-3">
                  {filters.startDate && `From: ${formatDate(filters.startDate)} `}
                  {filters.endDate && `To: ${formatDate(filters.endDate)} `}
                  {filters.category && `Category: ${filters.category}${filters.subcategory ? ` / ${filters.subcategory}` : ""} `}
                  {filters.search && `Search: "${filters.search}"`}
                </p>
              )}

              {error && <p className="mb-4 text-red-500">{error}</p>}

              {/* Table */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <p className="text-gray-500 py-4">Loading expenses...</p>
                ) : expenses.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Subcategory</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment</th>
                        <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense._id} className="hover:bg-gray-100">
                          <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${getCategoryColor(expense.category)}1a`,
                                color: getCategoryColor(expense.category),
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getCategoryColor(expense.category) }}
                              />
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {expense.subcategory || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {expense.description || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {expense.paymentMethod}
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditModal(expense)}
                              className="text-theme-color-1 hover:underline mr-3"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(expense)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="py-4 text-center text-gray-500">No expenses found</p>
                )}
              </div>
            </div>
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
