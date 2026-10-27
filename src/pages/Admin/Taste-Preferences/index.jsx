import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useTasteOptions } from "../../../useTasteOptions";

const OptionRow = ({ option, onRename, onDelete }) => {
  const [label, setLabel] = useState(option.label);
  const [isSaving, setIsSaving] = useState(false);

  const saveIfChanged = async () => {
    const trimmed = label.trim();
    if (trimmed === option.label) {
      setLabel(option.label);
      return;
    }
    if (!trimmed) {
      setLabel(option.label);
      return;
    }
    try {
      setIsSaving(true);
      await onRename(option._id, trimmed);
      toast.success("Option updated.");
    } catch (err) {
      console.error("Error updating taste option:", err);
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
        maxLength={24}
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

const OptionGroup = ({ title, description, placeholder, options, isLoading, onAdd, onRename, onDelete }) => {
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
      console.error("Error adding taste option:", err);
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
            maxLength={24}
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
            <OptionRow key={option._id} option={option} onRename={onRename} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};

export const TastePreferences = () => {
  const { spiceOptions, flavourOptions, isLoading, addOption, editOption, removeOption } = useTasteOptions();

  const handleDelete = async (option) => {
    if (!window.confirm(`Delete "${option.label}"? Customers who already chose it keep it on their plan — it just stops being offered to new choices.`)) {
      return;
    }
    try {
      await removeOption(option._id);
      toast.success("Option deleted.");
    } catch (err) {
      console.error("Error deleting taste option:", err);
      toast.error(err.response?.data?.message || "Failed to delete option.");
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-8 w-full max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Taste Preferences</h2>
            <p className="text-sm text-gray-500">
              The choices customers see when they buy a plan or edit it in My Plans. Renaming an option also updates every plan that already uses it.
            </p>
          </div>

          <OptionGroup
            title="Spice Level"
            description="Customers pick one."
            placeholder="Option name (e.g. Medium)"
            options={spiceOptions}
            isLoading={isLoading}
            onAdd={(label) => addOption("spice", label)}
            onRename={editOption}
            onDelete={handleDelete}
          />

          <OptionGroup
            title="Flavour Preferences"
            description="Customers can pick as many as they like."
            placeholder="Option name (e.g. Grilled)"
            options={flavourOptions}
            isLoading={isLoading}
            onAdd={(label) => addOption("flavour", label)}
            onRename={editOption}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default TastePreferences;
