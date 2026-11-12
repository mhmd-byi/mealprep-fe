import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { PLAN_COLOR_CHOICES } from "../../../plans";
import { uploadAdminImage } from "../../../utils/imageUpload";
import { errorText } from "./usePlansAdmin";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const MAX_FEATURES = 8;

const Label = ({ children, hint }) => (
  <div className="mb-1">
    <label className="block text-sm font-medium text-gray-700">{children}</label>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

export const PlanFormPopup = ({ plan, onClose, onSave }) => {
  const isEditing = Boolean(plan);
  const [name, setName] = useState(plan?.name || "");
  const [price, setPrice] = useState(plan ? String(plan.price) : "");
  const [meals, setMeals] = useState(plan ? String(plan.meals) : "");
  const [period, setPeriod] = useState(plan?.period || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [features, setFeatures] = useState(plan?.features?.length ? plan.features : [""]);
  const [color, setColor] = useState(plan?.color || PLAN_COLOR_CHOICES[0]);
  const [sortOrder, setSortOrder] = useState(plan ? String(plan.sortOrder || 0) : "0");
  const [websiteTitle, setWebsiteTitle] = useState(plan?.websiteTitle || "");
  const [validityText, setValidityText] = useState(plan?.validityText || "");
  const [imageUrl, setImageUrl] = useState(plan?.imageUrl || "");
  const [isActive, setIsActive] = useState(plan ? plan.isActive : true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const subscribers = plan?.subscriberCount || 0;
  const priceChanged = isEditing && (Number(price) !== plan.price || Number(meals) !== plan.meals);
  const renamed = isEditing && name.trim() !== plan.name;

  const updateFeature = (index, value) => setFeatures((current) => current.map((item, position) => (position === index ? value : item)));

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image.");
    try {
      setIsUploading(true);
      setImageUrl(await uploadAdminImage(file, "plan"));
    } catch (error) {
      toast.error(errorText(error, "Could not upload the image."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) return toast.error("A plan name is required.");
    const numericPrice = Number(price);
    if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 1) return toast.error("Enter a price of at least ₹1.");
    const numericMeals = Number(meals);
    if (!Number.isInteger(numericMeals) || numericMeals < 1 || numericMeals > 200) return toast.error("Meals must be a whole number from 1 to 200.");
    if (isUploading) return toast.error("Please wait for the image to finish uploading.");

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        price: numericPrice,
        meals: numericMeals,
        period: period.trim(),
        description: description.trim(),
        features: features.map((item) => item.trim()).filter(Boolean),
        color,
        sortOrder: Number(sortOrder) || 0,
        websiteTitle: websiteTitle.trim(),
        validityText: validityText.trim(),
        imageUrl,
        isActive,
      });
    } catch (error) {
      toast.error(errorText(error, "Could not save this plan."));
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "Edit plan" : "Add plan"}
      maxWidthClass="max-w-2xl"
      content={
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <input className={inputClass} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quarterly Plan" />
            {renamed && subscribers > 0 && (
              <p className="mt-1 text-xs text-amber-700">This renames the plan on {subscribers} existing subscription{subscribers === 1 ? "" : "s"} too.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label hint="For lunch OR dinner">Price (₹)</Label>
              <input className={inputClass} type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label hint="Meals included">Meals</Label>
              <input className={inputClass} type="number" min="1" max="200" step="1" value={meals} onChange={(e) => setMeals(e.target.value)} />
            </div>
            <div>
              <Label hint="Shown after the meals, e.g. Weekly">Period</Label>
              <input className={inputClass} value={period} maxLength={20} onChange={(e) => setPeriod(e.target.value)} placeholder="Weekly" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Customers who choose lunch and dinner both pay double and get double the meals. Price changes apply to new purchases only. Existing subscribers keep what they paid.
          </p>
          {priceChanged && subscribers > 0 && (
            <p className="p-3 text-sm text-amber-800 bg-amber-50 rounded-lg">
              {subscribers} customer{subscribers === 1 ? " has" : "s have"} subscribed to this plan. Their revenue stays at the price they paid.
            </p>
          )}

          <div>
            <Label>Short description</Label>
            <input className={inputClass} value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} placeholder="Best to know us" />
          </div>

          <div>
            <Label hint={`Up to ${MAX_FEATURES}`}>Features</Label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input className={inputClass} value={feature} maxLength={120} onChange={(e) => updateFeature(index, e.target.value)} placeholder="e.g. Real food, real ingredients" />
                  <button
                    type="button"
                    onClick={() => setFeatures((current) => (current.length > 1 ? current.filter((_, position) => position !== index) : [""]))}
                    className="px-2 text-gray-400 hover:text-red-600"
                    aria-label="Remove feature"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {features.length < MAX_FEATURES && (
                <button type="button" onClick={() => setFeatures((current) => [...current, ""])} className="flex gap-1.5 items-center text-sm font-semibold text-theme-color-1">
                  <Plus className="w-4 h-4" />
                  Add feature
                </button>
              )}
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
                {name.trim() || "Plan"}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">On the website (optional)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label hint="Defaults to the plan name">Website title</Label>
                <input className={inputClass} value={websiteTitle} maxLength={80} onChange={(e) => setWebsiteTitle(e.target.value)} />
              </div>
              <div>
                <Label hint="e.g. Valid for 7 days">Validity text</Label>
                <input className={inputClass} value={validityText} maxLength={80} onChange={(e) => setValidityText(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Card image</Label>
              <div className="flex gap-3 items-center">
                {imageUrl ? (
                  <div className="relative w-24 h-16">
                    <img src={imageUrl} alt="Plan" className="object-cover w-24 h-16 rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-white bg-gray-800 rounded-full hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col gap-1 justify-center items-center w-24 h-16 text-xs font-semibold text-gray-500 rounded-lg border-2 border-dashed border-gray-300 ${
                      isUploading ? "opacity-60" : "cursor-pointer hover:border-theme-color-1 hover:text-theme-color-1"
                    }`}
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                    {isUploading ? "Uploading" : "Add"}
                    <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handleImage} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label hint="Lower shows first">Display order</Label>
              <input className={inputClass} type="number" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
            <label className="flex gap-2 items-center mt-6 text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-green-600" />
              Available to buy
            </label>
          </div>
        </div>
      }
      buttons={[
        { label: "Cancel", onClick: isSaving ? () => {} : onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : isEditing ? "Save changes" : "Add plan",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export default PlanFormPopup;
