import { useState } from "react";
import { toast } from "sonner";
import Popup from "../../../components/common/Popup/Popup";
import Pagination from "../../../components/common/Pagination/Pagination";
import { PUSH_LABELS, PUSH_STYLES, STATUS_STYLES, capitalize, formatDateTime } from "./notificationDisplay";
import { errorText, useNotificationActions, useNotificationDetail, useSentNotifications } from "./useNotifications";

const DetailPopupContent = ({ notificationId, onClose }) => {
  const { data, isLoading } = useNotificationDetail(notificationId);
  const { cancel } = useNotificationActions();

  if (isLoading || !data) return <p className="py-10 text-center text-gray-500">Loading details...</p>;

  const handleCancel = async () => {
    if (!window.confirm(`Cancel "${data.title}"? It will not be sent.`)) return;
    try {
      await cancel(data._id);
      toast.success("Scheduled send cancelled.");
      onClose();
    } catch (error) {
      toast.error(errorText(error, "Could not cancel the notification."));
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex gap-3 justify-between items-start">
          <p className="font-bold text-gray-900">{data.title}</p>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[data.status]}`}>{capitalize(data.status)}</span>
        </div>
        <p className="mt-1 text-gray-700">{data.body}</p>
        <dl className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div>
            <dt className="text-gray-500">Audience</dt>
            <dd className="font-semibold text-gray-900">{data.audienceSummary}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Type</dt>
            <dd className="font-semibold text-gray-900">{capitalize(data.category)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created by</dt>
            <dd className="font-semibold text-gray-900">{data.source === "auto" ? "Automatic reminder" : data.createdBy?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{data.scheduledFor && data.status === "scheduled" ? "Scheduled for" : "Sent"}</dt>
            <dd className="font-semibold text-gray-900">{formatDateTime(data.status === "scheduled" ? data.scheduledFor : data.sentAt || data.createdAt)}</dd>
          </div>
        </dl>
        {data.errorMessage && <p className="mt-2 text-xs text-red-600">Problem: {data.errorMessage}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Recipients", data.stats.recipients],
          ["Push sent", data.stats.pushSent],
          ["Opened", data.openedCount],
        ].map(([label, value]) => (
          <div key={label} className="p-3 bg-green-50 rounded-xl">
            <p className="text-xl font-bold text-theme-color-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {data.stats.noDevice} have no app installed, {data.stats.pushFailed} push failed, {data.stats.skippedOptOut} opted out of announcements.
      </p>

      {data.status === "scheduled" && (
        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-300 hover:bg-red-50">
          Cancel scheduled send
        </button>
      )}

      {data.recipients.length > 0 && (
        <div>
          <p className="mb-2 font-bold text-gray-900">Recipients{data.recipients.length >= 300 ? " (first 300)" : ""}</p>
          <div className="overflow-y-auto max-h-64 rounded-xl border border-gray-100 divide-y divide-gray-100">
            {data.recipients.map((recipient) => (
              <div key={recipient._id} className="flex gap-3 justify-between items-center px-3 py-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{recipient.name}</p>
                  <p className="text-xs text-gray-500">{recipient.mobile}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1.5">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${PUSH_STYLES[recipient.pushStatus]}`}>{PUSH_LABELS[recipient.pushStatus]}</span>
                  {recipient.readAt && <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Opened</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const HistoryTab = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [openId, setOpenId] = useState(null);
  const { data, isLoading } = useSentNotifications(page, rowsPerPage);
  const notifications = data?.notifications || [];

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading history...</p>
      ) : notifications.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Nothing has been sent yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["When", "Notification", "Audience", "Status", "Sent", "Pushed", "Opened"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map((item) => (
                <tr key={item._id} className="cursor-pointer hover:bg-gray-50" onClick={() => setOpenId(item._id)}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.status === "scheduled" ? `Scheduled ${formatDateTime(item.scheduledFor)}` : formatDateTime(item.sentAt || item.createdAt)}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.body}</p>
                    {item.source === "auto" && <span className="text-[10px] font-bold text-blue-600">AUTOMATIC</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">{item.audienceSummary}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[item.status]}`}>{capitalize(item.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.stats.recipients}</td>
                  <td className="px-4 py-3 text-gray-700">{item.stats.pushSent}</td>
                  <td className="px-4 py-3 text-gray-700">{item.openedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(data?.total || 0) > 0 && (
        <div className="p-4 border-t border-gray-100">
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
      )}

      <Popup
        isOpen={Boolean(openId)}
        onClose={() => setOpenId(null)}
        title="Notification details"
        content={openId ? <DetailPopupContent notificationId={openId} onClose={() => setOpenId(null)} /> : null}
        buttons={[{ label: "Close", onClick: () => setOpenId(null), className: "bg-gray-100 text-gray-700 hover:bg-gray-200" }]}
      />
    </div>
  );
};

export default HistoryTab;
