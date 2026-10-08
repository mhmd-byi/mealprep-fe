import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { FileUpload } from "../../../components";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { useAddMeal } from "./useAddMeal";
import { useMealLibrary } from "../Meal-Library/useMealLibrary";
import { MealItemForm, emptyMealItemForm } from "../Meal-Library/MealItemForm";
import { uploadFileToS3 } from "../../../utils/s3Upload";
import { ArrowLeft, ArrowRight, Check, Search, Plus, X, BookOpen } from "lucide-react";

const STEPS = [
  { key: 1, label: "Upload Menu" },
  { key: 2, label: "Add Items" },
  { key: 3, label: "Meal Details" },
  { key: 4, label: "Save to Library" },
  { key: 5, label: "Assign & Publish" },
];

const fieldClass = "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const getCurrentDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const buildFormFromLibraryItem = (libItem) => ({
  name: libItem.name,
  category: libItem.category,
  dietType: libItem.dietType,
  mealType: libItem.mealType,
  price: libItem.price ?? "",
  prepTimeMinutes: libItem.prepTimeMinutes ?? "",
  servingSize: libItem.servingSize || "",
  description: libItem.description || "",
  imageUrl: libItem.imageUrl || "",
  nutrition: {
    kcal: libItem.nutrition?.kcal ?? "",
    protein: libItem.nutrition?.protein ?? "",
    carbs: libItem.nutrition?.carbs ?? "",
    fat: libItem.nutrition?.fat ?? "",
  },
  customization: {
    proteins: libItem.customization?.proteins || [],
    carbs: libItem.customization?.carbs || [],
    veggies: libItem.customization?.veggies || [],
  },
  addOns: libItem.addOns || [],
  tags: libItem.tags || [],
  status: libItem.status || "active",
});

