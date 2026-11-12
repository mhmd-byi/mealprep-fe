import { useState } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { buildCarbLookup } from "../../../carbTypes";
import { planBadgeStyle } from "../../../plans";
import { CarbTypeFormPopup } from "./CarbTypeFormPopup";
import { errorText, useAdminCarbTypes, useCarbTypeActions } from "./useCarbTypesAdmin";

const primaryButton = "px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50 whitespace-nowrap";
const outlineButton =
  "px-3 py-2 text-sm font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap";

export const ManageCarbTypes = () => {
  const { data, isLoading } = useAdminCarbTypes();
  const { setupCarbTypes, saveCarbType, setCarbTypeActive, deleteCarbType } = useCarbTypeActions();
  const [form, setForm] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const carbTypes = data?.carbTypes || [];
  const needsSetup = Boolean(data?.needsSetup);
  const lookup = buildCarbLookup(carbTypes);

  const handleSetup = async () => {
    try {
      setIsSettingUp(true);
      await setupCarbTypes();
      toast.success("Carb types saved. You can edit them now.");
    } catch (error) {
      toast.error(errorText(error, "Could not set up the carb types."));
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSave = async (payload) => {
    await saveCarbType(form.carbType?._id, payload);
    toast.success(form.carbType ? "Carb type updated." : "Carb type added.");
    setForm(null);
  };

  const handleToggle = async (carbType) => {
    try {
      await setCarbTypeActive(carbType._id, !carbType.isActive);
      toast.success(carbType.isActive ? `${carbType.name} is archived and can no longer be chosen.` : `${carbType.name} is available again.`);
    } catch (error) {
      toast.error(errorText(error, "Could not change this carb type."));
    }
  };

  const handleDelete = async (carbType) => {
    if (!window.confirm(`Delete "${carbType.name}"? This cannot be undone.`)) return;
    try {
      await deleteCarbType(carbType._id);
      toast.success("Carb type deleted.");
    } catch (error) {
      toast.error(errorText(error, "Could not delete this carb type."));
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Carb Types</h2>
              <p className="text-sm text-gray-500">
                The meal styles customers choose when they subscribe. Changes show up in the web app, the mobile app, the delivery labels and the website.
              </p>
            </div>
            {!needsSetup && (
              <button type="button" className={`${primaryButton} flex gap-2 items-center`} onClick={() => setForm({ carbType: null })}>
                <Plus className="w-4 h-4" />
                Add carb type
              </button>
            )}
          </div>

          {needsSetup && (
            <div className="p-5 space-y-3 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="font-bold text-amber-900">Save your current carb types first</p>
              <p className="text-sm text-amber-800">These are the carb types customers see today. Saving them here lets you edit their names, colours and nutrition figures.</p>
              <button type="button" className={primaryButton} disabled={isSettingUp} onClick={handleSetup}>
                {isSettingUp ? "Saving..." : "Save current carb types"}
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Loading carb types...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {carbTypes.map((carbType) => (
                <div key={carbType._id || carbType.slug} className={`p-5 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm ${carbType.isActive ? "" : "opacity-70"}`}>
                  <div className="flex flex-wrap gap-2 justify-between items-start">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={planBadgeStyle(carbType.color)}>
                      {carbType.name}
                    </span>
                    <div className="flex gap-1.5">
                      {carbType.showOnWebsite && <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">On website</span>}
                      {!carbType.isActive && <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">Archived</span>}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{lookup.nutritionLine(carbType.slug) || "No nutrition figures"}</p>
                  <p className="text-xs text-gray-400">
                    Label code {carbType.shortCode} · {carbType.subscriberCount} subscription{carbType.subscriberCount === 1 ? "" : "s"} · {carbType.activeCount} active now
                  </p>

                  {!needsSetup && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => setForm({ carbType })}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => handleToggle(carbType)}>
                        {carbType.isActive ? <Archive className="w-3.5 h-3.5" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                        {carbType.isActive ? "Archive" : "Restore"}
                      </button>
                      {carbType.subscriberCount === 0 && (
                        <button
                          type="button"
                          className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(carbType)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {form && <CarbTypeFormPopup key={form.carbType?._id || "new"} carbType={form.carbType} onClose={() => setForm(null)} onSave={handleSave} />}
    </DashboardLayoutComponent>
  );
};

export default ManageCarbTypes;
