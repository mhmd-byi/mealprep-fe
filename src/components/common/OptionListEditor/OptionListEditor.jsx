import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const OptionRow = ({ option, maxLength, onRename, onDelete }) => {
  const [label, setLabel] = useState(option.label);
  const [isSaving, setIsSaving] = useState(false);

  const saveIfChanged = async () => {
    const trimmed = label.trim();
    if (trimmed === option.label || !trimmed) {
      setLabel(option.label);
      return;
    }
    try {
      setIsSaving(true);
      await onRename(option._id, trimmed);
      toast.success("Option updated.");
    } catch (err) {
      console.error("Error updating option:", err);
      toast.error(err.response?.data?.message || "Failed to update option.");
      setLabel(option.label);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-3 items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <input
        value={label}
        disabled={isSaving}
        maxLength={maxLength}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveIfChanged}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="flex-1 font-semibold text-gray-900 bg-transparent focus:outline-none"
      />
      <button type="button" onClick={() => onDelete(option)} className="p-2 text-red-500 rounded-lg hover:bg-red-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const OptionListEditor = ({
  title,
  description,
  placeholder,
  options,
  isLoading,
  maxLength = 24,
  footnote,
  onAdd,
  onRename,
  onDelete,
}) => {
  const [newLabel, setNewLabel] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      setIsSavingNew(true);
      await onAdd(newLabel.trim());
      setNewLabel("");
      toast.success("Option added.");
    } catch (err) {
      console.error("Error adding option:", err);
      toast.error(err.response?.data?.message || "Failed to add option.");
    } finally {
      setIsSavingNew(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <input
            value={newLabel}
            maxLength={maxLength}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSavingNew}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-60"
          >
            {isSavingNew ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading options...</p>
        ) : options.length === 0 ? (
          <p className="py-6 text-center text-gray-500">No options yet — add one above.</p>
        ) : (
          options.map((option) => (
            <OptionRow key={option._id} option={option} maxLength={maxLength} onRename={onRename} onDelete={onDelete} />
          ))
        )}
        {footnote && <p className="px-1 text-xs text-gray-400">{footnote}</p>}
      </div>
    </div>
  );
};

export default OptionListEditor;
