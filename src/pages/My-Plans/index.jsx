import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { useMealSchedule } from "./useMealSchedule";
import { formatNutritionLine } from "../../nutritionInfo";
import { formatCarbType } from "../../carbTypeDisplay";
import { formatTastePreference, sameFlavours } from "../../tastePreferences";
import { useTasteOptions } from "../../useTasteOptions";
import { TastePreferenceFields } from "../../components/common/TastePreferenceFields/TastePreferenceFields";
import { CreditCard, Clock, Utensils, Sun, Moon, Lock, Info, Flame } from "lucide-react";

const formatDayLabel = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const DietToggle = ({ value, locked, isSaving, onSelect }) => {
  if (locked) {
    return (
      <span
        className={`inline-flex gap-1 items-center px-2 py-1 rounded-full text-xs font-semibold ${
          value === "non-veg" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
        }`}
        title="Locked — within 3 days of delivery, already planned for"
      >
        <Lock className="w-3 h-3" />
        {value === "non-veg" ? "Non-Veg" : "Veg"}
      </span>
    );
  }
  return (
    <div className="inline-flex overflow-hidden text-xs rounded-lg border border-gray-300">
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "veg" && onSelect("veg")}
        className={`px-2 py-1 font-semibold ${
          value === "veg" ? "bg-theme-color-1 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Veg
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "non-veg" && onSelect("non-veg")}
        className={`px-2 py-1 font-semibold border-l border-gray-300 ${
          value === "non-veg" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Non-Veg
      </button>
    </div>
  );
};

const PlanTastePreference = ({ plan, statusLabel }) => {
  const initial = { spiceLevel: plan.spiceLevel || "", flavourPreferences: plan.flavourPreferences || [] };
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);

  const isChanged =
    draft.spiceLevel !== saved.spiceLevel || !sameFlavours(draft.flavourPreferences, saved.flavourPreferences);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}subscription/${plan._id}/taste-preference`,
        draft,
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
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
        {!isChanged && formatTastePreference(saved) && (
          <p className="text-xs text-gray-400">Saved: {formatTastePreference(saved)}</p>
        )}
      </div>
    </div>
  );
};

const TastePreferenceCard = ({ plans }) => {
  const { spiceOptions, flavourOptions } = useTasteOptions();
  if (plans.length === 0 || (spiceOptions.length === 0 && flavourOptions.length === 0)) return null;

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <p className="flex gap-2 items-center mb-2 text-base font-bold text-gray-900">
        <Flame className="w-5 h-5 text-theme-color-1" />
        Taste Preference
      </p>
      <p className="mb-4 text-sm text-gray-500">
        Tell our kitchen how you like your food. Changes apply to meals we prepare from now on.
      </p>
      <div className="space-y-4">
        {plans.map(({ plan, statusLabel }) => (
          <PlanTastePreference key={plan._id} plan={plan} statusLabel={statusLabel} />
        ))}
      </div>
    </div>
  );
};

export const MyPlan = () => {
  const { isSubscribed, currentPlans, nextPlan, hasQueuedPlan } = useSubscription();
  const tastePlans = [
    ...currentPlans.map((plan) => ({ plan, statusLabel: "Active" })),
    ...(hasQueuedPlan && nextPlan?._id ? [{ plan: nextPlan, statusLabel: "Queued" }] : []),
  ];
  const isBothMealType = currentPlans.some((p) => p.mealType === "both");
  const { days, applicable, isLoading: isScheduleLoading, error: scheduleError, savingKey, updatePreference } =
    useMealSchedule(isBothMealType);

  const totalMealsLeft = (plan) =>
    ((plan?.lunchMeals || 0) +
      (plan?.dinnerMeals || 0) +
      (plan?.nextDayLunchMeals || 0) +
      (plan?.nextDayDinnerMeals || 0));

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; My Billing</p>
            <h2 className="text-2xl font-bold text-gray-900">My Billing &amp; Plan</h2>
            <p className="text-sm text-gray-500">Your active subscription, meal schedule and anything queued up next.</p>
          </div>

          {/* ── Current Plan(s) ── */}
          {(isSubscribed && currentPlans.length > 0) ? (
            <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <p className="flex gap-2 items-center text-base font-bold text-gray-900">
                  <CreditCard className="w-5 h-5 text-theme-color-1" />
                  {currentPlans.length > 1 ? "Current Active Plans" : "Current Active Plan"}
                </p>
                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Active</span>
              </div>
              {currentPlans.length > 1 && (
                <p className="px-5 pt-4 text-sm text-gray-500">
                  You have {currentPlans.length} active plans running at once, covering different meal types.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Plan Name", "Start Date", "Total Meals", "Meals Left", "Lunch Left", "Dinner Left", "Meal Type", "Carb Type"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
                          <span className="flex gap-1 items-center">
                            {h === "Lunch Left" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                            {h === "Dinner Left" && <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                            {h}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPlans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{plan?.plan}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(plan?.subscriptionStartDate)}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{plan?.totalMeals} Meals</td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap text-theme-color-1">{totalMealsLeft(plan)} Meals</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {(plan?.lunchMeals || 0) + (plan?.nextDayLunchMeals || 0)} Meals
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {(plan?.dinnerMeals || 0) + (plan?.nextDayDinnerMeals || 0)} Meals
                        </td>
                        <td className="px-4 py-3 text-gray-700 uppercase whitespace-nowrap">{plan?.mealType}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {formatCarbType(plan?.carbType)}
                          {formatNutritionLine(plan?.carbType) && (
                            <p className="text-xs text-gray-400 normal-case">{formatNutritionLine(plan?.carbType)}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">You don&apos;t have any active subscription plans.</p>
            </div>
          )}

          <TastePreferenceCard plans={tastePlans} />

          {/* ── Meal Schedule (Veg / Non-Veg per day, only for "Both" plans) ── */}
          {isSubscribed && isBothMealType && (
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="flex gap-2 items-center mb-2 text-base font-bold text-gray-900">
                <Utensils className="w-5 h-5 text-theme-color-1" />
                Meal Schedule
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Choose Veg or Non-Veg for each upcoming day — any future day can be changed any
                time. Today locks per meal once its cutoff passes (10:30 AM for lunch, 4:00 PM for
                dinner), same as cancellations.
              </p>

              {scheduleError && <p className="mb-3 text-sm text-red-600">{scheduleError}</p>}

              {isScheduleLoading ? (
                <p className="text-sm text-gray-500">Loading schedule…</p>
              ) : applicable && days.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Date</th>
                        {days.some((d) => d.lunch) && (
                          <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">
                            <span className="flex gap-1 items-center"><Sun className="w-3.5 h-3.5 text-amber-500" />Lunch</span>
                          </th>
                        )}
                        {days.some((d) => d.dinner) && (
                          <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">
                            <span className="flex gap-1 items-center"><Moon className="w-3.5 h-3.5 text-indigo-500" />Dinner</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {days.map((day) => (
                        <tr key={day.date}>
                          <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{formatDayLabel(day.date)}</td>
                          {days.some((d) => d.lunch) && (
                            <td className="px-3 py-3">
                              {day.lunch ? (
                                <DietToggle
                                  value={day.lunch}
                                  locked={day.lunchLocked}
                                  isSaving={savingKey === `${day.date}_lunch`}
                                  onSelect={(pref) => updatePreference(day.date, "lunch", pref)}
                                />
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          )}
                          {days.some((d) => d.dinner) && (
                            <td className="px-3 py-3">
                              {day.dinner ? (
                                <DietToggle
                                  value={day.dinner}
                                  locked={day.dinnerLocked}
                                  isSaving={savingKey === `${day.date}_dinner`}
                                  onSelect={(pref) => updatePreference(day.date, "dinner", pref)}
                                />
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming delivery days to schedule yet.</p>
              )}
            </div>
          )}

          {/* ── Next (Queued) Plan ── */}
          {hasQueuedPlan && nextPlan ? (
            <div className="overflow-hidden bg-white rounded-2xl border-l-4 border-amber-400 shadow-sm">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <p className="flex gap-2 items-center text-base font-bold text-gray-900">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Next Queued Plan
                </p>
                <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">Queued</span>
              </div>
              <p className="px-5 pt-4 text-sm text-gray-500">
                This plan will activate automatically once your current plan's meals run out.
                Only an admin can cancel a queued plan.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Plan Name", "Total Meals", "Meal Type", "Carb Type", "Allergy", "Taste"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{nextPlan?.plan}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{nextPlan?.totalMeals} Meals</td>
                      <td className="px-4 py-3 text-gray-700 uppercase whitespace-nowrap">{nextPlan?.mealType}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {formatCarbType(nextPlan?.carbType)}
                        {formatNutritionLine(nextPlan?.carbType) && (
                          <p className="text-xs text-gray-400 normal-case">{formatNutritionLine(nextPlan?.carbType)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{nextPlan?.allergy || "None"}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatTastePreference(nextPlan) || "Not specified"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : isSubscribed ? (
            <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
              <p>
                You can queue a next plan on the{" "}
                <a href="/dashboard/plans" className="font-semibold underline">Plans page</a>{" "}
                before your current plan runs out.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default MyPlan;
