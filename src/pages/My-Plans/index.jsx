import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";

export const MyPlan = () => {
  const { isSubscribed, currentPlan } = useSubscription();

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full lg:h-full my-auto">
        {(isSubscribed && currentPlan) ? (
          <div className="mt-7 bg-white shadow-md rounded-lg p-6 max-w-[1500px] lg:w-[1200px]">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-6 text-gray-800">
              My Active Subscription Plan
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Plan Name</th>
                  <th className="text-left py-2">Total Meals</th>
                  <th className="text-left py-2">Total Meals Left</th>
                  <th className="text-left py-2">Lunch Meals Left</th>
                  <th className="text-left py-2">Dinner Meals Left</th>
                  <th className="text-left py-2">Meal Type</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left">
                  <td className="py-2">{currentPlan?.plan}</td>
                  <td className="py-2">{currentPlan?.totalMeals} Meals</td>
                  <td className="py-2">{((currentPlan?.lunchMeals || 0) + (currentPlan?.dinnerMeals || 0)) || 0} Meals</td>
                  <td className="py-2">{currentPlan?.lunchMeals || 0} Meals</td>
                  <td className="py-2">{currentPlan?.dinnerMeals || 0} Meals</td>
                  <td className="py-2">{(currentPlan?.mealType || "").toUpperCase()}</td>
                  <td className="py-2">{(currentPlan?.lunchMeals + currentPlan?.dinnerMeals) >= 1 ? <span className="bg-green-500 text-white px-2 py-1 rounded">Active</span> : <span className="bg-red-500 text-white px-2 py-1 rounded">Inactive</span>}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-7 bg-white shadow-md rounded-lg p-6 max-w-[1500px] lg:w-[1200px]">
            <p className="text-center text-gray-600">
              You don't have any active subscription plans.
            </p>
          </div>
        )}
      </div>
    </DashboardLayoutComponent>
  );
};
