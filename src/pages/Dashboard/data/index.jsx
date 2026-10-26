import { useData } from "./useData";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Users, Settings2, XCircle, Clock, Truck, Crown, RefreshCw } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import { RecentActivity } from "./RecentActivity";
import { MealSlotIcon } from "../../../components/common/MealSlotIcon/MealSlotIcon";
import { ChangeBadge } from "../../../components/common/ChangeBadge/ChangeBadge";
import { getPlanDotColor } from "../../../planDisplay";

const Spinner = () => <div className="w-4 h-4 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent" />;

// Compact inline variant for cards that pack two numbers (Lunch/Dinner) into
// one cell — ChangeBadge's own paragraph layout is too tall to stack twice there.
const MiniTrend = ({ change, goodWhenUp = true }) => {
  if (change === null || change === undefined) return null;
  if (change === 0) return <span className="text-[10px] font-semibold text-gray-400">0%</span>;
  const up = change > 0;
  const good = up === goodWhenUp;
  return (
    <span className={`text-[10px] font-bold ${good ? "text-green-600" : "text-red-600"}`}>
      {up ? "↑" : "↓"}{Math.abs(change)}%
    </span>
  );
};

const StatCell = ({ icon: Icon, tone, label, value, loading, onClick, highlight, valueClassName = "text-gray-900", change, goodWhenUp = true, changeSuffix = "vs last week" }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex items-start gap-3 p-4 text-left w-full ${highlight ? "bg-red-50" : ""} ${onClick ? "hover:bg-gray-50" : ""}`}
    >
      <div className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${highlight ? "text-red-500" : "text-gray-500"}`}>{label}</p>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className={`text-xl font-bold ${valueClassName}`}>{value}</div>
            {change !== undefined && <ChangeBadge change={change} goodWhenUp={goodWhenUp} suffix={changeSuffix} />}
          </>
        )}
      </div>
    </Wrapper>
  );
};

