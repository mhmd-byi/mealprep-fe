import { useState } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { formatINR } from "../../../alacarteDisplay";
import { planBadgeStyle } from "../../../plans";
import { PlanFormPopup } from "./PlanFormPopup";
import { errorText, useAdminPlans, usePlanActions } from "./usePlansAdmin";

const primaryButton = "px-4 py-2 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-50 whitespace-nowrap";
const outlineButton =
  "px-3 py-2 text-sm font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap";

const formatPerMeal = (plan) => formatINR(Math.round((plan.price / plan.meals) * 100) / 100);

export const ManagePlans = () => {
  const { data, isLoading } = useAdminPlans();
  const { setupPlans, savePlan, setPlanActive, deletePlan } = usePlanActions();
  const [form, setForm] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const plans = data?.plans || [];
  const needsSetup = Boolean(data?.needsSetup);

  const handleSetup = async () => {
    try {
      setIsSettingUp(true);
      await setupPlans();
      toast.success("Plans saved. You can edit them now.");
    } catch (error) {
      toast.error(errorText(error, "Could not set up the plans."));
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSave = async (payload) => {
    await savePlan(form.plan?._id, payload);
    toast.success(form.plan ? "Plan updated." : "Plan added.");
    setForm(null);
  };

  const handleToggle = async (plan) => {
    try {
      await setPlanActive(plan._id, !plan.isActive);
      toast.success(plan.isActive ? `${plan.name} is archived and can no longer be bought.` : `${plan.name} is available again.`);
    } catch (error) {
      toast.error(errorText(error, "Could not change this plan."));
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    try {
      await deletePlan(plan._id);
      toast.success("Plan deleted.");
    } catch (error) {
      toast.error(errorText(error, "Could not delete this plan."));
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Plans</h2>
              <p className="text-sm text-gray-500">Create plans and set their prices. Changes show up in the web app, the mobile app and the website.</p>
            </div>
            {!needsSetup && (
              <button type="button" className={`${primaryButton} flex gap-2 items-center`} onClick={() => setForm({ plan: null })}>
                <Plus className="w-4 h-4" />
                Add plan
              </button>
            )}
          </div>

          {needsSetup && (
            <div className="p-5 space-y-3 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="font-bold text-amber-900">Save your current plans first</p>
              <p className="text-sm text-amber-800">
                These are the plans customers see today. Saving them here lets you edit prices and details, and keeps every existing subscription's revenue at the price it was bought for.
              </p>
              <button type="button" className={primaryButton} disabled={isSettingUp} onClick={handleSetup}>
                {isSettingUp ? "Saving..." : "Save current plans"}
              </button>
            </div>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Loading plans...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan._id || plan.name} className={`p-5 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm ${plan.isActive ? "" : "opacity-70"}`}>
                  <div className="flex flex-wrap gap-2 justify-between items-start">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={planBadgeStyle(plan.color)}>
                        {plan.name}
                      </span>
                      {plan.websiteTitle && <p className="text-xs text-gray-400">On the website: {plan.websiteTitle}</p>}
                    </div>
                    {!plan.isActive && <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">Archived</span>}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{formatINR(plan.price)}</p>
                    <p className="text-sm text-gray-500">
                      {plan.meals} meal{plan.meals === 1 ? "" : "s"} {plan.period} · {formatPerMeal(plan)} per meal
                    </p>
                  </div>

                  {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}
                  {plan.features.length > 0 && (
                    <ul className="space-y-0.5 text-sm text-gray-500 list-disc list-inside">
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  )}

                  <p className="text-xs text-gray-400">
                    {plan.subscriberCount} subscription{plan.subscriberCount === 1 ? "" : "s"} so far · {plan.activeCount} active now
                  </p>

                  {!needsSetup && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => setForm({ plan })}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => handleToggle(plan)}>
                        {plan.isActive ? <Archive className="w-3.5 h-3.5" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                        {plan.isActive ? "Archive" : "Restore"}
                      </button>
                      {plan.subscriberCount === 0 && (
                        <button
                          type="button"
                          className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(plan)}
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

      {form && <PlanFormPopup key={form.plan?._id || "new"} plan={form.plan} onClose={() => setForm(null)} onSave={handleSave} />}
    </DashboardLayoutComponent>
  );
};

export default ManagePlans;
