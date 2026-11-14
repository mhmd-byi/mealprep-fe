import { Link } from "react-router-dom";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { useMealSchedule } from "./useMealSchedule";
import { Info, Lock, Moon, Sun, Utensils } from "lucide-react";

const formatDayLabel = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const DietToggle = ({ value, locked, isSaving, onSelect }) => {
  if (locked) {
    return (
      <span
        className={`inline-flex gap-1 items-center px-2 py-1 rounded-full text-xs font-semibold ${
          value === "non-veg" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
        }`}
        title="Locked: within 3 days of delivery, already planned for"
      >
        <Lock className="w-3 h-3" />
        {value === "non-veg" ? "Non-Veg" : "Veg"}
      </span>
    );
  }
  return (
    <div className="inline-flex overflow-hidden text-xs rounded-lg border border-gray-300">
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "veg" && onSelect("veg")}
        className={`px-2 py-1 font-semibold ${value === "veg" ? "bg-theme-color-1 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
      >
        Veg
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => value !== "non-veg" && onSelect("non-veg")}
        className={`px-2 py-1 font-semibold border-l border-gray-300 ${
          value === "non-veg" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        Non-Veg
      </button>
    </div>
  );
};

const Notice = ({ children }) => (
  <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
    <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
    <p>{children}</p>
  </div>
);

export const MyMealSchedule = () => {
  const { isSubscribed, currentPlans, isLoading: isPlanLoading } = useSubscription();
  const isBothMealType = currentPlans.some((plan) => plan.mealType === "both");
  const { days, applicable, isLoading: isScheduleLoading, error: scheduleError, savingKey, updatePreference } = useMealSchedule(isBothMealType);

  const renderBody = () => {
    if (isPlanLoading) return <p className="py-10 text-center text-gray-500">Loading your plan...</p>;

    if (!isSubscribed) {
      return (
        <Notice>
          You don&apos;t have an active plan yet. Pick one on the{" "}
          <Link to="/dashboard/plans" className="font-semibold underline">
            Plans page
          </Link>{" "}
          and your meal schedule will appear here.
        </Notice>
      );
    }

    if (!isBothMealType) {
      return (
        <Notice>
          The meal schedule is for plans where you get both veg and non-veg meals, so you can choose one for each day. Your current plan has a fixed meal type.
        </Notice>
      );
    }

    return (
      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="flex gap-2 items-center mb-2 text-base font-bold text-gray-900">
          <Utensils className="w-5 h-5 text-theme-color-1" />
          Veg or Non-Veg for each day
        </p>
        <p className="mb-4 text-sm text-gray-500">
          Choose Veg or Non-Veg for each upcoming day. Any future day can be changed at any time. Today locks per meal once its cutoff passes (10:30 AM for lunch, 4:00 PM for
          dinner), same as cancellations.
        </p>

        {scheduleError && <p className="mb-3 text-sm text-red-600">{scheduleError}</p>}

        {isScheduleLoading ? (
          <p className="text-sm text-gray-500">Loading schedule...</p>
        ) : applicable && days.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Date</th>
                  {days.some((d) => d.lunch) && (
                    <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">
                      <span className="flex gap-1 items-center">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Lunch
                      </span>
                    </th>
                  )}
                  {days.some((d) => d.dinner) && (
                    <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">
                      <span className="flex gap-1 items-center">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        Dinner
                      </span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {days.map((day) => (
                  <tr key={day.date}>
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{formatDayLabel(day.date)}</td>
                    {days.some((d) => d.lunch) && (
                      <td className="px-3 py-3">
                        {day.lunch ? (
                          <DietToggle
                            value={day.lunch}
                            locked={day.lunchLocked}
                            isSaving={savingKey === `${day.date}_lunch`}
                            onSelect={(pref) => updatePreference(day.date, "lunch", pref)}
                          />
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    )}
                    {days.some((d) => d.dinner) && (
                      <td className="px-3 py-3">
                        {day.dinner ? (
                          <DietToggle
                            value={day.dinner}
                            locked={day.dinnerLocked}
                            isSaving={savingKey === `${day.date}_dinner`}
                            onSelect={(pref) => updatePreference(day.date, "dinner", pref)}
                          />
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No upcoming delivery days to schedule yet.</p>
        )}
      </div>
    );
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Meal Schedule</p>
            <h2 className="text-2xl font-bold text-gray-900">Meal Schedule</h2>
            <p className="text-sm text-gray-500">Decide which days you want veg and which days non-veg.</p>
          </div>
          {renderBody()}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default MyMealSchedule;
