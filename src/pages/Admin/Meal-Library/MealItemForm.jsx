import { useState } from "react";
import { X, Plus } from "lucide-react";
import { FileUpload } from "../../../components";

export const emptyMealItemForm = () => ({
  name: "",
  category: "",
  dietType: "veg",
  mealType: "lunch",
  price: "",
  prepTimeMinutes: "",
  servingSize: "",
  description: "",
  imageUrl: "",
  nutrition: { kcal: "", protein: "", carbs: "", fat: "" },
  customization: { proteins: [], carbs: [], veggies: [] },
  addOns: [],
  tags: [],
  status: "active",
});

const FORM_TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "nutrition", label: "Nutrition & Ingredients" },
  { key: "customization", label: "Customization" },
  { key: "tags", label: "Tags" },
];

const fieldClass = "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const OptionGroup = ({ title, required, options, onChange }) => {
  const updateOption = (idx, patch) => onChange(options.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  const addOption = () => onChange([...options, { name: "", priceDelta: 0, isDefault: options.length === 0 }]);
  const removeOption = (idx) => onChange(options.filter((_, i) => i !== idx));
  const setDefault = (idx) => onChange(options.map((o, i) => ({ ...o, isDefault: i === idx })));

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">
        Choose {title} {required && <span className="text-xs font-normal text-gray-400">(Required)</span>}
      </p>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="radio"
              name={`${title}-default`}
              checked={!!opt.isDefault}
              onChange={() => setDefault(idx)}
              title="Default choice"
            />
            <input
              value={opt.name}
              onChange={(e) => updateOption(idx, { name: e.target.value })}
              placeholder="Option name"
              className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300"
            />
            <input
              type="number"
              value={opt.priceDelta}
              onChange={(e) => updateOption(idx, { priceDelta: Number(e.target.value) })}
              placeholder="+Price"
              className="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-300"
            />
            <button type="button" onClick={() => removeOption(idx)} className="p-1 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addOption} className="flex gap-1 items-center mt-2 text-xs font-semibold text-theme-color-1">
        <Plus className="w-3 h-3" />
        Add option
      </button>
    </div>
  );
};

const AddOnGroup = ({ addOns, onChange }) => {
  const updateAddOn = (idx, patch) => onChange(addOns.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  const addRow = () => onChange([...addOns, { name: "", price: 0 }]);
  const removeRow = (idx) => onChange(addOns.filter((_, i) => i !== idx));

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-700">Add-ons <span className="text-xs font-normal text-gray-400">(Optional)</span></p>
      <div className="space-y-2">
        {addOns.map((addOn, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              value={addOn.name}
              onChange={(e) => updateAddOn(idx, { name: e.target.value })}
              placeholder="Add-on name"
              className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300"
            />
            <input
              type="number"
              value={addOn.price}
              onChange={(e) => updateAddOn(idx, { price: Number(e.target.value) })}
              placeholder="Price"
              className="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-300"
            />
            <button type="button" onClick={() => removeRow(idx)} className="p-1 text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="flex gap-1 items-center mt-2 text-xs font-semibold text-theme-color-1">
        <Plus className="w-3 h-3" />
        Add add-on
      </button>
    </div>
  );
};

const TagInput = ({ tags, onChange }) => {
  const [value, setValue] = useState("");
  const addTag = () => {
    const v = value.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setValue("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((t) => (
          <span key={t} className="flex gap-1.5 items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && <p className="text-sm text-gray-400">No tags yet.</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder="e.g. high-protein, spicy..."
          className={fieldClass}
        />
        <button type="button" onClick={addTag} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Add
        </button>
      </div>
    </div>
  );
};

export const MealItemForm = ({ form, setForm, categories, imageFile, setImageFile }) => {
  const [formTab, setFormTab] = useState("basic");
  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const updateNutrition = (patch) => setForm((prev) => ({ ...prev, nutrition: { ...prev.nutrition, ...patch } }));
  const updateCustomization = (key, value) => setForm((prev) => ({ ...prev, customization: { ...prev.customization, [key]: value } }));

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex overflow-hidden flex-shrink-0 justify-center items-center w-20 h-20 bg-gray-100 rounded-xl border border-gray-200">
          {imageFile ? (
            <img src={URL.createObjectURL(imageFile)} alt={form.name || "Meal"} className="object-cover w-full h-full" />
          ) : form.imageUrl ? (
            <img src={form.imageUrl} alt={form.name || "Meal"} className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>
        <div className="flex-1">
          <input
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Meal item name"
            className={`${fieldClass} text-base font-semibold`}
          />
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 rounded-xl">
        {FORM_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFormTab(tab.key)}
            className={`px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-lg transition-colors ${
              formTab === tab.key ? "bg-white text-theme-color-1 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {formTab === "basic" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => update({ price: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Preparation Time (mins)</label>
              <input type="number" value={form.prepTimeMinutes} onChange={(e) => update({ prepTimeMinutes: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Category</label>
              <select value={form.category} onChange={(e) => update({ category: e.target.value })} className={fieldClass}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Meal Type</label>
              <select value={form.mealType} onChange={(e) => update({ mealType: e.target.value })} className={fieldClass}>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Diet Type</label>
              <select value={form.dietType} onChange={(e) => update({ dietType: e.target.value })} className={fieldClass}>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Serving Size</label>
              <input value={form.servingSize} onChange={(e) => update({ servingSize: e.target.value })} placeholder="e.g. 250g" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              maxLength={500}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-right text-gray-400">{form.description.length}/500</p>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Photo (optional)</label>
            <FileUpload onFileChange={(file) => setImageFile(file)} multiple={false} />
          </div>
        </div>
      )}

      {formTab === "nutrition" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["kcal", "Calories (kcal)"],
            ["protein", "Protein (g)"],
            ["carbs", "Carbs (g)"],
            ["fat", "Fat (g)"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block mb-1 text-xs font-medium text-gray-500">{label}</label>
              <input
                type="number"
                value={form.nutrition[key]}
                onChange={(e) => updateNutrition({ [key]: e.target.value })}
                className={fieldClass}
              />
            </div>
          ))}
          <p className="col-span-2 text-xs text-gray-400 sm:col-span-4">
            Entered by hand — there's no nutrition database or AI estimate behind this.
          </p>
        </div>
      )}

      {formTab === "customization" && (
        <div className="space-y-5">
          <OptionGroup title="Protein" required options={form.customization.proteins} onChange={(v) => updateCustomization("proteins", v)} />
          <OptionGroup title="Carb" required options={form.customization.carbs} onChange={(v) => updateCustomization("carbs", v)} />
          <OptionGroup title="Veggies" options={form.customization.veggies} onChange={(v) => updateCustomization("veggies", v)} />
          <AddOnGroup addOns={form.addOns} onChange={(v) => update({ addOns: v })} />
        </div>
      )}

      {formTab === "tags" && <TagInput tags={form.tags} onChange={(v) => update({ tags: v })} />}
    </div>
  );
};

export default MealItemForm;