export const Data = () => {
  const {
    allRegisteredUsersCount,
    allRegisteredUsersChange,
    newUsersThisMonth,
    cancelledMealsCount,
    cancelledMealsChange,
    mealDeliveryListCountDinner,
    mealDeliveryListCountDinnerChange,
    mealDeliveryListCountLunch,
    mealDeliveryListCountLunchChange,
    customisationRequestCount,
    customisationRequestChange,
    endingSoonCount,
    endingSoonUsers,
    weeklyCount,
    weeklyCountChange,
    monthlyCount,
    monthlyCountChange,
    trialCount,
    trialCountChange,
    loadingStates,
    isRefreshing,
    refresh,
  } = useData();

  const navigate = useNavigate();
  const [showEndingSoonModal, setShowEndingSoonModal] = useState(false);

  const handlePlanClick = (planType) => {
    navigate(`/dashboard/all-registered-users?plan=${planType}`);
  };

  return (
    <div className="px-4 pt-6 pb-2 text-left lg:pt-4">
      <div className="flex flex-wrap gap-3 justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Stats</h2>
          <p className="text-sm text-gray-500">Overview of your meal prep subscriptions.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 self-start px-3 py-1.5 text-sm font-semibold bg-white rounded-md border border-gray-200 text-gray-700 hover:border-theme-color-1 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid overflow-hidden grid-cols-2 mb-1 bg-white rounded-2xl border divide-x divide-y divide-gray-100 shadow-sm border-gray-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        <StatCell
          icon={Users}
          tone="bg-green-50 text-theme-color-1"
          label="All Registered Users"
          value={allRegisteredUsersCount}
          loading={loadingStates.users}
          onClick={() => navigate("/dashboard/all-registered-users")}
          change={allRegisteredUsersChange}
          changeSuffix="vs last month"
        />

        <StatCell
          icon={Truck}
          tone="bg-blue-50 text-blue-600"
          label="Delivery Count"
          loading={loadingStates.deliveryLunch || loadingStates.deliveryDinner}
          onClick={() => navigate("/dashboard/meal-delivery-list")}
          value={
            <div className="space-y-0.5">
              <div className="flex justify-between items-center w-full">
                <span className="flex gap-1 items-center text-xs font-medium text-gray-500">
                  <MealSlotIcon slot="lunch" />Lunch:
                </span>
                <span className="flex gap-1.5 items-center">
                  {mealDeliveryListCountLunch}
                  <MiniTrend change={mealDeliveryListCountLunchChange} />
                </span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="flex gap-1 items-center text-xs font-medium text-gray-500">
                  <MealSlotIcon slot="dinner" />Dinner:
                </span>
                <span className="flex gap-1.5 items-center">
                  {mealDeliveryListCountDinner}
                  <MiniTrend change={mealDeliveryListCountDinnerChange} />
                </span>
              </div>
            </div>
          }
        />

        <StatCell
          icon={Settings2}
          tone="bg-amber-50 text-amber-600"
          label="Customised Request"
          value={customisationRequestCount}
          loading={loadingStates.customisation}
          onClick={() => navigate("/dashboard/get-list-of-customisation-request")}
          change={customisationRequestChange}
        />

        <StatCell
          icon={XCircle}
          tone="bg-red-50 text-red-600"
          label="Cancelled Request"
          value={cancelledMealsCount}
          loading={loadingStates.cancelled}
          onClick={() => navigate("/dashboard/user-cancel-request-list")}
          change={cancelledMealsChange}
          goodWhenUp={false}
        />

        <div className="flex items-start gap-3 p-4 w-full text-left">
          <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-purple-50 rounded-xl">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-1.5 text-xs font-medium text-gray-500">Active Subscriptions</p>
            {loadingStates.subscriptions ? (
              <Spinner />
            ) : (
              <div className="space-y-0.5">
                <button type="button" onClick={() => handlePlanClick("Weekly")} className="flex justify-between items-center w-full text-left hover:text-theme-color-1">
                  <span className="flex gap-1.5 items-center text-xs font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${getPlanDotColor("Weekly")}`} />Weekly:
                  </span>
                  <span className="flex gap-1.5 items-center">
                    <span className="text-xl font-bold text-gray-900">{weeklyCount}</span>
                    <MiniTrend change={weeklyCountChange} />
                  </span>
                </button>
                <button type="button" onClick={() => handlePlanClick("Monthly")} className="flex justify-between items-center w-full text-left hover:text-theme-color-1">
                  <span className="flex gap-1.5 items-center text-xs font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${getPlanDotColor("Monthly")}`} />Monthly:
                  </span>
                  <span className="flex gap-1.5 items-center">
                    <span className="text-xl font-bold text-gray-900">{monthlyCount}</span>
                    <MiniTrend change={monthlyCountChange} />
                  </span>
                </button>
                <button type="button" onClick={() => handlePlanClick("Trial")} className="flex justify-between items-center w-full text-left hover:text-theme-color-1">
                  <span className="flex gap-1.5 items-center text-xs font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${getPlanDotColor("Trial")}`} />Trial:
                  </span>
                  <span className="flex gap-1.5 items-center">
                    <span className="text-xl font-bold text-gray-900">{trialCount}</span>
                    <MiniTrend change={trialCountChange} />
                  </span>
                </button>
              </div>
            )}
          </div>
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
                              <span className="inline-flex items-center gap-1"><MealSlotIcon slot="lunch" />Lunch: {(user.mealCounts?.lunchMeals || 0) + (user.mealCounts?.nextDayLunchMeals || 0)}</span>,{" "}
                              <span className="inline-flex items-center gap-1"><MealSlotIcon slot="dinner" />Dinner: {(user.mealCounts?.dinnerMeals || 0) + (user.mealCounts?.nextDayDinnerMeals || 0)}</span>
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
