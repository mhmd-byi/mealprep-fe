import { useData } from "./useData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Popup from "../../../components/common/Popup/Popup";

export const Data = () => {
  const { 
    allRegisteredUsersCount, 
    cancelledMealsCount, 
    mealDeliveryListCountDinner, 
    mealDeliveryListCountLunch, 
    customisationRequestCount,
    endingSoonCount,
    endingSoonUsers,
    weeklyCount,
    monthlyCount,
    trialCount,
    loadingStates
  } = useData();

  const StatValue = ({ value, loading, className = "text-lg text-gray-900" }) => (
    loading ? (
      <div className="flex justify-center items-center py-1">
        <div className="w-5 h-5 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent"></div>
      </div>
    ) : (
      <span className={className}>{value}</span>
    )
  );
  const navigate = useNavigate();
  const [showEndingSoonModal, setShowEndingSoonModal] = useState(false);

  const handlePlanClick = (planType) => {
    navigate(`/dashboard/all-registered-users?plan=${planType}`);
  };

  return (
    <div className="px-4 my-16 lg:mt-4">
      <section className="flex justify-center mb-6">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Today's Stats</p>
        </div>
      </section>
      
      {/* Table view for medium and larger screens */}
      <section className="hidden flex-col gap-10 justify-center items-center p-8 bg-white rounded-lg border-2 shadow-sm transition-all duration-300 md:flex border-theme-color-1 hover:shadow-md hover:border-theme-color-2">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="text-center bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium tracking-wider text-gray-500 uppercase text-md">All Registered Users</th>
              <th className="px-6 py-3 font-medium tracking-wider text-gray-500 uppercase text-md">Delivery count</th>
              <th className="px-6 py-3 font-medium tracking-wider text-gray-500 uppercase text-md">Customised request</th>
              <th className="px-6 py-3 font-medium tracking-wider text-gray-500 uppercase text-md">Cancelled request</th>
              <th className="px-6 py-3 font-medium tracking-wider text-green-600 uppercase text-md">Active Subscriptions</th>
              <th className="px-6 py-3 font-medium tracking-wider text-red-600 uppercase text-md">Ending Soon (3 Days)</th>
            </tr>
          </thead>
          <tbody className="text-center bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-lg text-gray-900 whitespace-nowrap">
                <StatValue value={allRegisteredUsersCount} loading={loadingStates.users} />
              </td>
              <td className="px-6 py-4 text-lg text-gray-900 whitespace-nowrap">
                Lunch: <StatValue value={mealDeliveryListCountLunch} loading={loadingStates.deliveryLunch} /> <br />
                Dinner: <StatValue value={mealDeliveryListCountDinner} loading={loadingStates.deliveryDinner} />
              </td>
              <td className="px-6 py-4 text-lg text-gray-900 whitespace-nowrap">
                <StatValue value={customisationRequestCount} loading={loadingStates.customisation} />
              </td>
              <td className="px-6 py-4 text-lg text-gray-900 whitespace-nowrap">
                <StatValue value={cancelledMealsCount} loading={loadingStates.cancelled} />
              </td>
              <td className="px-6 py-4 text-lg font-bold text-gray-900 whitespace-nowrap">
                <span 
                  className="transition-colors duration-200 cursor-pointer hover:text-theme-color-1"
                  onClick={() => handlePlanClick('Weekly')}
                >
                  Weekly: <StatValue value={weeklyCount} loading={loadingStates.subscriptions} className="font-bold" />
                </span>
                <br /> 
                <span 
                   className="transition-colors duration-200 cursor-pointer hover:text-theme-color-1"
                   onClick={() => handlePlanClick('Monthly')}
                >
                  Monthly: <StatValue value={monthlyCount} loading={loadingStates.subscriptions} className="font-bold" />
                </span>
                <br />
                <span 
                   className="transition-colors duration-200 cursor-pointer hover:text-theme-color-1"
                   onClick={() => handlePlanClick('Trial')}
                >
                  Trial: <StatValue value={trialCount} loading={loadingStates.subscriptions} className="font-bold" />
                </span>
              </td>
              <td className="px-6 py-4 text-lg font-bold text-red-600 underline whitespace-nowrap cursor-pointer hover:text-red-700" onClick={() => setShowEndingSoonModal(true)}>
                <StatValue value={endingSoonCount} loading={loadingStates.users} className="font-bold text-red-600 underline" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Card view for mobile screens */}
      <section className="space-y-4 md:hidden">
        <div className="p-4 bg-white rounded-lg border-2 shadow-sm border-theme-color-1">
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">All Registered Users</h3>
          <p className="text-xl font-semibold text-gray-900">
            <StatValue value={allRegisteredUsersCount} loading={loadingStates.users} className="text-xl font-semibold text-gray-900" />
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 shadow-sm border-theme-color-1">
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">Delivery Count</h3>
          <div className="space-y-1">
            <p className="text-gray-900">
              <span className="font-medium">Lunch:</span> <StatValue value={mealDeliveryListCountLunch} loading={loadingStates.deliveryLunch} />
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Dinner:</span> <StatValue value={mealDeliveryListCountDinner} loading={loadingStates.deliveryDinner} />
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-green-700 uppercase">Active Subscriptions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="transition-opacity cursor-pointer hover:opacity-80"
              onClick={() => handlePlanClick('Weekly')}
            >
              <p className="text-xs text-gray-500">Weekly</p>
              <p className="text-xl font-bold text-gray-900">
                <StatValue value={weeklyCount} loading={loadingStates.subscriptions} className="text-xl font-bold text-gray-900" />
              </p>
            </div>
            <div 
              className="transition-opacity cursor-pointer hover:opacity-80"
              onClick={() => handlePlanClick('Monthly')}
            >
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-xl font-bold text-gray-900">
                <StatValue value={monthlyCount} loading={loadingStates.subscriptions} className="text-xl font-bold text-gray-900" />
              </p>
            </div>
            <div 
              className="col-span-2 transition-opacity border-t pt-2 cursor-pointer hover:opacity-80"
              onClick={() => handlePlanClick('Trial')}
            >
              <p className="text-xs text-gray-500">Trial</p>
              <p className="text-xl font-bold text-gray-900">
                <StatValue value={trialCount} loading={loadingStates.subscriptions} className="text-xl font-bold text-gray-900" />
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 shadow-sm border-theme-color-1">
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">Customised Request</h3>
          <p className="text-xl font-semibold text-gray-900">
            <StatValue value={customisationRequestCount} loading={loadingStates.customisation} className="text-xl font-semibold text-gray-900" />
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 shadow-sm border-theme-color-1">
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">Cancelled Request</h3>
          <p className="text-xl font-semibold text-gray-900">
            <StatValue value={cancelledMealsCount} loading={loadingStates.cancelled} className="text-xl font-semibold text-gray-900" />
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-red-200 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-red-700 uppercase">Subscriptions Ending Soon (3 Days)</h3>
          <p className="text-xl font-bold text-red-600 underline cursor-pointer" onClick={() => setShowEndingSoonModal(true)}>
            <StatValue value={endingSoonCount} loading={loadingStates.users} className="text-xl font-bold text-red-600 underline" />
          </p>
        </div>
      </section>

      <Popup
        isOpen={showEndingSoonModal}
        onClose={() => setShowEndingSoonModal(false)}
        title="Subscriptions Ending (Next 3 Days)"
        content={
          <div className="space-y-8">
            {endingSoonUsers.length > 0 ? (
              Object.entries(
                endingSoonUsers.reduce((acc, user) => {
                  const dateStr = user.estimatedEndDate;
                  if (!acc[dateStr]) acc[dateStr] = [];
                  acc[dateStr].push(user);
                  return acc;
                }, {})
              ).sort(([dateA], [dateB]) => {
                const [d1, m1, y1] = dateA.split('-').map(Number);
                const [d2, m2, y2] = dateB.split('-').map(Number);
                return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
              }).map(([date, users]) => (
                <div key={date} className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-theme-color-1">{date}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Mobile</th>
                          <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Meals Left</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                              {user.mobile}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-theme-color-1">
                              Lunch: {(user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0)}, 
                              Dinner: {(user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 font-medium text-center text-gray-500">No subscriptions ending in the next 3 days.</p>
            )}
          </div>
        }
        buttons={[
          {
            label: "Close",
            onClick: () => setShowEndingSoonModal(false),
            className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        ]}
      />
    </div>
  );
};