const AddMeal = () => {
  const navigate = useNavigate();
  const { publishMenu, isPublishing } = useAddMeal();
  const { items: libraryItems, categories, createItem, updateItem } = useMealLibrary();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(getCurrentDate());
  const [mealType, setMealType] = useState("lunch");
  const [referenceImages, setReferenceImages] = useState([]);
  const [dayItems, setDayItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [newItemName, setNewItemName] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [isSavingLibrary, setIsSavingLibrary] = useState(false);
  const [published, setPublished] = useState(false);

  const librarySuggestions = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    return libraryItems.filter(
      (it) => (it.mealType === mealType || it.mealType === "both") && (!q || it.name.toLowerCase().includes(q))
    );
  }, [libraryItems, librarySearch, mealType]);

  const addFromLibrary = (libItem) => {
    if (dayItems.some((d) => d.libraryId === libItem._id)) {
      toast.error("Already added.");
      return;
    }
    setDayItems((prev) => [...prev, { libraryId: libItem._id, imageFile: null, form: buildFormFromLibraryItem(libItem) }]);
    setLibrarySearch("");
  };

  const addNewItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    const form = { ...emptyMealItemForm(), name, mealType, category: categories[0]?.name || "" };
    setDayItems((prev) => {
      const next = [...prev, { libraryId: null, imageFile: null, form }];
      setSelectedIndex(next.length - 1);
      return next;
    });
    setNewItemName("");
  };

  const removeDayItem = (idx) => setDayItems((prev) => prev.filter((_, i) => i !== idx));

  const selectedItem = dayItems[selectedIndex] || null;

  const updateSelectedForm = (updater) =>
    setDayItems((prev) =>
      prev.map((d, i) => (i === selectedIndex ? { ...d, form: typeof updater === "function" ? updater(d.form) : updater } : d))
    );

  const setSelectedImageFile = (file) =>
    setDayItems((prev) => prev.map((d, i) => (i === selectedIndex ? { ...d, imageFile: file } : d)));

  const handleSaveToLibrary = async () => {
    try {
      setIsSavingLibrary(true);
      const updated = await Promise.all(
        dayItems.map(async (d) => {
          let imageUrl = d.form.imageUrl;
          if (d.imageFile) {
            const uploaded = await uploadFileToS3(d.imageFile);
            if (uploaded) imageUrl = uploaded;
          }
          const payload = {
            ...d.form,
            imageUrl,
            price: Number(d.form.price) || 0,
            prepTimeMinutes: Number(d.form.prepTimeMinutes) || undefined,
            nutrition: {
              kcal: Number(d.form.nutrition.kcal) || 0,
              protein: Number(d.form.nutrition.protein) || 0,
              carbs: Number(d.form.nutrition.carbs) || 0,
              fat: Number(d.form.nutrition.fat) || 0,
            },
          };
          if (d.libraryId) {
            await updateItem(d.libraryId, payload);
            return { ...d, form: { ...d.form, imageUrl }, imageFile: null };
          }
          const created = await createItem(payload);
          return { ...d, libraryId: created._id, form: { ...d.form, imageUrl }, imageFile: null };
        })
      );
      setDayItems(updated);
      toast.success("Saved to Meal Library.");
      setStep(5);
    } catch (err) {
      console.error("Error saving to meal library:", err);
      toast.error(err.response?.data?.message || "Failed to save to Meal Library.");
    } finally {
      setIsSavingLibrary(false);
    }
  };

  const handlePublish = async () => {
    try {
      const items = dayItems.map((d) => ({
        name: d.form.name,
        weight: d.form.servingSize || "1 serving",
        type: d.form.dietType,
        description: d.form.description || "",
      }));
      await publishMenu({ date, mealType, items, referenceImages });
      toast.success("Menu published for customers.");
      setPublished(true);
    } catch (err) {
      console.error("Error publishing menu:", err);
      toast.error(err.response?.data?.message || "Failed to publish menu.");
    }
  };

  const handleStartNew = () => {
    setStep(1);
    setDayItems([]);
    setReferenceImages([]);
    setSelectedIndex(0);
    setPublished(false);
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload Menu</h2>
              <p className="text-sm text-gray-500">
                Upload a reference photo, add items from your Meal Library (or create new ones), and publish.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/meal-library")}
              className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <BookOpen className="w-4 h-4" />
              Meal Library
            </button>
          </div>

          <div className="flex overflow-x-auto gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {STEPS.map((s) => (
              <div key={s.key} className="flex flex-1 gap-2 items-center min-w-[140px]">
                <div
                  className={`flex flex-shrink-0 justify-center items-center w-7 h-7 rounded-full text-xs font-bold ${
                    step === s.key ? "bg-theme-color-1 text-white" : step > s.key ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.key ? <Check className="w-4 h-4" /> : s.key}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${step === s.key ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={fieldClass}>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Upload a photo of today's menu. This is what customers actually see on the Food Menu page — the item
                  details you add in later steps are for your own records only.
                </p>
                <FileUpload
                  onFileChange={(files) => setReferenceImages(Array.isArray(files) ? files : files ? [files] : [])}
                  multiple
                  maxFiles={5}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                  >
                    Next: Add Items
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-500">Add from Meal Library</label>
                  <div className="relative">
                    <div className="flex gap-2 items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Search Meal Library..."
                        className="w-full text-sm focus:outline-none"
                      />
                    </div>
                    {librarySearch && (
                      <div className="overflow-y-auto absolute z-20 mt-1 w-full max-h-56 bg-white rounded-lg border border-gray-200 shadow-lg">
                        {librarySuggestions.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-gray-500">No matching items. Add a new one below.</p>
                        ) : (
                          librarySuggestions.map((it) => (
                            <button
                              key={it._id}
                              type="button"
                              onClick={() => addFromLibrary(it)}
                              className="flex gap-2 justify-between items-center px-3 py-2 w-full text-left hover:bg-gray-50"
                            >
                              <span className="text-sm text-gray-900">{it.name}</span>
                              <span className="text-xs text-gray-400">{it.category}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNewItem()}
                    placeholder="Or type a brand-new item name..."
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={addNewItem}
                    className="flex flex-shrink-0 gap-2 items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Today's Items ({dayItems.length})</p>
                  {dayItems.length === 0 ? (
                    <p className="py-6 text-sm text-center text-gray-400">No items added yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {dayItems.map((d, idx) => (
                        <div key={idx} className="flex gap-2 justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                          <div className="flex gap-2 items-center">
                            <VegNonVegIcon value={d.form.dietType} />
                            <span className="text-sm text-gray-900">{d.form.name}</span>
                            <span className="text-xs text-gray-400">{d.form.category || "No category"}</span>
                            {d.libraryId && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full">From Library</span>
                            )}
                          </div>
                          <button type="button" onClick={() => removeDayItem(idx)} className="p-1 text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={dayItems.length === 0}
                    onClick={() => { setSelectedIndex(0); setStep(3); }}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50"
                  >
                    Next: Meal Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  <div className="space-y-1 lg:col-span-1">
                    {dayItems.map((d, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                          idx === selectedIndex ? "bg-green-50 text-theme-color-1 font-semibold" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {d.form.name || "Untitled"}
                      </button>
                    ))}
                  </div>
                  <div className="lg:col-span-3">
                    {selectedItem ? (
                      <MealItemForm
                        form={selectedItem.form}
                        setForm={updateSelectedForm}
                        categories={categories}
                        imageFile={selectedItem.imageFile}
                        setImageFile={setSelectedImageFile}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Select an item to edit its details.</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                  >
                    Next: Save to Library
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Review the items below, then save them to your Meal Library so they can be reused on future days.
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Name", "Category", "Price", "Status"].map((h) => (
                          <th key={h} className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dayItems.map((d, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-gray-900">{d.form.name}</td>
                          <td className="px-3 py-2 text-gray-700">{d.form.category || "—"}</td>
                          <td className="px-3 py-2 text-gray-700">₹{d.form.price || 0}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${d.libraryId ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {d.libraryId ? "In Library" : "New"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    disabled={isSavingLibrary}
                    className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-60"
                  >
                    {isSavingLibrary ? "Saving..." : "Save to Library"}
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              published ? (
                <div className="p-6 text-center bg-green-50 rounded-xl border border-green-100">
                  <p className="text-lg font-bold text-gray-900">Your menu is ready!</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {dayItems.length} item(s) published for {formatDisplayDate(date)} ({mealType}).
                  </p>
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      type="button"
                      onClick={handleStartNew}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      Start New Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/meal-library")}
                      className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black"
                    >
                      View Meal Library
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formatDisplayDate(date)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Meal Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{mealType}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="font-semibold text-gray-900">{dayItems.length}</p>
                    </div>
                  </div>
                  <p className="p-3 text-xs text-amber-700 bg-amber-50 rounded-lg border border-amber-100">
                    Publishing uploads your reference photo(s) — that's what customers actually see — and saves this
                    item list to your own records. Customers don't see item-level prices, nutrition or customization.
                  </p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex gap-2 items-center px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={isPublishing || dayItems.length === 0}
                      className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                      {isPublishing ? "Publishing..." : "Publish Menu"}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default AddMeal;
