import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { CATEGORY_ICONS, CATEGORY_SWATCHES } from "./noteDisplay";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

export const CategoryFormPopup = ({ category, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || CATEGORY_SWATCHES[0]);
  const [icon, setIcon] = useState(category?.icon || "StickyNote");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    try {
      setIsSaving(true);
      await onSave({ name: name.trim(), color, icon });
    } catch (err) {
      console.error("Error saving note category:", err);
      toast.error(err.response?.data?.message || "Failed to save category.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${category.name}"? Existing notes keep this category label — it just stops being offered as a choice.`)) {
      return;
    }
    try {
      setIsSaving(true);
      await onDelete(category);
    } catch (err) {
      console.error("Error deleting note category:", err);
      toast.error(err.response?.data?.message || "Failed to delete category.");
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={onClose}
      title={category ? "Edit Category" : "New Category"}
      maxWidthClass="max-w-md"
      content={
        <div className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input
              className={inputClass}
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kitchen / Production"
            />
            {category && (
              <p className="mt-1 text-xs text-gray-400">Renaming also updates every note already in this category.</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Colour</label>
            <div className="flex flex-wrap gap-2 items-center">
              {CATEGORY_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`w-7 h-7 rounded-full border-2 ${color === swatch ? "border-gray-800" : "border-transparent"}`}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Colour ${swatch}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded border-0 cursor-pointer"
                title="Custom colour"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {Object.entries(CATEGORY_ICONS).map(([iconName, Icon]) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  title={iconName}
                  className={`flex justify-center items-center w-9 h-9 rounded-lg border ${
                    icon === iconName ? "text-white border-transparent" : "text-gray-600 bg-white border-gray-200 hover:border-gray-400"
                  }`}
                  style={icon === iconName ? { backgroundColor: color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      footerLeft={
        category && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )
      }
      buttons={[
        { label: "Cancel", onClick: onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : "Save",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export default CategoryFormPopup;
