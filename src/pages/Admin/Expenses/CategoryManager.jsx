import { useState } from "react";
import Popup from "../../../components/common/Popup/Popup";

// The 8 validated categorical hues already used by the original fixed category
// list, plus the muted gray already used for "Other" — offered as quick picks.
// Colors beyond these aren't guaranteed distinguishable at a glance; the free
// color input covers anything past that.
const SWATCHES = [
  "#2a78d6", "#eb6834", "#1baf7a", "#eda100",
  "#e87ba4", "#008300", "#4a3aa7", "#e34948", "#898781",
];

const SubcategoryRow = ({ categoryId, subcategory, onRename, onDelete }) => {
  const [name, setName] = useState(subcategory.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === subcategory.name) {
      setName(subcategory.name);
      return;
    }
    try {
      setIsSaving(true);
      await onRename(categoryId, subcategory._id, trimmed);
    } catch (err) {
      console.error("Error renaming subcategory:", err);
      window.alert(err.response?.data?.message || "Failed to rename subcategory.");
      setName(subcategory.name);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white border rounded-full pl-3 pr-1.5 py-1">
      <input
        value={name}
        disabled={isSaving}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        className="text-xs w-24 bg-transparent focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onDelete(categoryId, subcategory._id)}
        className="text-gray-400 hover:text-red-600 text-xs leading-none px-1"
        title="Delete subcategory"
      >
        ✕
      </button>
    </div>
  );
};

const NewSubcategoryInput = ({ categoryId, onAdd }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setIsSaving(true);
      await onAdd(categoryId, name.trim());
      setName("");
    } catch (err) {
      console.error("Error adding subcategory:", err);
      window.alert(err.response?.data?.message || "Failed to add subcategory.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        value={name}
        disabled={isSaving}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="+ subcategory"
        className="text-xs w-24 border border-dashed rounded-full px-3 py-1 focus:outline-none focus:border-theme-color-1"
      />
      {name && (
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-semibold text-theme-color-1"
        >
          Add
        </button>
      )}
    </div>
  );
};

const CategoryRow = ({ category, onRename, onDelete, onAddSub, onRenameSub, onDeleteSub }) => {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [isSaving, setIsSaving] = useState(false);

  const saveIfChanged = async (nextName, nextColor) => {
    if (nextName === category.name && nextColor === category.color) return;
    if (!nextName.trim()) {
      setName(category.name);
      return;
    }
    try {
      setIsSaving(true);
      await onRename(category._id, { name: nextName.trim(), color: nextColor });
    } catch (err) {
      console.error("Error updating category:", err);
      window.alert(err.response?.data?.message || "Failed to update category.");
      setName(category.name);
      setColor(category.color);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          disabled={isSaving}
          onChange={(e) => { setColor(e.target.value); saveIfChanged(name, e.target.value); }}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0 flex-shrink-0"
          title="Category color"
        />
        <input
          value={name}
          disabled={isSaving}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => saveIfChanged(name, color)}
          className="flex-1 font-medium bg-transparent focus:outline-none focus:bg-white rounded px-1"
        />
        <button
          type="button"
          onClick={() => onDelete(category._id)}
          className="text-xs font-semibold text-red-600 hover:underline whitespace-nowrap"
        >
          Delete
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 pl-9">
        {category.subcategories.map((sub) => (
          <SubcategoryRow
            key={sub._id}
            categoryId={category._id}
            subcategory={sub}
            onRename={onRenameSub}
            onDelete={onDeleteSub}
          />
        ))}
        <NewSubcategoryInput categoryId={category._id} onAdd={onAddSub} />
      </div>
    </div>
  );
};

export const CategoryManager = ({
  isOpen,
  onClose,
  categories,
  addCategory,
  editCategory,
  removeCategory,
  addSubcategory,
  editSubcategory,
  removeSubcategory,
}) => {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(SWATCHES[SWATCHES.length - 1]);
  const [error, setError] = useState(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      setError("Category name is required.");
      return;
    }
    try {
      setIsSavingNew(true);
      setError(null);
      await addCategory(newName.trim(), newColor);
      setNewName("");
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.response?.data?.message || "Failed to add category.");
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    if (!window.confirm(`Delete category "${category?.name}"? Existing expenses already logged under it keep their category text — only future entries lose it from the picklist.`)) {
      return;
    }
    try {
      await removeCategory(categoryId);
    } catch (err) {
      console.error("Error deleting category:", err);
      window.alert(err.response?.data?.message || "Failed to delete category.");
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    try {
      await removeSubcategory(categoryId, subcategoryId);
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      window.alert(err.response?.data?.message || "Failed to delete subcategory.");
    }
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Categories"
      content={
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">New Category</p>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="flex items-center gap-2 mb-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setNewColor(swatch)}
                  className={`w-6 h-6 rounded-full border-2 ${newColor === swatch ? "border-gray-800" : "border-transparent"}`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                title="Custom color"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="Category name"
                className="flex-1 rounded-lg border-0 px-4 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 text-sm"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isSavingNew}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-theme-color-1 hover:bg-black"
              >
                {isSavingNew ? "Adding..." : "+ Add"}
              </button>
            </div>
          </div>

          <hr />

          <p className="text-xs text-gray-500">
            Click a color swatch or name to edit it (saves automatically). Deleting a category only removes it
            from the picklist — expenses already logged under it are unaffected.
          </p>

          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No categories yet — add one above.</p>
            ) : (
              categories.map((category) => (
                <CategoryRow
                  key={category._id}
                  category={category}
                  onRename={editCategory}
                  onDelete={handleDeleteCategory}
                  onAddSub={addSubcategory}
                  onRenameSub={editSubcategory}
                  onDeleteSub={handleDeleteSubcategory}
                />
              ))
            )}
          </div>
        </div>
      }
      buttons={[
        { label: "Close", onClick: onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
      ]}
    />
  );
};

export default CategoryManager;
