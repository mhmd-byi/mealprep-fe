import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { useMealSchedule } from "./useMealSchedule";

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

const DietToggle = ({ date, mealSlot, value, locked, isSaving, onSelect }) => {
  if (locked) {
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          value === "non-veg" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
        }`}
        title="Locked — within 3 days of delivery, already planned for"
      >
        🔒 {value === "non-veg" ? "Non-Veg" : "Veg"}
      </span>
    );
  }
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-xs">
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "veg" && onSelect("veg")}
        className={`px-2 py-1 font-medium ${
          value === "veg" ? "bg-green-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Veg
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "non-veg" && onSelect("non-veg")}
        className={`px-2 py-1 font-medium border-l border-gray-300 ${
          value === "non-veg" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Non-Veg
      </button>
    </div>
  );
};

export const MyPlan = () => {
  const { isSubscribed, currentPlan, nextPlan, hasQueuedPlan } = useSubscription();
  const isBothMealType = currentPlan?.mealType === "both";
  const { days, applicable, isLoading: isScheduleLoading, error: scheduleError, savingKey, updatePreference } =
    useMealSchedule(isBothMealType);

  const totalMealsLeft = (plan) =>
    ((plan?.lunchMeals || 0) +
      (plan?.dinnerMeals || 0) +
      (plan?.nextDayLunchMeals || 0) +
      (plan?.nextDayDinnerMeals || 0));

  const isActive = currentPlan && totalMealsLeft(currentPlan) >= 1;

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-center p-5 w-full pt-10 gap-6">

        {/* ── Current Plan ── */}
        {(isSubscribed && currentPlan) ? (
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[1500px] lg:w-[1200px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
                Current Active Plan
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {isActive ? "● Active" : "● Inactive"}
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Plan Name</th>
                  <th className="text-left py-2">Start Date</th>
                  <th className="text-left py-2">Total Meals</th>
                  <th className="text-left py-2">Meals Left</th>
                  <th className="text-left py-2">Lunch Left</th>
                  <th className="text-left py-2">Dinner Left</th>
                  <th className="text-left py-2">Meal Type</th>
                  <th className="text-left py-2">Carb Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left">
                  <td className="py-2 font-medium">{currentPlan?.plan}</td>
                  <td className="py-2">{formatDate(currentPlan?.subscriptionStartDate)}</td>
                  <td className="py-2">{currentPlan?.totalMeals} Meals</td>
                  <td className="py-2">{totalMealsLeft(currentPlan)} Meals</td>
                  <td className="py-2">
                    {(currentPlan?.lunchMeals || 0) + (currentPlan?.nextDayLunchMeals || 0)} Meals
                  </td>
                  <td className="py-2">
                    {(currentPlan?.dinnerMeals || 0) + (currentPlan?.nextDayDinnerMeals || 0)} Meals
                  </td>
                  <td className="py-2">{(currentPlan?.mealType || "").toUpperCase()}</td>
                  <td className="py-2 capitalize">{currentPlan?.carbType || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[1500px] lg:w-[1200px]">
            <p className="text-center text-gray-600">
              You don&apos;t have any active subscription plans.
            </p>
          </div>
        )}

        {/* ── Meal Schedule (Veg / Non-Veg per day, only for "Both" plans) ── */}
        {isSubscribed && isBothMealType && (
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[1500px] lg:w-[1200px]">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              Meal Schedule
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose Veg or Non-Veg for each upcoming day. Days within the next 3 days are locked
              because we've already planned stock against them — anything further out can be
              changed any time.
            </p>

            {scheduleError && (
              <p className="mb-3 text-sm text-red-600">{scheduleError}</p>
            )}

            {isScheduleLoading ? (
              <p className="text-gray-500 text-sm">Loading schedule…</p>
            ) : applicable && days.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2">Date</th>
                      {days.some((d) => d.lunch) && <th className="text-left py-2">Lunch</th>}
                      {days.some((d) => d.dinner) && <th className="text-left py-2">Dinner</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day.date} className="text-left border-b border-gray-100">
                        <td className="py-2 font-medium">{formatDayLabel(day.date)}</td>
                        {days.some((d) => d.lunch) && (
                          <td className="py-2">
                            {day.lunch ? (
                              <DietToggle
                                date={day.date}
                                mealSlot="lunch"
                                value={day.lunch}
                                locked={day.locked}
                                isSaving={savingKey === `${day.date}_lunch`}
                                onSelect={(pref) => updatePreference(day.date, "lunch", pref)}
                              />
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        )}
                        {days.some((d) => d.dinner) && (
                          <td className="py-2">
                            {day.dinner ? (
                              <DietToggle
                                date={day.date}
                                mealSlot="dinner"
                                value={day.dinner}
                                locked={day.locked}
                                isSaving={savingKey === `${day.date}_dinner`}
                                onSelect={(pref) => updatePreference(day.date, "dinner", pref)}
                              />
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming delivery days to schedule yet.</p>
            )}
          </div>
        )}

        {/* ── Next (Queued) Plan ── */}
        {hasQueuedPlan && nextPlan ? (
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-[1500px] lg:w-[1200px] border-l-4 border-amber-400">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
                Next Queued Plan
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                🕐 Queued
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              This plan will activate automatically once your current plan's meals run out.
              Only an admin can cancel a queued plan.
            </p>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Plan Name</th>
                  <th className="text-left py-2">Total Meals</th>
                  <th className="text-left py-2">Meal Type</th>
                  <th className="text-left py-2">Carb Type</th>
                  <th className="text-left py-2">Allergy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left">
                  <td className="py-2 font-medium">{nextPlan?.plan}</td>
                  <td className="py-2">{nextPlan?.totalMeals} Meals</td>
                  <td className="py-2">{(nextPlan?.mealType || "").toUpperCase()}</td>
                  <td className="py-2 capitalize">{nextPlan?.carbType || "—"}</td>
                  <td className="py-2">{nextPlan?.allergy || "None"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : isSubscribed ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 w-full max-w-[1500px] lg:w-[1200px] text-sm text-amber-800">
            💡 You can queue a next plan on the{" "}
            <a href="/dashboard/plans" className="underline font-medium">Plans page</a>{" "}
            before your current plan runs out.
          </div>
        ) : null}

      </div>
    </DashboardLayoutComponent>
  );
};
