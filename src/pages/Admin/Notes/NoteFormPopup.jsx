import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, X, ImagePlus, Loader2 } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { uploadImageToS3, deleteFileFromS3 } from "../../../utils/s3Files";
import { searchNoteCustomers } from "./useNotes";
import {
  PRIORITY_OPTIONS,
  PRIORITY_CHIP_STYLES,
  formatNoteDateTime,
  toDateTimeInputValue,
  fromDateTimeInputValue,
} from "./noteDisplay";

const MAX_ATTACHMENTS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const FieldLabel = ({ children }) => <label className="block mb-1 text-sm font-medium text-gray-700">{children}</label>;

const CustomerPicker = ({ customer, onChange }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const found = await searchNoteCustomers(query.trim());
        if (!cancelled) setResults(found);
      } catch (err) {
        console.error("Error searching customers:", err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (customer) {
    return (
      <div className="flex gap-2 justify-between items-center px-3 py-2 bg-green-50 rounded-lg border border-green-200">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{customer.name}</p>
          {customer.mobile && <p className="text-xs text-gray-500">{customer.mobile}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 text-gray-500 rounded-md hover:text-gray-800 hover:bg-white"
          aria-label="Remove customer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
      <input
        className={`${inputClass} pl-9`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a customer by name, phone or email"
      />
      {query.trim().length >= 2 && (
        <div className="overflow-y-auto absolute z-10 mt-1 w-full max-h-48 bg-white rounded-lg border border-gray-200 shadow-lg">
          {isSearching ? (
            <p className="px-3 py-2 text-sm text-gray-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No customers found.</p>
          ) : (
            results.map((result) => (
              <button
                key={result._id}
                type="button"
                onClick={() => onChange(result)}
                className="flex justify-between items-center px-3 py-2 w-full text-sm text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{result.name}</span>
                <span className="text-xs text-gray-500">{result.mobile}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const NoteFormPopup = ({ note, categories, onClose, onSave }) => {
  const isEditing = Boolean(note);
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [category, setCategory] = useState(note?.category || "");
  const [priority, setPriority] = useState(note?.priority || "medium");
  const [dueAt, setDueAt] = useState(toDateTimeInputValue(note?.dueAt));
  const [customer, setCustomer] = useState(note?.customer || null);
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [sessionUploads, setSessionUploads] = useState([]);
  const [removedExisting, setRemovedExisting] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryNames = categories.map((item) => item.name);
  const categoryChoices = category && !categoryNames.includes(category) ? [...categoryNames, category] : categoryNames;

  const handleClose = async () => {
    if (isSaving) return;
    if (isUploading) {
      toast.info("Please wait for the upload to finish.");
      return;
    }
    await Promise.all(sessionUploads.map(deleteFileFromS3));
    onClose();
  };

  const handleFiles = async (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (picked.length === 0) return;

    const room = MAX_ATTACHMENTS - attachments.length;
    if (picked.length > room) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} images per note.`);
    }

    const accepted = picked.slice(0, Math.max(0, room)).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image.`);
        return false;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`"${file.name}" is larger than 5 MB.`);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    setIsUploading(true);
    for (const file of accepted) {
      try {
        const url = await uploadImageToS3(file);
        setAttachments((prev) => [...prev, { url, name: file.name }]);
        setSessionUploads((prev) => [...prev, url]);
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error(`Could not upload "${file.name}".`);
      }
    }
    setIsUploading(false);
  };

  const removeAttachment = (attachment) => {
    setAttachments((prev) => prev.filter((item) => item.url !== attachment.url));
    if (sessionUploads.includes(attachment.url)) {
      setSessionUploads((prev) => prev.filter((url) => url !== attachment.url));
      deleteFileFromS3(attachment.url);
    } else {
      setRemovedExisting((prev) => [...prev, attachment.url]);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!title.trim()) {
      toast.error("A title is required.");
      return;
    }
    if (isUploading) {
      toast.error("Please wait for the images to finish uploading.");
      return;
    }
    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        body: body.trim(),
        category,
        priority,
        dueAt: fromDateTimeInputValue(dueAt),
        customerId: customer?._id || null,
        attachments,
      });
      removedExisting.forEach(deleteFileFromS3);
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error(err.response?.data?.message || "Failed to save note.");
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={handleClose}
      title={isEditing ? "Edit Note" : "Add New Note"}
      maxWidthClass="max-w-xl"
      content={
        <div className="space-y-4">
          {isEditing && (
            <p className="text-xs text-gray-400">
              Added by {note.createdBy?.name || "Admin"} on {formatNoteDateTime(note.createdAt)}
              {note.updatedBy?.name && note.updatedAt !== note.createdAt
                ? ` · Last updated by ${note.updatedBy.name} on ${formatNoteDateTime(note.updatedAt)}`
                : ""}
            </p>
          )}

          <div>
            <FieldLabel>Title</FieldLabel>
            <input
              className={inputClass}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check delivery times for tomorrow"
            />
          </div>

          <div>
            <FieldLabel>Details</FieldLabel>
            <textarea
              className={`${inputClass} resize-y`}
              rows={4}
              value={body}
              maxLength={2000}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add anything worth remembering"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Category</FieldLabel>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">No category</option>
                {categoryChoices.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg border ${
                      priority === option.value
                        ? `${PRIORITY_CHIP_STYLES[option.value]} border-current`
                        : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Due date and time (optional)</FieldLabel>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                className={inputClass}
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
              {dueAt && (
                <button
                  type="button"
                  onClick={() => setDueAt("")}
                  className="px-3 text-sm font-semibold text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Customer (optional)</FieldLabel>
            <CustomerPicker customer={customer} onChange={setCustomer} />
          </div>

          <div>
            <FieldLabel>Images (optional, up to {MAX_ATTACHMENTS})</FieldLabel>
            <div className="flex flex-wrap gap-3 items-center">
              {attachments.map((attachment) => (
                <div key={attachment.url} className="relative w-20 h-20">
                  <a href={attachment.url} target="_blank" rel="noreferrer">
                    <img
                      src={attachment.url}
                      alt={attachment.name || "Attachment"}
                      className="object-cover w-20 h-20 rounded-lg border border-gray-200"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment)}
                    className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-white bg-gray-800 rounded-full hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {attachments.length < MAX_ATTACHMENTS && (
                <label
                  className={`flex flex-col gap-1 justify-center items-center w-20 h-20 text-xs font-semibold text-gray-500 rounded-lg border-2 border-dashed border-gray-300 ${
                    isUploading ? "opacity-60" : "cursor-pointer hover:border-theme-color-1 hover:text-theme-color-1"
                  }`}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                  {isUploading ? "Uploading" : "Add"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleFiles}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      }
      buttons={[
        { label: "Cancel", onClick: handleClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Note",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export default NoteFormPopup;
