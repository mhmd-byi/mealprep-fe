import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";

export const MyPlan = () => {
  const { isSubscribed, currentPlan } = useSubscription();

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full lg:h-full my-auto">
        <div className="bg-white shadow-md rounded px-4 lg:px-14 py-4 w-fit lg:max-w-[1500px] lg:w-[1200px]">
          <h3 className="text-2xl lg:text-3xl text-black text-center">
            My Active Subscription Plan
          </h3>
        </div>
        {(isSubscribed && currentPlan) ? (
          <div className="mt-7 bg-white shadow-md rounded-lg p-6 max-w-[1500px] lg:w-[1200px]">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Plan Name</th>
                  <th className="text-left py-2">Total Meals</th>
                  <th className="text-left py-2">Meals Left</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left">
                  <td className="py-2">{currentPlan?.plan}</td>
                  <td className="py-2">
                    {/* {new Date(activePlan.startDate).toLocaleDateString()} */}
                    {currentPlan?.plan.includes('rial') ? 4 : (currentPlan.plan.includes('eek') ? 14 : 60)} Meals
                  </td>
                  <td className="py-2">
                    {/* {new Date(
                      activePlan.subscriptionEndDate
                    ).toLocaleDateString()} */}
                    {currentPlan?.lunchMeals + currentPlan?.dinnerMeals} Meals
                  </td>
                  <td className="py-2">
                  {currentPlan?.meals !== 0 ? <span className="bg-green-500 text-white px-2 py-1 rounded">
                    Active
                  </span> : <span className="bg-red-500 text-white px-2 py-1 rounded">
                  Inactive
                </span>}
                  </td>
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
