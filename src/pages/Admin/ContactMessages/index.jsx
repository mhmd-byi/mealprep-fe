import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Mail, MessageCircle, Phone, RotateCcw, Trash2 } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import Pagination from "../../../components/common/Pagination/Pagination";
import { formatDateTime } from "../../../alacarteDisplay";
import { errorText, useContactMessageActions, useContactMessages } from "./useContactMessages";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";
const outlineButton =
  "px-3 py-2 text-sm font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap";

const FILTERS = [
  { value: "new", label: "New" },
  { value: "handled", label: "Handled" },
  { value: "all", label: "All" },
];

const whatsappLink = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

const MessageCard = ({ item, onUpdate, onDelete }) => {
  const [noteDraft, setNoteDraft] = useState(item.note);
  const name = `${item.firstName} ${item.lastName}`.trim() || "No name given";
  const isNew = item.status === "new";

  return (
    <div className={`p-5 space-y-3 bg-white rounded-2xl border shadow-sm ${isNew ? "border-theme-color-1" : "border-gray-100"}`}>
      <div className="flex flex-wrap gap-2 justify-between items-start">
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">Received {formatDateTime(item.createdAt)}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isNew ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {isNew ? "New" : `Handled${item.handledByName ? ` by ${item.handledByName}` : ""}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <a href={`mailto:${item.email}`} className="flex gap-1.5 items-center text-theme-color-1">
          <Mail className="w-4 h-4" />
          {item.email}
        </a>
        <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="flex gap-1.5 items-center text-theme-color-1">
          <Phone className="w-4 h-4" />
          {item.phone}
        </a>
        <a href={whatsappLink(item.phone)} target="_blank" rel="noreferrer" className="flex gap-1.5 items-center text-theme-color-1">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>

      {item.message ? (
        <p className="p-3 text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg">{item.message}</p>
      ) : (
        <p className="text-sm italic text-gray-400">No message written.</p>
      )}

      <div className="flex gap-2 items-center">
        <input className={inputClass} value={noteDraft} maxLength={500} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a private note, e.g. called back, will order Monday" />
        {noteDraft.trim() !== item.note && (
          <button type="button" className={outlineButton} onClick={() => onUpdate(item, { note: noteDraft })}>
            Save note
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => onUpdate(item, { status: isNew ? "handled" : "new" })}>
          {isNew ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
          {isNew ? "Mark as handled" : "Reopen"}
        </button>
        <button
          type="button"
          className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};

export const ContactMessages = () => {
  const [status, setStatus] = useState("new");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { updateMessage, deleteMessage } = useContactMessageActions();

  const params = { page, limit: rowsPerPage };
  if (status !== "all") params.status = status;
  if (search.trim()) params.search = search.trim();

  const { data, isLoading } = useContactMessages(params);
  const messages = data?.messages || [];

  const handleUpdate = async (item, payload) => {
    try {
      await updateMessage(item._id, payload);
      if (payload.status) toast.success(payload.status === "handled" ? "Marked as handled." : "Moved back to new.");
      else toast.success("Note saved.");
    } catch (error) {
      toast.error(errorText(error, "Could not update this message."));
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await deleteMessage(item._id);
      toast.success("Message deleted.");
    } catch (error) {
      toast.error(errorText(error, "Could not delete this message."));
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
            <p className="text-sm text-gray-500">Messages sent from the Contact Us form on the website. New ones appear here, there are no emails or texts to check.</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setStatus(item.value);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border ${
                    status === item.value ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-200 hover:border-theme-color-1"
                  }`}
                >
                  {item.label}
                  {item.value === "new" && data?.newCount > 0 ? ` (${data.newCount})` : ""}
                </button>
              ))}
            </div>
            <input
              className={`${inputClass} sm:max-w-xs`}
              placeholder="Search name, email, phone or message"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">{status === "new" && !search ? "No new messages." : "No messages match these filters."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {messages.map((item) => (
                <MessageCard key={`${item._id}-${item.note}`} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {(data?.total || 0) > 0 && (
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
          )}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default ContactMessages;
