import { useState } from "react";
import { toast } from "sonner";
import { inputClass, primaryButton, SLOT_LABELS } from "./alacarteDisplay";
import { errorText, useAlacarteActions, useAlacarteSettings } from "./useAlacarteAdmin";

const SettingsForm = ({ initialFee }) => {
  const { saveSettings } = useAlacarteActions();
  const [fee, setFee] = useState(String(initialFee ?? 0));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const numeric = Number(fee);
    if (fee === "" || !Number.isFinite(numeric) || numeric < 0 || numeric > 5000) return toast.error("Enter a fee between ₹0 and ₹5000.");
    try {
      setIsSaving(true);
      await saveSettings({ middayFee: numeric });
      toast.success("Delivery fee saved.");
    } catch (error) {
      toast.error(errorText(error, "Could not save the delivery fee."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5 max-w-xl bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h3 className="font-bold text-gray-900">Delivery slots</h3>
        <p className="text-sm text-gray-500">Customers pick a date (Monday to Saturday) and one of these slots.</p>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">{SLOT_LABELS.morning}</span>
          <span className="font-semibold text-green-700">Free</span>
        </li>
        <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">{SLOT_LABELS.midday}</span>
          <span className="font-semibold text-gray-900">Extra fee below</span>
        </li>
        <li className="flex justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">{SLOT_LABELS.evening}</span>
          <span className="font-semibold text-green-700">Free</span>
        </li>
      </ul>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Extra fee for the 12:00 PM – 4:00 PM slot (₹)</label>
        <input className={`${inputClass} max-w-[12rem]`} type="number" min="0" max="5000" step="1" value={fee} onChange={(e) => setFee(e.target.value)} />
        <p className="mt-1 text-xs text-gray-500">Set 0 to make this slot free. The fee is added once per order.</p>
      </div>
      <button type="button" className={primaryButton} disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export const SettingsTab = () => {
  const { data, isLoading } = useAlacarteSettings();
  if (isLoading || !data) return <p className="py-10 text-center text-gray-500">Loading settings...</p>;
  return <SettingsForm key={data.middayFee} initialFee={data.middayFee} />;
};

export default SettingsTab;
