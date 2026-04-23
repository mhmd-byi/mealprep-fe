import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";

export const MyPlan = () => {
  const { isSubscribed, currentPlan, nextPlan, hasQueuedPlan } = useSubscription();

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
