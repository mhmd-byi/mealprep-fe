import { useState } from "react";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useMealCategories } from "./useMealCategories";
import { Trash2 } from "lucide-react";

const SWATCHES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948", "#898781"];

const CategoryRow = ({ category, onRename, onDelete }) => {
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
      toast.success("Category updated.");
    } catch (err) {
      console.error("Error updating meal category:", err);
      toast.error(err.response?.data?.message || "Failed to update category.");
      setName(category.name);
      setColor(category.color);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-3 items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <input
        type="color"
        value={color}
        disabled={isSaving}
        onChange={(e) => { setColor(e.target.value); saveIfChanged(name, e.target.value); }}
        className="w-8 h-8 rounded border-0 cursor-pointer"
        title="Category color"
      />
      <input
        value={name}
        disabled={isSaving}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => saveIfChanged(name, color)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="flex-1 font-semibold text-gray-900 bg-transparent focus:outline-none"
      />
      <button type="button" onClick={() => onDelete(category)} className="p-2 text-red-500 rounded-lg hover:bg-red-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const MealCategories = () => {
  const { categories, isLoading, addCategory, editCategory, removeCategory } = useMealCategories();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(SWATCHES[SWATCHES.length - 1]);
  const [isSavingNew, setIsSavingNew] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    try {
      setIsSavingNew(true);
      await addCategory(newName.trim(), newColor);
      setNewName("");
      toast.success("Category added.");
    } catch (err) {
      console.error("Error adding meal category:", err);
      toast.error(err.response?.data?.message || "Failed to add category.");
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? Existing Meal Library items keep their category text — only future items lose it from the picklist.`)) {
      return;
    }
    try {
      await removeCategory(category._id);
      toast.success("Category deleted.");
    } catch (err) {
      console.error("Error deleting meal category:", err);
      toast.error(err.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meal Categories</h2>
            <p className="text-sm text-gray-500">Organize your Meal Library into categories like Protein, Carbs and Salad.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-gray-700">New Category</p>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setNewColor(swatch)}
                  className={`w-7 h-7 rounded-full border-2 ${newColor === swatch ? "border-gray-800" : "border-transparent"}`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer" title="Custom color" />
            </div>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Category name (e.g. Protein)"
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
              <p className="text-sm text-gray-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="py-10 text-center text-gray-500">No categories yet — add one above.</p>
            ) : (
              categories.map((category) => (
                <CategoryRow key={category._id} category={category} onRename={editCategory} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default MealCategories;
