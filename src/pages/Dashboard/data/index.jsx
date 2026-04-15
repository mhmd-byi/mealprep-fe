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
    monthlyCount 
  } = useData();
  const navigate = useNavigate();
  const [showEndingSoonModal, setShowEndingSoonModal] = useState(false);

  const handlePlanClick = (planType) => {
    navigate('/dashboard/all-registered-users', { state: { planType } });
  };

  return (
    <div className="px-4 my-16 lg:mt-4">
      <section className="mb-6 flex justify-center">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Today's Stats</p>
        </div>
      </section>
      
      {/* Table view for medium and larger screens */}
      <section className="p-8 gap-10 hidden md:flex flex-col items-center justify-center rounded-lg bg-white border-2 border-theme-color-1 shadow-sm transition-all duration-300 hover:shadow-md hover:border-theme-color-2">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 text-center">
            <tr>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">All Registered Users</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Delivery count</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Customised request</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Cancelled request</th>
              <th className="px-6 py-3 text-md font-medium uppercase tracking-wider text-green-600">Active Subscriptions</th>
              <th className="px-6 py-3 text-md font-medium uppercase tracking-wider text-red-600">Ending Soon (3 Days)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{allRegisteredUsersCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">Lunch: {mealDeliveryListCountLunch} <br />Dinner: {mealDeliveryListCountDinner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{customisationRequestCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{cancelledMealsCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 font-bold">
                <span 
                  className="cursor-pointer hover:text-theme-color-1 transition-colors duration-200"
                  onClick={() => handlePlanClick('Weekly')}
                >
                  Weekly: {weeklyCount}
                </span>
                <br /> 
                <span 
                   className="cursor-pointer hover:text-theme-color-1 transition-colors duration-200"
                   onClick={() => handlePlanClick('Monthly')}
                >
                  Monthly: {monthlyCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-red-600 font-bold underline cursor-pointer hover:text-red-700" onClick={() => setShowEndingSoonModal(true)}>
                {endingSoonCount}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Card view for mobile screens */}
      <section className="md:hidden space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">All Registered Users</h3>
          <p className="text-xl font-semibold text-gray-900">{allRegisteredUsersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Delivery Count</h3>
          <div className="space-y-1">
            <p className="text-gray-900">
              <span className="font-medium">Lunch:</span> {mealDeliveryListCountLunch}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Dinner:</span> {mealDeliveryListCountDinner}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 shadow-sm border-green-200">
          <h3 className="text-green-700 text-sm font-medium uppercase mb-2">Active Subscriptions</h3>
          <div className="flex justify-between items-center">
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handlePlanClick('Weekly')}
            >
              <p className="text-xs text-gray-500">Weekly</p>
              <p className="text-xl font-bold text-gray-900">{weeklyCount}</p>
            </div>
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handlePlanClick('Monthly')}
            >
              <p className="text-xs text-gray-500">Monthly</p>
              <p className="text-xl font-bold text-gray-900">{monthlyCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Customised Request</h3>
          <p className="text-xl font-semibold text-gray-900">{customisationRequestCount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Cancelled Request</h3>
          <p className="text-xl font-semibold text-gray-900">{cancelledMealsCount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-red-200 shadow-sm">
          <h3 className="text-red-700 text-sm font-medium uppercase mb-2">Subscriptions Ending Soon (3 Days)</h3>
          <p className="text-xl font-bold text-red-600 underline cursor-pointer" onClick={() => setShowEndingSoonModal(true)}>{endingSoonCount}</p>
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
                <div key={date} className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-theme-color-1">{date}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meals Left</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {user.mobile}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-color-1 font-semibold">
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
              <p className="py-10 text-center text-gray-500 font-medium">No subscriptions ending in the next 3 days.</p>
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
