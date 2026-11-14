import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { inputClass, MAX_SLOT_FEE, MAX_SLOTS, outlineButton, primaryButton, slotRangeLabel } from "./alacarteDisplay";
import { errorText, useAlacarteActions, useAlacarteSettings } from "./useAlacarteAdmin";

const toRows = (slots) =>
  slots.map((slot) => ({ id: slot.key, key: slot.key, startTime: slot.startTime, endTime: slot.endTime, fee: String(slot.fee) }));

const rowsSignature = (rows) => JSON.stringify(rows.map((row) => [row.key, row.startTime, row.endTime, Number(row.fee)]));

const problemWith = (rows) => {
  if (rows.length === 0) return "Keep at least one delivery slot.";
  const seen = new Set();
  for (const row of rows) {
    if (!row.startTime || !row.endTime) return "Every slot needs a start and an end time.";
    if (row.endTime <= row.startTime) return "A slot must end after it starts.";
    const fee = Number(row.fee);
    if (row.fee === "" || !Number.isFinite(fee) || fee < 0 || fee > MAX_SLOT_FEE) return `Enter a fee between ₹0 and ₹${MAX_SLOT_FEE} for every slot.`;
    const range = `${row.startTime}-${row.endTime}`;
    if (seen.has(range)) return "Two slots have the same time.";
    seen.add(range);
  }
  return "";
};

const SettingsForm = ({ initialSlots }) => {
  const { saveSettings } = useAlacarteActions();
  const [rows, setRows] = useState(() => toRows(initialSlots));
  const [isSaving, setIsSaving] = useState(false);
  const newRowCount = useRef(0);
  const savedSignature = useRef(rowsSignature(toRows(initialSlots)));

  const isDirty = rowsSignature(rows) !== savedSignature.current;

  const updateRow = (id, field, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addRow = () => {
    newRowCount.current += 1;
    setRows((current) => [...current, { id: `new-${newRowCount.current}`, key: "", startTime: "", endTime: "", fee: "0" }]);
  };

  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  const handleSave = async () => {
    const problem = problemWith(rows);
    if (problem) return toast.error(problem);
    try {
      setIsSaving(true);
      await saveSettings({
        slots: rows.map((row) => ({ key: row.key || undefined, startTime: row.startTime, endTime: row.endTime, fee: Number(row.fee) })),
      });
      toast.success("Delivery slots saved.");
    } catch (error) {
      toast.error(errorText(error, "Could not save the delivery slots."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5 max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h3 className="font-bold text-gray-900">Delivery slots</h3>
        <p className="text-sm text-gray-500">
          Customers pick a date (Monday to Saturday) and one of these slots. Change the times or fees, add a new slot or delete one, then click Save.
          Orders already placed keep the time they were booked with.
        </p>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="grid grid-cols-2 gap-3 items-end p-3 bg-gray-50 rounded-xl sm:grid-cols-[1fr_1fr_8rem_auto]">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">From</label>
              <input type="time" className={inputClass} value={row.startTime} onChange={(e) => updateRow(row.id, "startTime", e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">To</label>
              <input type="time" className={inputClass} value={row.endTime} onChange={(e) => updateRow(row.id, "endTime", e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Extra fee (₹)</label>
              <input
                type="number"
                min="0"
                max={MAX_SLOT_FEE}
                step="1"
                className={inputClass}
                value={row.fee}
                onChange={(e) => updateRow(row.id, "fee", e.target.value)}
              />
            </div>
            <button
              type="button"
              aria-label="Delete this slot"
              title={rows.length === 1 ? "Keep at least one slot" : "Delete this slot"}
              disabled={rows.length === 1}
              onClick={() => removeRow(row.id)}
              className="justify-self-end p-2.5 text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <p className="col-span-2 -mt-1 text-sm font-semibold text-gray-700 sm:col-span-4">
              {slotRangeLabel(row.startTime, row.endTime) || <span className="font-normal text-gray-400">Set a start and end time</span>}
              <span className="ml-2 font-normal text-gray-500">{Number(row.fee) > 0 ? `+ ₹${Number(row.fee)} delivery fee` : "Free delivery"}</span>
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-500">The extra fee is added once to an order when the customer picks that slot. Slots are shown to customers in time order.</p>

      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" className={`${outlineButton} inline-flex gap-1.5 items-center`} disabled={rows.length >= MAX_SLOTS} onClick={addRow}>
          <Plus className="w-4 h-4" />
          Add slot
        </button>
        <button type="button" className={primaryButton} disabled={isSaving || !isDirty} onClick={handleSave}>
          {isSaving ? "Saving..." : "Save"}
        </button>
        {isDirty && <span className="text-sm font-medium text-amber-600">Unsaved changes</span>}
      </div>
    </div>
  );
};

export const SettingsTab = () => {
  const { data, isLoading } = useAlacarteSettings();
  if (isLoading || !data) return <p className="py-10 text-center text-gray-500">Loading settings...</p>;
  return <SettingsForm key={JSON.stringify(data.slots)} initialSlots={data.slots} />;
};

export default SettingsTab;
