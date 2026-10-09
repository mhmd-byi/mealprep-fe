import React, { useState } from "react";
import { Button } from "../../components";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import data from "./data.json";
import { useSubscription, purchaseOverlapsActiveSubs } from "./useSubscription";
import { CheckmarkCircleOutline } from "./circleCheckmark";
import { formatNutritionLine } from "../../nutritionInfo";
import { CheckCircle2, Clock, Lock, Info, CalendarDays, AlertTriangle } from "lucide-react";

const selectClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const SubscriptionPlans = () => {
  const { plans } = data;
  const { handleSubscribe, isSubscribedTo, isQueuedTo, isSubscribed, hasQueuedPlan, currentPlans } = useSubscription();
  const [errorMessages, setErrorMessages] = useState({});
  const [dateWarnings, setDateWarnings] = useState({});

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMinimumDate = (lunchDinner) => {
    // Get current time in IST
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = nowIST.getHours();
    const currentMinutes = nowIST.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    let minDate = new Date(nowIST);

    // Determine if user can select today based on meal type and time
    // Using backend cutoffs: 10:30 AM for lunch, 4:00 PM for dinner
    if (lunchDinner === "lunch") {
      // For lunch only: must book before 10:30 AM
      if (currentTimeInMinutes >= 10.5 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    } else if (lunchDinner === "dinner") {
      // For dinner only: must book before 4:00 PM (16:00)
      if (currentTimeInMinutes >= 16 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    } else if (lunchDinner === "lunchAndDinner") {
      // For both: if lunch time has passed, we should ideally start from tomorrow
      // to ensure the user gets a full day's worth of meals
      if (currentTimeInMinutes >= 10.5 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    }

    // If minimum date is Sunday (0), set it to Monday
    if (minDate.getDay() === 0) {
      minDate.setDate(minDate.getDate() + 1);
    }

    return formatDateLocal(minDate);
  };

  // Create separate state for each plan's details
  const [planDetails, setPlanDetails] = useState(() =>
    plans.reduce((acc, plan) => {
      const initialLunchDinner = "lunch";
      const initialDate = getMinimumDate(initialLunchDinner);
      return {
        ...acc,
        [plan.name]: {
          mealType: "veg",
          carbType: "low-carb-high-protein",
          lunchDinner: initialLunchDinner,
          mealStartDate: initialDate,
          allergy: "",
        },
      };
    }, {})
  );

  const getAdjustedPlanDetails = (plan) => {
    const multiplier =
      planDetails[plan.name].lunchDinner === "lunchAndDinner" ? 2 : 1;
    return {
      price: plan.price * multiplier,
      meals: plan.meals * multiplier,
      duration: plan.duration.replace(
        /\d+/g,
        (match) => parseInt(match) * multiplier
      ),
    };
  };

  const handlePlanSubscribe = (
    planName,
    mealCount,
    price,
    mealType,
    carbType,
    lunchDinner,
    mealStartDate,
    allergy
  ) => {
    const plan = plans.find((p) => p.name === planName);
    const { price: adjustedPrice, meals: adjustedMeals } =
      getAdjustedPlanDetails(plan);

    handleSubscribe(
      planName,
      adjustedMeals,
      adjustedPrice,
      mealType,
      carbType,
      lunchDinner,
      mealStartDate,
      allergy,
      (message) => {
        setErrorMessages({ ...errorMessages, [planName]: message });
      }
    );
  };

  const handleDetailChange = (planName, field, value) => {
    let finalValue = value;
    let newWarning = null;

    // If changing meal start date, enforce the minimum date
    // (mobile browsers often ignore the HTML `min` attribute in their native date picker)
    if (field === "mealStartDate") {
      const lunchDinner = planDetails[planName].lunchDinner;
      const minDate = getMinimumDate(lunchDinner);

      if (value < minDate) {
        // Snap back to the minimum allowed date
        finalValue = minDate;

        // Build a human-readable reason for the warning
        const nowIST = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        const currentHour = nowIST.getHours();
        const currentMinutes = nowIST.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinutes;

        if (
          (lunchDinner === "lunch" || lunchDinner === "lunchAndDinner") &&
          currentTimeInMinutes >= 10.5 * 60
        ) {
          newWarning = `Lunch booking cutoff (10:30 AM) has passed — start date moved to ${minDate}.`;
        } else if (
          lunchDinner === "dinner" &&
          currentTimeInMinutes >= 16 * 60
        ) {
          newWarning = `Dinner booking cutoff (4:00 PM) has passed — start date moved to ${minDate}.`;
        } else {
          newWarning = `Selected date is not available — start date moved to ${minDate}.`;
        }
      }

      // Parse local date from YYYY-MM-DD
      const [year, month, day] = finalValue.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);

      // Skip Sundays — move to Monday
      if (selectedDate.getDay() === 0) {
        selectedDate.setDate(selectedDate.getDate() + 1);
        finalValue = formatDateLocal(selectedDate);
      }
    }

    // Update date warnings
    setDateWarnings((prev) => ({
      ...prev,
      [planName]: newWarning,
    }));

    // If changing lunch/dinner option, update the meal start date based on new minimum
    if (field === "lunchDinner") {
      const currentStartDate = planDetails[planName].mealStartDate;
      const newMinDate = getMinimumDate(value);

      if (currentStartDate < newMinDate) {
        setPlanDetails((prev) => ({
          ...prev,
          [planName]: {
            ...prev[planName],
            [field]: value,
            mealStartDate: newMinDate,
          },
        }));
        return;
      }
    }

    setPlanDetails((prev) => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [field]: finalValue,
      },
    }));
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-6xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Plans</p>
            <h2 className="text-2xl font-bold text-gray-900">Subscribe to a Meal Plan</h2>
            <p className="text-sm text-gray-500">Pick a plan, customize it to your diet, and we'll take it from there.</p>
          </div>

          {/* Info banner: user has active plan but no queued plan yet */}
          {isSubscribed && !hasQueuedPlan && (
            <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
              <p><strong>You have an active plan.</strong> You can queue up one more plan now — it will activate automatically when your current plan's meals run out.</p>
            </div>
          )}

          {/* Info banner: next plan already queued */}
          {hasQueuedPlan && (
            <div className="flex gap-3 items-start p-4 text-sm text-blue-800 bg-blue-50 rounded-2xl border border-blue-200">
              <Clock className="flex-shrink-0 mt-0.5 w-4 h-4" />
              <p><strong>You have a plan queued.</strong> It will activate as soon as your current plan finishes. Only one plan can be queued at a time.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const { price, meals, duration } = getAdjustedPlanDetails(plan);
              const currentPlanDetails = planDetails[plan.name];
              const isActive = isSubscribedTo(plan.name);
              const isQueued = isQueuedTo(plan.name);
              // Whether THIS specific meal-type selection would overlap an
              // already-active plan's coverage — only an overlapping purchase
              // needs to queue; a genuinely non-overlapping one (e.g. dinner
              // bought while only lunch is active) activates immediately.
              const wouldOverlap = purchaseOverlapsActiveSubs(currentPlanDetails.lunchDinner, currentPlans);

              return (
                <div
                  key={index}
                  className={`flex flex-col p-5 bg-white rounded-2xl border shadow-sm ${
                    isActive ? "border-theme-color-1 ring-1 ring-theme-color-1" : "border-gray-100"
                  }`}
                >
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="mt-1 text-3xl font-bold text-gray-900">₹{price}</p>
                  <p className="mt-2 mb-4 text-sm text-gray-500">
                    {plan.description} <br />
                    Valid for {duration}
                  </p>

                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">Meal Type</label>
                      <select
                        className={selectClass}
                        value={currentPlanDetails.mealType}
                        onChange={(e) => handleDetailChange(plan.name, "mealType", e.target.value)}
                      >
                        <option value="veg">Veg</option>
                        <option value="non-veg">Non-Veg</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">Lunch / Dinner</label>
                      <select
                        className={selectClass}
                        value={currentPlanDetails.lunchDinner}
                        onChange={(e) => handleDetailChange(plan.name, "lunchDinner", e.target.value)}
                      >
                        <option value="lunch">Only Lunch</option>
                        <option value="dinner">Only Dinner</option>
                        <option value="lunchAndDinner">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">Carb Type</label>
                      <select
                        className={selectClass}
                        value={currentPlanDetails.carbType}
                        onChange={(e) => handleDetailChange(plan.name, "carbType", e.target.value)}
                      >
                        <option value="low-carb-high-protein">Low Carb High Protein Meal</option>
                        <option value="balanced-meal">Balanced Meal</option>
                        <option value="high-carb-high-protein">High Carb High Protein Meal</option>
                        <option value="zero-carb">Zero Carb Meal</option>
                        <option value="keto-meal">Keto Meal</option>
                      </select>
                      {formatNutritionLine(currentPlanDetails.carbType) && (
                        <p className="mt-1 text-xs text-gray-400">{formatNutritionLine(currentPlanDetails.carbType)} (per meal)</p>
                      )}
                    </div>

                    {wouldOverlap ? (
                      // This purchase will queue behind the current plan and activate
                      // automatically the moment it finishes — whatever start date is
                      // stored now gets overwritten with the real activation date at
                      // that point, so asking the customer to guess one here only
                      // invites exactly the confusion this note is meant to prevent.
                      <p className="flex gap-1.5 items-start px-3 py-2 text-xs text-center text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                        <CalendarDays className="flex-shrink-0 mt-0.5 w-3.5 h-3.5" />
                        Start date: automatic — this activates right after your current plan ends, so there's nothing to pick here.
                      </p>
                    ) : (
                      <div>
                        <label className="block mb-1 text-xs font-medium text-gray-500">Meal Start Date</label>
                        <input
                          type="date"
                          className={selectClass}
                          onChange={(e) => handleDetailChange(plan.name, "mealStartDate", e.target.value)}
                          value={currentPlanDetails.mealStartDate}
                          min={getMinimumDate(currentPlanDetails.lunchDinner)}
                          onKeyDown={(e) => e.preventDefault()}
                        />
                        {dateWarnings[plan.name] && (
                          <p className="flex gap-1.5 items-start px-2 py-1 mt-1 text-xs text-amber-700 bg-amber-50 rounded border border-amber-300">
                            <AlertTriangle className="flex-shrink-0 mt-0.5 w-3.5 h-3.5" />
                            {dateWarnings[plan.name]}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 text-xs font-medium text-gray-500">Allergy</label>
                      <input
                        type="text"
                        placeholder="Any allergies?"
                        className={selectClass}
                        value={currentPlanDetails.allergy}
                        onChange={(e) => handleDetailChange(plan.name, "allergy", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ── Status area ── */}
                  {isActive ? (
                    // This plan is already one of the user's active plans
                    <>
                      <p className="flex gap-1.5 justify-center items-center py-2.5 font-bold text-green-700 rounded-lg border-2 border-green-500 bg-green-50">
                        <CheckCircle2 className="w-4 h-4" />
                        Currently Active Plan
                      </p>
                      {(!hasQueuedPlan || !wouldOverlap) && (
                        <>
                          <p className="flex gap-1.5 items-start px-2 py-1.5 mt-2 mb-2 text-xs text-amber-700 bg-amber-50 rounded border border-amber-300">
                            <Info className="flex-shrink-0 mt-0.5 w-3.5 h-3.5" />
                            {wouldOverlap
                              ? "This will be queued and activate when your current plan finishes."
                              : "This covers a different meal type than your active plan, so it will activate immediately and run alongside it."}
                          </p>
                          <Button
                            onClick={() =>
                              handlePlanSubscribe(
                                plan.name,
                                meals,
                                price,
                                currentPlanDetails.mealType,
                                currentPlanDetails.carbType,
                                currentPlanDetails.lunchDinner,
                                currentPlanDetails.mealStartDate,
                                currentPlanDetails.allergy
                              )
                            }
                            classes="w-full justify-center mt-2"
                          >
                            {wouldOverlap ? "Queue as Next Plan" : "Subscribe"}
                          </Button>
                        </>
                      )}
                    </>
                  ) : isQueued ? (
                    // This plan is already queued as next
                    <p className="flex gap-1.5 justify-center items-center py-2.5 font-bold text-amber-700 rounded-lg border-2 border-amber-400 bg-amber-50">
                      <Clock className="w-4 h-4" />
                      Queued as Your Next Plan
                    </p>
                  ) : hasQueuedPlan && wouldOverlap ? (
                    // User already has a different plan queued, and this selection
                    // would also need to queue — can't queue a second one
                    <p className="flex gap-1.5 justify-center items-center py-2.5 font-medium text-gray-500 rounded-lg border-2 border-gray-300 bg-gray-50">
                      <Lock className="w-4 h-4" />
                      Next plan slot is already taken
                    </p>
                  ) : (
                    // Normal subscribe / queue-as-next
                    <>
                      {isSubscribed && (
                        <p className="flex gap-1.5 items-start px-2 py-1.5 mb-2 text-xs text-amber-700 bg-amber-50 rounded border border-amber-300">
                          <Info className="flex-shrink-0 mt-0.5 w-3.5 h-3.5" />
                          {wouldOverlap
                            ? "This will be queued and activate when your current plan finishes."
                            : "This covers a different meal type than your active plan, so it will activate immediately and run alongside it."}
                        </p>
                      )}
                      <Button
                        onClick={() =>
                          handlePlanSubscribe(
                            plan.name,
                            meals,
                            price,
                            currentPlanDetails.mealType,
                            currentPlanDetails.carbType,
                            currentPlanDetails.lunchDinner,
                            currentPlanDetails.mealStartDate,
                            currentPlanDetails.allergy
                          )
                        }
                        classes="w-full justify-center"
                      >
                        {isSubscribed ? (wouldOverlap ? "Queue as Next Plan" : "Subscribe") : "Select"}
                      </Button>
                    </>
                  )}

                  {errorMessages[plan.name] && (
                    <p className="mt-1 text-sm text-red-500">{errorMessages[plan.name]}</p>
                  )}

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <ul className="space-y-2 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex gap-2 items-start text-sm text-gray-700">
                          <CheckmarkCircleOutline className="flex-shrink-0 w-5 h-5 text-theme-color-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default SubscriptionPlans;
