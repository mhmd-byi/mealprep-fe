import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import Popup from "../../../components/common/Popup/Popup";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { useMealLibrary } from "./useMealLibrary";
import { MealItemForm, emptyMealItemForm } from "./MealItemForm";
import { uploadFileToS3 } from "../../../utils/s3Upload";
import { Pencil, Trash2, Search, UploadCloud } from "lucide-react";

const fieldClass = "px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const colorFor = (categories, name) => categories.find((c) => c.name === name)?.color || "#898781";

export const MealLibrary = () => {
  const navigate = useNavigate();
  const { items, categories, isLoading, createItem, updateItem, removeItem } = useMealLibrary();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [mealTypeFilter, setMealTypeFilter] = useState("All");
  const [dietFilter, setDietFilter] = useState("All");

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyMealItemForm());
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const filteredItems = items.filter((item) => {
    const searchMatch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = categoryFilter === "All" || item.category === categoryFilter;
    const mealTypeMatch = mealTypeFilter === "All" || item.mealType === mealTypeFilter || item.mealType === "both";
    const dietMatch = dietFilter === "All" || item.dietType === dietFilter;
    return searchMatch && categoryMatch && mealTypeMatch && dietMatch;
  });

  const grouped = filteredItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyMealItemForm());
    setImageFile(null);
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      dietType: item.dietType,
      mealType: item.mealType,
      price: item.price ?? "",
      prepTimeMinutes: item.prepTimeMinutes ?? "",
      servingSize: item.servingSize || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      nutrition: {
        kcal: item.nutrition?.kcal ?? "",
        protein: item.nutrition?.protein ?? "",
        carbs: item.nutrition?.carbs ?? "",
        fat: item.nutrition?.fat ?? "",
      },
      customization: {
        proteins: item.customization?.proteins || [],
        carbs: item.customization?.carbs || [],
        veggies: item.customization?.veggies || [],
      },
      addOns: item.addOns || [],
      tags: item.tags || [],
      status: item.status || "active",
    });
    setImageFile(null);
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category) {
      setFormError("Name and category are required.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const uploaded = await uploadFileToS3(imageFile);
        if (uploaded) imageUrl = uploaded;
      }
      const payload = {
        ...form,
        imageUrl,
        price: Number(form.price) || 0,
        prepTimeMinutes: Number(form.prepTimeMinutes) || undefined,
        nutrition: {
          kcal: Number(form.nutrition.kcal) || 0,
          protein: Number(form.nutrition.protein) || 0,
          carbs: Number(form.nutrition.carbs) || 0,
          fat: Number(form.nutrition.fat) || 0,
        },
      };
      if (editingId) {
        await updateItem(editingId, payload);
        toast.success("Meal item updated.");
      } else {
        await createItem(payload);
        toast.success("Meal item added to the library.");
      }
      setIsOpen(false);
    } catch (err) {
      console.error("Error saving meal library item:", err);
      setFormError(err.response?.data?.message || "Failed to save meal item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from the Meal Library?`)) return;
    try {
      await removeItem(item._id);
      toast.success("Meal item deleted.");
    } catch (err) {
      console.error("Error deleting meal library item:", err);
      toast.error(err.response?.data?.message || "Failed to delete meal item.");
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Meal Library</h2>
              <p className="text-sm text-gray-500">Reusable meal items with pricing, nutrition and customization — build once, reuse on any day's menu.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate("/dashboard/add-menu")} className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                <UploadCloud className="w-4 h-4" />
                Upload Menu
              </button>
              <button type="button" onClick={openAdd} className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black">
                + Add Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-2 items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
              <Search className="w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meal items..." className="w-full text-sm focus:outline-none" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={fieldClass}>
              <option value="All">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={mealTypeFilter} onChange={(e) => setMealTypeFilter(e.target.value)} className={fieldClass}>
              <option value="All">All Meal Types</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="both">Both</option>
            </select>
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)} className={fieldClass}>
              <option value="All">All Diet Types</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Loading meal library...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="py-10 text-center text-gray-500">No meal items found. Add one to get started.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, categoryItems]) => (
                <div key={category} className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex gap-2 items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorFor(categories, category) }} />
                    <p className="text-sm font-bold text-gray-900">{category}</p>
                    <span className="text-xs text-gray-500">({categoryItems.length} item{categoryItems.length !== 1 ? "s" : ""})</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categoryItems.map((item) => (
                      <div key={item._id} className="flex gap-3 items-center px-4 py-3">
                        <div className="flex overflow-hidden flex-shrink-0 justify-center items-center w-12 h-12 bg-gray-100 rounded-lg">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                          ) : (
                            <VegNonVegIcon value={item.dietType} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
                            {item.nutrition?.kcal ? ` · ${item.nutrition.kcal} kcal` : ""}
                            {item.servingSize ? ` · ${item.servingSize}` : ""}
                          </p>
                        </div>
                        <VegNonVegIcon value={item.dietType} />
                        <p className="w-16 text-sm font-semibold text-right text-gray-900">₹{item.price || 0}</p>
                        <button type="button" onClick={() => openEdit(item)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(item)} className="p-2 text-red-500 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? "Edit Meal Item" : "Add Meal Item"}
        maxWidthClass="max-w-2xl"
        content={
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <MealItemForm form={form} setForm={setForm} categories={categories} imageFile={imageFile} setImageFile={setImageFile} />
          </div>
        }
        buttons={[
          { label: "Cancel", onClick: () => setIsOpen(false), className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
          { label: isSaving ? "Saving..." : "Save Changes", onClick: handleSave, className: "bg-theme-color-1 text-white hover:bg-black" },
        ]}
      />
    </DashboardLayoutComponent>
  );
};

export default MealLibrary;
