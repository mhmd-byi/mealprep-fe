import { useState } from "react";
import { toast } from "sonner";
import Popup from "../../../components/common/Popup/Popup";
import { TemplateForm } from "./TemplateForm";
import { ROUTE_OPTIONS, capitalize, outlineButton, primaryButton } from "./notificationDisplay";
import { errorText, useNotificationActions, useTemplates } from "./useNotifications";

export const TemplatesTab = ({ onUse }) => {
  const { data, isLoading } = useTemplates();
  const { deleteTemplate } = useNotificationActions();
  const [editing, setEditing] = useState(null);
  const templates = data || [];

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete the template "${template.name}"?`)) return;
    try {
      await deleteTemplate(template._id);
      toast.success("Template deleted.");
    } catch (error) {
      toast.error(errorText(error, "Failed to delete the template."));
    }
  };

  const routeLabel = (route) => ROUTE_OPTIONS.find((option) => option.value === route)?.label || "Just open the app";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" className={primaryButton} onClick={() => setEditing({ title: "", body: "", category: "announcement", route: "" })}>
          + New template
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No templates yet. Save one from the Send tab or add one here.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template._id} className="p-5 space-y-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-base font-bold text-gray-900">{template.name}</p>
              <p className="text-sm font-semibold text-gray-800">{template.title}</p>
              <p className="text-sm text-gray-600">{template.body}</p>
              <p className="text-xs text-gray-400">
                {capitalize(template.category)} · opens: {routeLabel(template.route)}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className={primaryButton} onClick={() => onUse(template)}>
                  Use
                </button>
                <button type="button" className={outlineButton} onClick={() => setEditing(template)}>
                  Edit
                </button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-300 hover:bg-red-50" onClick={() => handleDelete(template)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Popup
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? "Edit template" : "New template"}
        maxWidthClass="max-w-lg"
        content={editing ? <TemplateForm key={editing._id || "new"} seed={editing} onDone={() => setEditing(null)} /> : null}
        buttons={[]}
      />
    </div>
  );
};

export default TemplatesTab;
