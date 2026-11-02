import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AudienceFilters } from "./AudienceFilters";
import { TemplateForm } from "./TemplateForm";
import {
  BODY_MAX,
  CATEGORY_OPTIONS,
  ROUTE_OPTIONS,
  TITLE_MAX,
  inputClass,
  outlineButton,
  primaryButton,
} from "./notificationDisplay";
import { EMPTY_FILTER, errorText, useAudiencePreview, useNotificationActions, useTemplates } from "./useNotifications";
import Popup from "../../../components/common/Popup/Popup";

const useDebounced = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const toLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ComposeTab = ({ initialTemplate, onSent }) => {
  const { send, sendTest } = useNotificationActions();
  const templates = useTemplates();

  const [title, setTitle] = useState(initialTemplate?.title || "");
  const [body, setBody] = useState(initialTemplate?.body || "");
  const [category, setCategory] = useState(initialTemplate?.category || "announcement");
  const [route, setRoute] = useState(initialTemplate?.route || "");
  const [filter, setFilter] = useState({ ...EMPTY_FILTER });
  const [when, setWhen] = useState("now");
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [busy, setBusy] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const preview = useAudiencePreview(useDebounced(filter, 500), category);

  const applyTemplate = (id) => {
    const template = (templates.data || []).find((item) => item._id === id);
    if (!template) return;
    setTitle(template.title);
    setBody(template.body);
    setCategory(template.category);
    setRoute(template.route);
  };

  const validate = () => {
    if (!title.trim()) return "A title is required.";
    if (!body.trim()) return "A message is required.";
    if (when === "later" && (!scheduledAt || Number.isNaN(new Date(scheduledAt).getTime()))) return "Pick a date and time to send.";
    return "";
  };

  const handleSend = async () => {
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }
    const count = preview.data?.willReceive ?? 0;
    const scheduledFor = when === "later" ? new Date(scheduledAt).toISOString() : null;
    const verb = scheduledFor ? "Schedule" : "Send";
    if (!window.confirm(`${verb} "${title.trim()}" to ${count} customer${count === 1 ? "" : "s"}? ${preview.data?.withApp ?? 0} will also get a push notification.`)) return;
    try {
      setBusy("send");
      await send({ title: title.trim(), body: body.trim(), category, route, filter, scheduledFor });
      toast.success(scheduledFor ? "Notification scheduled." : "Notification is being sent.");
      onSent();
    } catch (error) {
      toast.error(errorText(error, "Failed to send the notification."));
    } finally {
      setBusy("");
    }
  };

  const handleTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Write a title and a message first.");
      return;
    }
    try {
      setBusy("test");
      toast.success(await sendTest({ title: title.trim(), body: body.trim(), category, route }));
    } catch (error) {
      toast.error(errorText(error, "Could not send the test."));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-base font-bold text-gray-900">Message</p>
          {(templates.data || []).length > 0 && (
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Start from a template</label>
              <select className={inputClass} defaultValue="" onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">Choose a template (optional)</option>
                {templates.data.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">
              Title ({title.length}/{TITLE_MAX})
            </label>
            <input className={inputClass} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Holiday tomorrow" />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">
              Message ({body.length}/{BODY_MAX})
            </label>
            <textarea className={inputClass} rows={4} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} placeholder="Write the message customers will see" />
            <p className="mt-1 text-xs text-gray-400">Use {"{name}"} to put the customer's first name in the title or message.</p>
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
              <label className="block mb-1 text-xs font-medium text-gray-500">Opens screen when tapped</label>
              <select className={inputClass} value={route} onChange={(e) => setRoute(e.target.value)}>
                {ROUTE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-base font-bold text-gray-900">Who gets it</p>
          <AudienceFilters filter={filter} onChange={setFilter} />
        </div>

        <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-base font-bold text-gray-900">When</p>
          <div className="flex flex-wrap gap-3 items-center">
            {[
              ["now", "Send now"],
              ["later", "Schedule for later"],
            ].map(([key, label]) => (
              <label key={key} className="flex gap-2 items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input type="radio" name="when" checked={when === key} onChange={() => setWhen(key)} />
                {label}
              </label>
            ))}
            {when === "later" && (
              <input
                type="datetime-local"
                className={`${inputClass} sm:w-auto`}
                value={scheduledAt}
                min={toLocalInput(new Date(Date.now() + 60 * 1000))}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-5 space-y-3 bg-green-50 rounded-2xl border border-green-100">
          <p className="text-base font-bold text-theme-color-1">
            {preview.data ? `${preview.data.willReceive} customer${preview.data.willReceive === 1 ? "" : "s"} will get this` : "Counting customers..."}
          </p>
          {preview.data && (
            <>
              <p className="text-sm text-gray-700">
                {preview.data.withApp} {preview.data.withApp === 1 ? "has" : "have"} the app and will also get a push notification. All {preview.data.willReceive} see it in their app inbox.
              </p>
              {preview.data.skippedOptOut > 0 && <p className="text-sm text-gray-700">{preview.data.skippedOptOut} turned off announcements and are left out.</p>}
              {preview.data.sample.length > 0 && <p className="text-xs text-gray-500">e.g. {preview.data.sample.join(", ")}</p>}
            </>
          )}
        </div>

        <div className="p-5 space-y-2 bg-gray-800 rounded-2xl">
          <p className="text-xs font-semibold text-gray-400">HOW IT LOOKS ON THE PHONE</p>
          <p className="text-xs font-bold text-gray-400">MEALPREP · now</p>
          <p className="font-bold text-white">{(title || "Title").replace(/\{name\}/g, "Asha")}</p>
          <p className="text-sm text-gray-200">{(body || "Message").replace(/\{name\}/g, "Asha")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" className={primaryButton} onClick={handleSend} disabled={busy !== ""}>
            {busy === "send" ? "Sending..." : when === "later" ? "Schedule notification" : "Send notification"}
          </button>
          <button type="button" className={outlineButton} onClick={handleTest} disabled={busy !== ""}>
            {busy === "test" ? "Sending test..." : "Send a test to my phone"}
          </button>
          <button type="button" className={outlineButton} onClick={() => setSavingTemplate(true)} disabled={!title.trim() || !body.trim()}>
            Save as template
          </button>
        </div>
      </div>

      <Popup
        isOpen={savingTemplate}
        onClose={() => setSavingTemplate(false)}
        title="Save as template"
        maxWidthClass="max-w-lg"
        content={<TemplateForm seed={{ title: title.trim(), body: body.trim(), category, route }} onDone={() => setSavingTemplate(false)} />}
        buttons={[]}
      />
    </div>
  );
};

export default ComposeTab;
