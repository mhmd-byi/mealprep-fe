import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
import Pagination from "../../../components/common/Pagination/Pagination";
import { inputClass, outlineButton } from "../Alacarte/alacarteDisplay";
import {
  ACTION_BADGES,
  ACTION_OPTIONS,
  formatLogTime,
  formatValue,
  MODULE_LABELS,
  percentText,
  priceTrend,
  TREND_STYLES,
} from "./catalogLogDisplay";
import { exportCatalogLog, useCatalogLog } from "./useCatalogLog";

const EMPTY_FILTERS = { from: "", to: "", module: "", action: "", adminId: "", q: "", priceOnly: false };

const PriceChange = ({ change }) => {
  const trend = priceTrend(change);
  const percent = percentText(change.percent);
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 items-center px-3 py-2 text-sm rounded-lg border ${TREND_STYLES[trend]}`}>
      {trend === "up" && <ArrowUp className="flex-shrink-0 w-4 h-4" />}
      {trend === "down" && <ArrowDown className="flex-shrink-0 w-4 h-4" />}
      <span className="font-semibold">{change.label}</span>
      <span>
        {formatValue(change.kind, change.before)} <span aria-hidden="true">→</span> <span className="font-bold">{formatValue(change.kind, change.after)}</span>
      </span>
      {percent && <span className="text-xs font-bold">{percent}</span>}
    </div>
  );
};

const PlainChange = ({ change }) => (
  <div className="text-sm">
    <span className="font-medium text-gray-700">{change.label}: </span>
    <span className="text-gray-500 break-words">{formatValue(change.kind, change.before)}</span>
    <span className="mx-1.5 text-gray-400" aria-hidden="true">
      →
    </span>
    <span className="font-semibold text-gray-900 break-words">{formatValue(change.kind, change.after)}</span>
  </div>
);

const Snapshot = ({ items, action }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
    {items.map((item, index) => (
      <p key={`${item.label}-${index}`} className={`text-sm ${item.kind === "money" ? "font-semibold text-gray-900" : "text-gray-600"}`}>
        <span className="font-medium text-gray-700">{item.label}: </span>
        <span className={action === "deleted" ? "line-through decoration-gray-300" : ""}>{formatValue(item.kind, item.value)}</span>
      </p>
    ))}
  </div>
);

const LogEntry = ({ entry, showModule }) => {
  const badge = ACTION_BADGES[entry.action] || { label: entry.action, style: "bg-gray-100 text-gray-700" };
  const moneyChanges = (entry.changes || []).filter((change) => change.kind === "money");
  const otherChanges = (entry.changes || []).filter((change) => change.kind !== "money");

  return (
    <article className={`p-4 space-y-3 bg-white rounded-2xl border shadow-sm ${entry.priceChanged && entry.action === "updated" ? "border-amber-300" : "border-gray-100"}`}>
      <div className="flex flex-wrap gap-2 justify-between items-start">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badge.style}`}>{badge.label}</span>
            {showModule && <span className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">{MODULE_LABELS[entry.module] || entry.module}</span>}
            {entry.priceChanged && entry.action === "updated" && <span className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full">Price change</span>}
          </div>
          <p className="text-base font-bold text-gray-900 break-words">{entry.itemName || "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{formatLogTime(entry.createdAt)}</p>
          <p className="text-xs text-gray-500">by {entry.adminName}</p>
        </div>
      </div>

      {(entry.changes || []).length > 0 && (
        <div className="space-y-2">
          {moneyChanges.map((change) => (
            <PriceChange key={change.field} change={change} />
          ))}
          {otherChanges.map((change) => (
            <PlainChange key={change.field} change={change} />
          ))}
        </div>
      )}

      {(entry.snapshot || []).length > 0 && <Snapshot items={entry.snapshot} action={entry.action} />}
    </article>
  );
};

export const CatalogLogList = ({ modules }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

  const moduleChoices = modules ? modules.filter((value) => MODULE_LABELS[value]) : Object.keys(MODULE_LABELS);
  const scope = filters.module || (modules ? modules.join(",") : "");

  const filterParams = {};
  if (scope) filterParams.module = scope;
  if (filters.from) filterParams.from = filters.from;
  if (filters.to) filterParams.to = filters.to;
  if (filters.action) filterParams.action = filters.action;
  if (filters.adminId) filterParams.adminId = filters.adminId;
  if (filters.q.trim()) filterParams.q = filters.q.trim();
  if (filters.priceOnly) filterParams.priceOnly = "1";

  const { data, isLoading, isError } = useCatalogLog({ ...filterParams, page, limit: rowsPerPage });
  const entries = data?.entries || [];
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  const change = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportCatalogLog(filterParams);
    } catch (error) {
      toast.error("Could not export the log.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="log-from" className="block mb-1 text-xs text-gray-500">
              From
            </label>
            <input id="log-from" type="date" className={inputClass} value={filters.from} max={filters.to || undefined} onChange={change("from")} />
          </div>
          <div>
            <label htmlFor="log-to" className="block mb-1 text-xs text-gray-500">
              To
            </label>
            <input id="log-to" type="date" className={inputClass} value={filters.to} min={filters.from || undefined} onChange={change("to")} />
          </div>
          {moduleChoices.length > 1 && (
            <div>
              <label htmlFor="log-module" className="block mb-1 text-xs text-gray-500">
                Area
              </label>
              <select id="log-module" className={inputClass} value={filters.module} onChange={change("module")}>
                <option value="">All areas</option>
                {moduleChoices.map((value) => (
                  <option key={value} value={value}>
                    {MODULE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="log-action" className="block mb-1 text-xs text-gray-500">
              What happened
            </label>
            <select id="log-action" className={inputClass} value={filters.action} onChange={change("action")}>
              <option value="">Everything</option>
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="log-admin" className="block mb-1 text-xs text-gray-500">
              Changed by
            </label>
            <select id="log-admin" className={inputClass} value={filters.adminId} onChange={change("adminId")}>
              <option value="">Any admin</option>
              {(data?.admins || []).map((admin) => (
                <option key={admin.adminId} value={admin.adminId}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="log-search" className="block mb-1 text-xs text-gray-500">
              Plan, product or item name
            </label>
            <input id="log-search" className={inputClass} placeholder="Search by name" value={filters.q} onChange={change("q")} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <label className="flex gap-2 items-center text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={filters.priceOnly} onChange={change("priceOnly")} className="w-4 h-4 accent-amber-500" />
            Price changes only
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            {hasFilters && (
              <button
                type="button"
                className="text-sm font-semibold text-theme-color-1"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            )}
            <button type="button" className={`${outlineButton} inline-flex gap-1.5 items-center`} disabled={isExporting || (data?.total || 0) === 0} onClick={handleExport}>
              <Download className="w-4 h-4" />
              {isExporting ? "Preparing..." : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading the log...</p>
      ) : isError ? (
        <p className="py-10 text-center text-red-600">Could not load the log. Please try again.</p>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">{hasFilters ? "Nothing matches these filters." : "No changes have been recorded yet. New changes will appear here."}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {data.total} entr{data.total === 1 ? "y" : "ies"}, newest first
          </p>
          <div className="space-y-3">
            {entries.map((entry) => (
              <LogEntry key={entry._id} entry={entry} showModule={moduleChoices.length > 1} />
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4">
              <Pagination
                totalItems={data.total}
                currentPage={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsChange={(rows) => {
                  setRowsPerPage(rows);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogLogList;
