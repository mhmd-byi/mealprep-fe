import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { inputClass, outlineButton, primaryButton } from "./alacarteDisplay";
import { errorText, useAlacarteActions, useProductCategories } from "./useAlacarteAdmin";

const CategoryFormPopup = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || "");
  const [sortOrder, setSortOrder] = useState(category ? String(category.sortOrder || 0) : "0");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) return toast.error("A category name is required.");
    try {
      setIsSaving(true);
      await onSave({ name: name.trim(), sortOrder: Number(sortOrder) || 0 });
    } catch (error) {
      toast.error(errorText(error, "Could not save this category."));
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={isSaving ? () => {} : onClose}
      title={category ? "Edit category" : "Add category"}
      maxWidthClass="max-w-md"
      content={
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input className={inputClass} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Snacks" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Display order (lower shows first)</label>
            <input className={inputClass} type="number" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>
      }
      buttons={[
        { label: "Cancel", onClick: isSaving ? () => {} : onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : "Save",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export const CategoriesTab = () => {
  const { data: categories, isLoading } = useProductCategories();
  const { saveCategory, deleteCategory } = useAlacarteActions();
  const [form, setForm] = useState(null);

  const handleSave = async (payload) => {
    await saveCategory(form.category?._id, payload);
    toast.success(form.category ? "Category updated." : "Category added.");
    setForm(null);
  };

  const handleDelete = async (category) => {
    const warning = category.productCount > 0 ? ` ${category.productCount} product(s) will be left without a category.` : "";
    if (!window.confirm(`Delete "${category.name}"?${warning}`)) return;
    try {
      await deleteCategory(category._id);
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(errorText(error, "Could not delete this category."));
    }
  };

  const list = categories || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <p className="text-sm text-gray-500">Categories group products on the shop pages. Renaming one updates all its products.</p>
        <button type="button" className={`${primaryButton} flex gap-2 items-center`} onClick={() => setForm({ category: null })}>
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading categories...</p>
      ) : list.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No categories yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs tracking-wide text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{category.name}</td>
                  <td className="px-4 py-3 text-gray-600">{category.productCount}</td>
                  <td className="px-4 py-3 text-gray-600">{category.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => setForm({ category })}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && <CategoryFormPopup key={form.category?._id || "new"} category={form.category} onClose={() => setForm(null)} onSave={handleSave} />}
    </div>
  );
};

export default CategoriesTab;
