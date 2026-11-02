import { useState } from "react";
import { toast } from "sonner";
import { BODY_MAX, TITLE_MAX, inputClass, primaryButton } from "./notificationDisplay";
import { errorText, useAutoReminders, useNotificationActions } from "./useNotifications";

const DAY_CHOICES = [1, 2, 3, 5, 7, 10, 14];

const ReminderCard = ({ reminder }) => {
  const { saveReminder } = useNotificationActions();
  const [enabled, setEnabled] = useState(reminder.enabled);
  const [title, setTitle] = useState(reminder.title);
  const [body, setBody] = useState(reminder.body);
  const [days, setDays] = useState(reminder.days);
  const [sendAt, setSendAt] = useState(reminder.sendAt);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveReminder({ key: reminder.key, enabled, title: title.trim(), body: body.trim(), days, sendAt });
      toast.success(`${reminder.label} saved.`);
    } catch (error) {
      toast.error(errorText(error, "Could not save this reminder."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-4 justify-between items-start">
        <div>
          <p className="text-base font-bold text-gray-900">{reminder.label}</p>
          <p className="text-sm text-gray-500">{reminder.description}</p>
        </div>
        <label className="flex flex-shrink-0 gap-2 items-center text-sm font-semibold text-gray-700 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-5 h-5 accent-green-600" />
          {enabled ? "On" : "Off"}
        </label>
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
        <textarea className={inputClass} rows={reminder.trigger === "event" ? 9 : 3} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reminder.trigger === "time" ? (
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Sends at (India time)</label>
            <input type="time" className={inputClass} value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sent as soon as a holiday is added. There is no send time to set.</p>
        )}
        {reminder.key === "plan-ending" && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Send this many days before the plan ends</p>
            <div className="flex flex-wrap gap-2">
              {DAY_CHOICES.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => b - a)))}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${
                      active ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {day} day{day === 1 ? "" : "s"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {reminder.lastRunDate && <p className="text-xs text-gray-400">Last ran on {reminder.lastRunDate}.</p>}
      <div className="flex justify-end">
        <button type="button" className={primaryButton} onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export const AutomaticTab = () => {
  const { data, isLoading } = useAutoReminders();

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Reminders sent on their own every day. Each one is off until you switch it on, and nobody is sent the same reminder twice.
      </p>
      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading reminders...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(data || []).map((reminder) => (
            <ReminderCard key={`${reminder.key}-${reminder.lastRunDate}`} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomaticTab;
