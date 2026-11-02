import { useState } from "react";
import { toast } from "sonner";
import { BODY_MAX, CATEGORY_OPTIONS, ROUTE_OPTIONS, TITLE_MAX, inputClass, primaryButton } from "./notificationDisplay";
import { errorText, useNotificationActions } from "./useNotifications";

export const TemplateForm = ({ seed, onDone }) => {
  const { saveTemplate } = useNotificationActions();
  const [name, setName] = useState(seed?.name || "");
  const [title, setTitle] = useState(seed?.title || "");
  const [body, setBody] = useState(seed?.body || "");
  const [category, setCategory] = useState(seed?.category || "announcement");
  const [route, setRoute] = useState(seed?.route || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Give the template a name.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error("A title and a message are required.");
      return;
    }
    try {
      setIsSaving(true);
      await saveTemplate({ name: name.trim(), title: title.trim(), body: body.trim(), category, route }, seed?._id);
      toast.success("Template saved.");
      onDone();
    } catch (error) {
      toast.error(errorText(error, "Failed to save the template."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-500">Template name</label>
        <input className={inputClass} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Holiday tomorrow" />
      </div>
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-500">
          Title ({title.length}/{TITLE_MAX})
        </label>
        <input className={inputClass} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-500">
          Message ({body.length}/{BODY_MAX})
        </label>
        <textarea className={inputClass} rows={3} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} />
        <p className="mt-1 text-xs text-gray-400">Use {"{name}"} for the customer's first name.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-500">Type</label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-500">Opens screen</label>
          <select className={inputClass} value={route} onChange={(e) => setRoute(e.target.value)}>
            {ROUTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" className={primaryButton} onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save template"}
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;
