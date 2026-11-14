import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { formatTastePreference, sameFlavours } from "../../tastePreferences";
import { useTasteOptions } from "../../useTasteOptions";
import { TastePreferenceFields } from "../../components/common/TastePreferenceFields/TastePreferenceFields";
import { Flame, Info } from "lucide-react";

const PlanTastePreference = ({ plan, statusLabel }) => {
  const initial = { spiceLevel: plan.spiceLevel || "", flavourPreferences: plan.flavourPreferences || [] };
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);

  const isChanged = draft.spiceLevel !== saved.spiceLevel || !sameFlavours(draft.flavourPreferences, saved.flavourPreferences);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}subscription/${plan._id}/taste-preference`, draft, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setSaved(response.data);
      setDraft(response.data);
      toast.success("Taste preference saved.");
    } catch (err) {
      console.error("Error saving taste preference:", err);
      toast.error(err.response?.data?.message || "Failed to save taste preference.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-xl border border-gray-100">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-900">{plan.plan}</p>
        <span className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">{statusLabel}</span>
      </div>
      <TastePreferenceFields
        spiceLevel={draft.spiceLevel}
        flavourPreferences={draft.flavourPreferences}
        onChange={setDraft}
        disabled={isSaving}
      />
      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isChanged || isSaving}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        {!isChanged && formatTastePreference(saved) && <p className="text-xs text-gray-400">Saved: {formatTastePreference(saved)}</p>}
      </div>
    </div>
  );
};

const Notice = ({ children }) => (
  <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
    <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
    <p>{children}</p>
  </div>
);

export const MyTastePreferences = () => {
  const { currentPlans, nextPlan, hasQueuedPlan, isLoading: isPlanLoading } = useSubscription();
  const { spiceOptions, flavourOptions, isLoading: isOptionsLoading } = useTasteOptions();

  const plans = [
    ...currentPlans.map((plan) => ({ plan, statusLabel: "Active" })),
    ...(hasQueuedPlan && nextPlan?._id ? [{ plan: nextPlan, statusLabel: "Queued" }] : []),
  ];

  const renderBody = () => {
    if (isPlanLoading || isOptionsLoading) return <p className="py-10 text-center text-gray-500">Loading your preferences...</p>;

    if (plans.length === 0) {
      return (
        <Notice>
          You don&apos;t have an active plan yet. Pick one on the{" "}
          <Link to="/dashboard/plans" className="font-semibold underline">
            Plans page
          </Link>{" "}
          and you can set your taste preferences here.
        </Notice>
      );
    }

    if (spiceOptions.length === 0 && flavourOptions.length === 0) {
      return <Notice>Taste preferences are not available right now. Please check back soon.</Notice>;
    }

    return (
      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="flex gap-2 items-center mb-2 text-base font-bold text-gray-900">
          <Flame className="w-5 h-5 text-theme-color-1" />
          Your taste
        </p>
        <p className="mb-4 text-sm text-gray-500">Tell our kitchen how you like your food. Changes apply to meals we prepare from now on.</p>
        <div className="space-y-4">
          {plans.map(({ plan, statusLabel }) => (
            <PlanTastePreference key={plan._id} plan={plan} statusLabel={statusLabel} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Taste Preferences</p>
            <h2 className="text-2xl font-bold text-gray-900">Taste Preferences</h2>
            <p className="text-sm text-gray-500">Spice level and flavours for each of your plans.</p>
          </div>
          {renderBody()}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default MyTastePreferences;
