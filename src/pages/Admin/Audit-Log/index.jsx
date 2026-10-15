import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Input } from "../../../components";
import Pagination from "../../../components/common/Pagination/Pagination";
import { AuditLogTable } from "../../../components/common/AuditLogTable/AuditLogTable";
import { useAuditLog } from "./useAuditLog";
import { History } from "lucide-react";

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

const ACTION_OPTIONS = [
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "cancel", label: "Cancel" },
];

export const AuditLog = () => {
  const navigate = useNavigate();
  const {
    logs,
    total,
    isLoading,
    error,
    filters,
    applyFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
  } = useAuditLog();

  const [monthFilter, setMonthFilter] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

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
    applyFilters({
      startDate: `${value}-01`,
      endDate: `${value}-${String(lastDay).padStart(2, "0")}`,
    });
  };

  // Editing the dates directly deselects whichever month was quick-picked, so
  // the two controls never silently disagree (same convention as Expenses).
  const handleDateFilterChange = (field, value) => {
    setMonthFilter("");
    applyFilters({ [field]: value });
  };

  const handleReset = () => {
    const today = new Date();
    setMonthFilter(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
    resetFilters();
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-10 h-10 bg-green-50 rounded-xl text-theme-color-1">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
              <p className="text-sm text-gray-500">Every admin change to a customer's subscription, across everyone, for a chosen period.</p>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Start date</label>
                <Input type="date" value={filters.startDate} onChange={(e) => handleDateFilterChange("startDate", e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">End date</label>
                <Input type="date" value={filters.endDate} onChange={(e) => handleDateFilterChange("endDate", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                type="select"
                value={filters.action}
                onChange={(e) => applyFilters({ action: e.target.value })}
                placeholder="All Actions"
                options={ACTION_OPTIONS}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <p className="text-base font-bold text-gray-900">{total} logged action{total === 1 ? "" : "s"}</p>
            </div>
            <AuditLogTable
              logs={logs}
              isLoading={isLoading}
              showCustomer
              onCustomerClick={(userId) => navigate("/dashboard/manage-subscriptions", { state: { userId } })}
            />
            {!isLoading && total > 0 && (
              <Pagination
                totalItems={total}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onRowsChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                rowsOptions={[25, 50, 100, 200]}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default AuditLog;
