const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// `log.userId` is only a populated customer object when the backend call
// requested it (admin/subscriptions/audit-logs now populates firstName/
// lastName/email/mobile) — falls back gracefully if it's ever just an id.
const customerLabel = (log) => {
  const u = log.userId;
  if (!u || typeof u !== "object") return "—";
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return name || u.email || "—";
};

export const AuditLogTable = ({ logs, isLoading, scopeLabel, showCustomer = false, onCustomerClick }) => {
  if (isLoading) return <p className="text-gray-500 py-4">Loading audit log...</p>;
  if (!logs || logs.length === 0) {
    return <p className="py-4 text-center text-gray-500">No logged actions{scopeLabel ? ` for ${scopeLabel}` : ""} yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">When</th>
            {showCustomer && (
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
            )}
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Admin</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reason</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Changes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log._id} className="align-top">
              <td className="px-4 py-4 text-sm text-left text-gray-700 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
              {showCustomer && (
                <td className="px-4 py-4 text-sm text-left whitespace-nowrap">
                  {onCustomerClick && log.userId?._id ? (
                    <button
                      type="button"
                      onClick={() => onCustomerClick(log.userId._id)}
                      className="font-medium text-theme-color-1 hover:underline"
                    >
                      {customerLabel(log)}
                    </button>
                  ) : (
                    customerLabel(log)
                  )}
                </td>
              )}
              <td className="px-4 py-4 text-sm text-left text-gray-700 whitespace-nowrap">{log.adminName}</td>
              <td className="px-4 py-4 text-sm text-left whitespace-nowrap">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {capitalize(log.action)}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-left text-gray-700 max-w-xs">{log.reason}</td>
              <td className="px-4 py-4 text-xs text-left text-gray-500 max-w-sm">
                <FieldDiff before={log.before} after={log.after} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const FieldDiff = ({ before, after }) => {
  if (!before) {
    return <span>Created as {after?.status}, {after?.totalMeals} meals ({after?.plan})</span>;
  }
  if (!after) return null;
  const changedKeys = Object.keys(after).filter((key) => JSON.stringify(after[key]) !== JSON.stringify(before[key]));
  if (changedKeys.length === 0) return <span>—</span>;
  return (
    <ul className="space-y-0.5">
      {changedKeys.map((key) => (
        <li key={key}>
          <span className="font-medium">{key}:</span> {String(before[key])} → {String(after[key])}
        </li>
      ))}
    </ul>
  );
};

export default AuditLogTable;
