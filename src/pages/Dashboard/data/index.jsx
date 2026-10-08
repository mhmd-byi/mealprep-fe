import { useData } from "./useData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Utensils, Users, Settings2, XCircle, Clock } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { RecentActivity } from "./RecentActivity";

const StatCard = ({ icon: Icon, tone, label, value, loading, hint, onClick, valueClassName = "text-gray-900" }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-left w-full ${onClick ? "hover:border-theme-color-1 cursor-pointer" : ""}`}
    >
      <div className={`flex justify-center items-center mb-2 w-10 h-10 rounded-xl ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="flex items-center py-1">
          <div className="w-5 h-5 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent"></div>
        </div>
      ) : (
        <p className={`text-2xl font-bold mt-0.5 ${valueClassName}`}>{value}</p>
      )}
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </Wrapper>
  );
};

export const Data = () => {
  const {
    allRegisteredUsersCount,
    newUsersThisMonth,
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

  const navigate = useNavigate();
  const [showEndingSoonModal, setShowEndingSoonModal] = useState(false);

  const handlePlanClick = (planType) => {
    navigate(`/dashboard/all-registered-users?plan=${planType}`);
  };

  const deliveredToday = mealDeliveryListCountLunch + mealDeliveryListCountDinner;
  const activeSubscribers = weeklyCount + monthlyCount + trialCount;
  const mealsTodayTotal = deliveredToday + cancelledMealsCount;
  const cancelledPercent = mealsTodayTotal > 0 ? Math.round((cancelledMealsCount / mealsTodayTotal) * 100) : 0;

  return (
    <div className="px-4 pt-6 pb-2 lg:pt-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Today's Stats</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 lg:grid-cols-5">
        <StatCard
          icon={Utensils}
          tone="bg-green-50 text-theme-color-1"
          label="Meals Delivered Today"
          value={deliveredToday}
          loading={loadingStates.deliveryLunch || loadingStates.deliveryDinner}
          hint={`Lunch: ${mealDeliveryListCountLunch} · Dinner: ${mealDeliveryListCountDinner}`}
        />

        <StatCard
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          label="Active Subscribers"
          value={activeSubscribers}
          loading={loadingStates.subscriptions}
          hint={`of ${allRegisteredUsersCount} registered`}
        />

        <StatCard
          icon={Settings2}
          tone="bg-amber-50 text-amber-600"
          label="Customised Requests Today"
          value={customisationRequestCount}
          loading={loadingStates.customisation}
        />

        <StatCard
          icon={XCircle}
          tone="bg-red-50 text-red-600"
          label="Meals Cancelled Today"
          value={cancelledMealsCount}
          loading={loadingStates.cancelled}
          hint={`${cancelledPercent}% of today's meals`}
        />

        <StatCard
          icon={Clock}
          tone="bg-red-50 text-red-600"
          label="Ending Soon (3 Days)"
          value={endingSoonCount}
          loading={loadingStates.users}
          valueClassName="text-red-600 underline"
          onClick={() => setShowEndingSoonModal(true)}
        />
      </div>

      <div className="p-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Active Subscribers by Plan</p>
        <div className="grid grid-cols-3 gap-4">
          <button type="button" onClick={() => handlePlanClick("Weekly")} className="text-left transition-opacity hover:opacity-80">
            <p className="text-xs text-gray-500">Weekly</p>
            <p className="text-xl font-bold text-gray-900">{loadingStates.subscriptions ? "…" : weeklyCount}</p>
          </button>
          <button type="button" onClick={() => handlePlanClick("Monthly")} className="text-left transition-opacity hover:opacity-80">
            <p className="text-xs text-gray-500">Monthly</p>
            <p className="text-xl font-bold text-gray-900">{loadingStates.subscriptions ? "…" : monthlyCount}</p>
          </button>
          <button type="button" onClick={() => handlePlanClick("Trial")} className="text-left transition-opacity hover:opacity-80">
            <p className="text-xs text-gray-500">Trial</p>
            <p className="text-xl font-bold text-gray-900">{loadingStates.subscriptions ? "…" : trialCount}</p>
          </button>
        </div>
        {!loadingStates.users && newUsersThisMonth > 0 && (
          <p className="mt-3 text-xs text-gray-400">+{newUsersThisMonth} new registered users this month</p>
        )}
      </div>

      <RecentActivity />

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
