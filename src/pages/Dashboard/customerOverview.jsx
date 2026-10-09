import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import useSubscription from "../Plans/useSubscription";
import { Utensils, CalendarDays, ArrowRight } from "lucide-react";

export const CustomerOverview = () => {
  const navigate = useNavigate();
  const { userDetails } = useDashboard();
  const { isSubscribed, currentPlan, isLoading } = useSubscription();

  const lunchLeft = (currentPlan?.lunchMeals || 0) + (currentPlan?.nextDayLunchMeals || 0);
  const dinnerLeft = (currentPlan?.dinnerMeals || 0) + (currentPlan?.nextDayDinnerMeals || 0);

  const nextDelivery = (() => {
    if (!currentPlan) return null;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (currentPlan.lunchMeals > 0) return { meal: "Lunch", date: today };
    if (currentPlan.dinnerMeals > 0) return { meal: "Dinner", date: today };
    if (currentPlan.nextDayLunchMeals > 0) return { meal: "Lunch", date: tomorrow };
    if (currentPlan.nextDayDinnerMeals > 0) return { meal: "Dinner", date: tomorrow };
    return null;
  })();

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-2 text-left lg:pt-4">
        <div className="w-40 h-7 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-2 text-left lg:pt-4">
      <h2 className="text-2xl font-bold text-gray-900">Hi, {userDetails.firstName || "there"}</h2>
      <p className="mb-4 text-sm text-gray-500">
        {isSubscribed ? `You're on the ${currentPlan?.plan || "current"} plan.` : "You don't have an active plan yet."}
      </p>

      {isSubscribed ? (
        <div className="grid grid-cols-1 gap-4 mb-2 sm:grid-cols-3">
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-center items-center mb-2 w-10 h-10 rounded-xl bg-green-50 text-theme-color-1">
              <Utensils className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">Meals Left</p>
            <p className="text-lg font-bold text-gray-900">Lunch: {lunchLeft} &middot; Dinner: {dinnerLeft}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
            <p className="text-xs font-semibold tracking-wide uppercase text-theme-color-1">Next Delivery</p>
            {nextDelivery ? (
              <>
                <p className="text-lg font-bold text-gray-900">{nextDelivery.meal}</p>
                <p className="text-sm text-gray-600">
                  {nextDelivery.date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-gray-600">No upcoming delivery</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/meal-tracking")}
            className="flex flex-col justify-center items-start p-4 text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-theme-color-1"
          >
            <div className="flex justify-center items-center mb-2 w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900">View Meal Tracking</p>
            <span className="flex gap-1 items-center mt-1 text-xs font-semibold text-theme-color-1">
              Open <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/dashboard/plans")}
          className="flex justify-between items-center p-5 mb-2 w-full text-left rounded-2xl bg-theme-color-1 hover:bg-black"
        >
          <div>
            <p className="text-lg font-bold text-white">Browse Meal Plans</p>
            <p className="text-sm text-green-50">Pick a weekly, monthly or trial plan and get started today.</p>
          </div>
          <ArrowRight className="flex-shrink-0 w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default CustomerOverview;
