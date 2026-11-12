import { useState } from "react";
import { toast } from "sonner";
import Popup from "../../../components/common/Popup/Popup";
import { PLAN_COLOR_CHOICES } from "../../../plans";
import { errorText } from "./useCarbTypesAdmin";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const MACROS = [
  { key: "protein", label: "Protein (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fat", label: "Fat (g)" },
  { key: "fiber", label: "Fibre (g)" },
  { key: "kcal", label: "Calories (kcal)" },
];

const Label = ({ children, hint }) => (
  <div className="mb-1">
    <label className="block text-sm font-medium text-gray-700">{children}</label>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const macroText = (macro) => ({
  min: macro ? String(macro.min) : "",
  max: macro && macro.max !== null && macro.max !== undefined ? String(macro.max) : "",
});

export const CarbTypeFormPopup = ({ carbType, onClose, onSave }) => {
  const isEditing = Boolean(carbType);
  const [name, setName] = useState(carbType?.name || "");
  const [shortCode, setShortCode] = useState(carbType?.shortCode || "");
  const [color, setColor] = useState(carbType?.color || PLAN_COLOR_CHOICES[0]);
  const [nutrition, setNutrition] = useState(() =>
    Object.fromEntries(MACROS.map(({ key }) => [key, macroText(carbType?.nutrition?.[key])]))
  );
  const [sortOrder, setSortOrder] = useState(carbType ? String(carbType.sortOrder || 0) : "0");
  const [websiteName, setWebsiteName] = useState(carbType?.websiteName || "");
  const [websiteBlurb, setWebsiteBlurb] = useState(carbType?.websiteBlurb || "");
  const [showOnWebsite, setShowOnWebsite] = useState(carbType?.showOnWebsite || false);
  const [isActive, setIsActive] = useState(carbType ? carbType.isActive : true);
  const [isSaving, setIsSaving] = useState(false);

  const subscribers = carbType?.subscriberCount || 0;

  const updateMacro = (key, part, value) =>
    setNutrition((current) => ({ ...current, [key]: { ...current[key], [part]: value } }));

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) return toast.error("A name is required.");

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        shortCode: shortCode.trim(),
        color,
        nutrition,
        sortOrder: Number(sortOrder) || 0,
        websiteName: websiteName.trim(),
        websiteBlurb: websiteBlurb.trim(),
        showOnWebsite,
        isActive,
      });
    } catch (error) {
      toast.error(errorText(error, "Could not save this carb type."));
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "Edit carb type" : "Add carb type"}
      maxWidthClass="max-w-2xl"
      content={
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label>Name</Label>
              <input className={inputClass} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vegan Protein Bowl" />
              {isEditing && subscribers > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {subscribers} subscription{subscribers === 1 ? "" : "s"} use this. Renaming only changes the name they see.
                </p>
              )}
            </div>
            <div>
              <Label hint="Used on delivery labels">Short code</Label>
              <input className={inputClass} value={shortCode} maxLength={6} onChange={(e) => setShortCode(e.target.value.toUpperCase())} placeholder="LCHP" />
            </div>
          </div>

          <div>
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {PLAN_COLOR_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setColor(choice)}
                  className={`w-7 h-7 rounded-full border-2 ${color === choice ? "border-gray-900" : "border-transparent"}`}
                  style={{ backgroundColor: choice }}
                  aria-label={`Colour ${choice}`}
                />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 bg-transparent border-0 cursor-pointer" aria-label="Custom colour" />
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: `${color}22`, color }}>
                {name.trim() || "Carb type"}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">Nutrition per meal</p>
              <p className="text-xs text-gray-500">Fill in one number for an approximate value, or both for a range. Leave a row empty to hide it. Delivery labels need protein, carbs, fat and calories.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {MACROS.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-3 gap-3 items-center">
                  <span className="text-sm text-gray-700">{label}</span>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    value={nutrition[key].min}
                    onChange={(e) => updateMacro(key, "min", e.target.value)}
                    placeholder="Value / lowest"
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    value={nutrition[key].max}
                    onChange={(e) => updateMacro(key, "max", e.target.value)}
                    placeholder="Highest (optional)"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="flex gap-2 items-center text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.checked)} className="w-4 h-4 accent-green-600" />
              Show on the website's Plans &amp; Pricing page
            </label>
            {showOnWebsite && (
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label hint="Defaults to the name above">Website name</Label>
                  <input className={inputClass} value={websiteName} maxLength={60} onChange={(e) => setWebsiteName(e.target.value)} />
                </div>
                <div>
                  <Label hint="One short line under the nutrition figures">Description</Label>
                  <input className={inputClass} value={websiteBlurb} maxLength={200} onChange={(e) => setWebsiteBlurb(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label hint="Lower shows first. The first one is pre-selected for customers.">Display order</Label>
              <input className={inputClass} type="number" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
            <label className="flex gap-2 items-center mt-6 text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-green-600" />
              Available to choose
            </label>
          </div>
        </div>
      }
      buttons={[
        { label: "Cancel", onClick: isSaving ? () => {} : onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : isEditing ? "Save changes" : "Add carb type",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export default CarbTypeFormPopup;
