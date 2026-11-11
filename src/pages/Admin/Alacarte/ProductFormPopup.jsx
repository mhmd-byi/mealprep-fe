import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { CUTOFF_DAY_OPTIONS, DAY_OPTIONS, DIET_OPTIONS, inputClass } from "./alacarteDisplay";
import { errorText, uploadProductImage } from "./useAlacarteAdmin";

const MAX_IMAGES = 5;

const Label = ({ children }) => <label className="block mb-1 text-sm font-medium text-gray-700">{children}</label>;

const chipClass = (active) =>
  `px-3.5 py-1.5 text-sm font-semibold rounded-full border ${
    active ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
  }`;

export const ProductFormPopup = ({ product, categories, onClose, onSave }) => {
  const isEditing = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ? String(product.compareAtPrice) : "");
  const [dietType, setDietType] = useState(product?.dietType || "veg");
  const [category, setCategory] = useState(product?.category || "");
  const [images, setImages] = useState((product?.images || []).map((image) => image.url));
  const [isActive, setIsActive] = useState(product ? product.isActive : true);
  const [trackStock, setTrackStock] = useState(product?.trackStock || false);
  const [stock, setStock] = useState(product ? String(product.stock || 0) : "0");
  const [availableDays, setAvailableDays] = useState(product?.availableDays?.length ? product.availableDays : [1, 2, 3, 4, 5, 6]);
  const [cutoffDaysBefore, setCutoffDaysBefore] = useState(product ? product.cutoffDaysBefore ?? 1 : 1);
  const [cutoffTime, setCutoffTime] = useState(product?.cutoffTime || "18:00");
  const [sortOrder, setSortOrder] = useState(product ? String(product.sortOrder || 0) : "0");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryNames = categories.map((item) => item.name);
  const categoryChoices = category && !categoryNames.includes(category) ? [...categoryNames, category] : categoryNames;

  const handleFiles = async (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (picked.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (picked.length > room) toast.error(`You can add up to ${MAX_IMAGES} photos.`);

    const accepted = picked.slice(0, Math.max(0, room)).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image.`);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    setIsUploading(true);
    for (const file of accepted) {
      try {
        const url = await uploadProductImage(file);
        setImages((current) => [...current, url]);
      } catch (error) {
        toast.error(errorText(error, `Could not upload "${file.name}".`));
      }
    }
    setIsUploading(false);
  };

  const toggleDay = (day) =>
    setAvailableDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) return toast.error("A product name is required.");
    const numericPrice = Number(price);
    if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 0) return toast.error("Enter a valid price.");
    if (compareAtPrice !== "" && Number(compareAtPrice) <= numericPrice) return toast.error("The old price must be higher than the price.");
    if (availableDays.length === 0) return toast.error("Choose at least one delivery day.");
    if (isUploading) return toast.error("Please wait for the photos to finish uploading.");

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice),
        dietType,
        category,
        images,
        isActive,
        trackStock,
        stock: trackStock ? Number(stock) || 0 : 0,
        availableDays,
        cutoffDaysBefore,
        cutoffTime,
        sortOrder: Number(sortOrder) || 0,
      });
    } catch (error) {
      toast.error(errorText(error, "Could not save this product."));
      setIsSaving(false);
    }
  };

  return (
    <Popup
      isOpen
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "Edit product" : "Add product"}
      maxWidthClass="max-w-2xl"
      content={
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <input className={inputClass} value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="e.g. Veg Sandwich" />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              className={`${inputClass} resize-y`}
              rows={3}
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short line customers will read"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Price (₹)</Label>
              <input className={inputClass} type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label>Old price (₹, optional)</Label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Shown struck through"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Diet</Label>
              <div className="flex gap-2">
                {DIET_OPTIONS.map((option) => (
                  <button key={option.value} type="button" onClick={() => setDietType(option.value)} className={chipClass(dietType === option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">No category</option>
                {categoryChoices.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Photos (up to {MAX_IMAGES}, the first one is the main photo)</Label>
            <div className="flex flex-wrap gap-3 items-center">
              {images.map((url, index) => (
                <div key={url} className="relative w-20 h-20">
                  <img src={url} alt={`Product ${index + 1}`} className="object-cover w-20 h-20 rounded-lg border border-gray-200" />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 px-1.5 py-0.5 text-[10px] font-semibold text-white bg-theme-color-1 rounded-tr-lg rounded-bl-lg">Main</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((item) => item !== url))}
                    className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-white bg-gray-800 rounded-full hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label
                  className={`flex flex-col gap-1 justify-center items-center w-20 h-20 text-xs font-semibold text-gray-500 rounded-lg border-2 border-dashed border-gray-300 ${
                    isUploading ? "opacity-60" : "cursor-pointer hover:border-theme-color-1 hover:text-theme-color-1"
                  }`}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                  {isUploading ? "Uploading" : "Add"}
                  <input type="file" accept="image/*" multiple className="hidden" disabled={isUploading} onChange={handleFiles} />
                </label>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="flex gap-2 items-center text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={trackStock} onChange={(e) => setTrackStock(e.target.checked)} className="w-4 h-4 accent-green-600" />
              Keep a stock count (sold out when it reaches zero)
            </label>
            {trackStock && (
              <div className="max-w-[12rem]">
                <Label>Stock</Label>
                <input className={inputClass} type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            )}
          </div>

          <div className="p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <Label>Delivered on these days (Sundays are always closed)</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={chipClass(availableDays.includes(day.value))}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Ordering closes</Label>
                <select className={inputClass} value={cutoffDaysBefore} onChange={(e) => setCutoffDaysBefore(Number(e.target.value))}>
                  {CUTOFF_DAY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>At (India time)</Label>
                <input type="time" className={inputClass} value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Display order (lower shows first)</Label>
              <input className={inputClass} type="number" step="1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
            <label className="flex gap-2 items-center mt-6 text-sm font-semibold text-gray-800 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-green-600" />
              Visible to customers
            </label>
          </div>
        </div>
      }
      buttons={[
        { label: "Cancel", onClick: isSaving ? () => {} : onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isSaving ? "Saving..." : isEditing ? "Save changes" : "Add product",
          onClick: handleSave,
          className: "bg-theme-color-1 text-white hover:bg-black",
        },
      ]}
    />
  );
};

export default ProductFormPopup;
