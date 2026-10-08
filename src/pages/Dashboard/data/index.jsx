import { useData } from "./useData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Users, Settings2, XCircle, Clock, Truck, Crown } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { RecentActivity } from "./RecentActivity";

const Spinner = () => <div className="w-4 h-4 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent" />;

const StatCell = ({ icon: Icon, tone, label, value, loading, onClick, highlight, valueClassName = "text-gray-900" }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 text-left w-full ${highlight ? "bg-red-50" : ""} ${onClick ? "hover:bg-gray-50" : ""}`}
    >
      <div className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-medium ${highlight ? "text-red-500" : "text-gray-500"}`}>{label}</p>
        {loading ? <Spinner /> : <div className={`text-xl font-bold ${valueClassName}`}>{value}</div>}
      </div>
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

  return (
    <div className="px-4 pt-6 pb-2 text-left lg:pt-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Today's Stats</h2>
        <p className="text-sm text-gray-500">Overview of your meal prep subscriptions.</p>
      </div>

      <div className="grid overflow-hidden grid-cols-2 mb-1 bg-white rounded-2xl border divide-x divide-y divide-gray-100 shadow-sm border-gray-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        <StatCell
          icon={Users}
          tone="bg-green-50 text-theme-color-1"
          label="All Registered Users"
          value={allRegisteredUsersCount}
          loading={loadingStates.users}
          onClick={() => navigate("/dashboard/all-registered-users")}
        />

        <StatCell
          icon={Truck}
          tone="bg-blue-50 text-blue-600"
          label="Delivery Count"
          loading={loadingStates.deliveryLunch || loadingStates.deliveryDinner}
          value={
            <>
              Lunch: {mealDeliveryListCountLunch}
              <br />
              Dinner: {mealDeliveryListCountDinner}
            </>
          }
        />

        <StatCell
          icon={Settings2}
          tone="bg-amber-50 text-amber-600"
          label="Customised Request"
          value={customisationRequestCount}
          loading={loadingStates.customisation}
        />

        <StatCell
          icon={XCircle}
          tone="bg-red-50 text-red-600"
          label="Cancelled Request"
          value={cancelledMealsCount}
          loading={loadingStates.cancelled}
        />

        <div className="p-4">
          <p className="flex gap-1.5 items-center mb-1.5 text-xs font-medium text-gray-500">
            <Crown className="flex-shrink-0 w-3.5 h-3.5 text-purple-600" />
            Active Subscriptions
          </p>
          {loadingStates.subscriptions ? (
            <Spinner />
          ) : (
            <div className="space-y-0.5">
              <button type="button" onClick={() => handlePlanClick("Weekly")} className="flex justify-between items-center w-full text-sm text-left hover:text-theme-color-1">
                <span className="text-gray-500">Weekly:</span>
                <span className="font-bold text-gray-900">{weeklyCount}</span>
              </button>
              <button type="button" onClick={() => handlePlanClick("Monthly")} className="flex justify-between items-center w-full text-sm text-left hover:text-theme-color-1">
                <span className="text-gray-500">Monthly:</span>
                <span className="font-bold text-gray-900">{monthlyCount}</span>
              </button>
              <button type="button" onClick={() => handlePlanClick("Trial")} className="flex justify-between items-center w-full text-sm text-left hover:text-theme-color-1">
                <span className="text-gray-500">Trial:</span>
                <span className="font-bold text-gray-900">{trialCount}</span>
              </button>
            </div>
          )}
        </div>

        <StatCell
          icon={Clock}
          tone="bg-red-100 text-red-600"
          label="Ending Soon (3 Days)"
          value={endingSoonCount}
          loading={loadingStates.users}
          valueClassName="text-red-600 underline"
          onClick={() => setShowEndingSoonModal(true)}
          highlight
        />
      </div>

      {!loadingStates.users && newUsersThisMonth > 0 && (
        <p className="mb-3 text-xs text-gray-400">+{newUsersThisMonth} new registered users this month</p>
      )}

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
