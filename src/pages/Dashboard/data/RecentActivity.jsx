import { useState } from "react";
import {
  Bell,
  CreditCard,
  UserPlus,
  CalendarX,
  SlidersHorizontal,
  Utensils,
  UserCog,
  CalendarDays,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useRecentActivity } from "./useRecentActivity";

const RECENT_ACTIVITY_META = {
  subscription: { label: "New Subscription", icon: CreditCard, tone: "bg-teal-100 text-teal-600" },
  account: { label: "Account Created", icon: UserPlus, tone: "bg-purple-100 text-purple-600" },
  cancellation: { label: "Meal Cancel Request", icon: CalendarX, tone: "bg-red-100 text-red-600" },
  customisation: { label: "Customisation Request", icon: SlidersHorizontal, tone: "bg-orange-100 text-orange-600" },
  diet: { label: "Diet Preference Updated", icon: Utensils, tone: "bg-amber-100 text-amber-600" },
  profile: { label: "Profile Updated", icon: UserCog, tone: "bg-blue-100 text-blue-600" },
  holiday: { label: "Holiday Added", icon: CalendarDays, tone: "bg-indigo-100 text-indigo-600" },
  meal_count: { label: "Meal Update", icon: ClipboardList, tone: "bg-teal-100 text-teal-600" },
  other: { label: "Other Activity", icon: Bell, tone: "bg-gray-100 text-gray-500" },
};

// A deterministic function of (category, description) — not a stored field —
// since most activity types here are one-time events with no real ongoing
// state to track. Kept honest to how this app's flows actually behave (e.g.
// cancellations/customisations here have no admin approval queue, so they
// read as "Processed"/"Requested" rather than a fabricated "Pending").
const STATUS_STYLES = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  orange: "bg-orange-100 text-orange-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

const getActivityStatus = (category, description) => {
  switch (category) {
    case "account":
      return { label: "Verified", color: "blue" };
    case "subscription":
      return { label: "Active", color: "green" };
    case "cancellation":
      return { label: "Processed", color: "amber" };
    case "customisation":
      return { label: "Requested", color: "orange" };
    case "diet":
    case "profile":
      return { label: "Updated", color: "blue" };
    case "holiday":
      return { label: "Scheduled", color: "indigo" };
    case "meal_count":
      return /delivered on/i.test(description || "")
        ? { label: "Delivered", color: "green" }
        : { label: "Updated", color: "blue" };
    default:
      return { label: "Logged", color: "gray" };
  }
};

const formatRelativeTime = (value) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const PREVIEW_COUNT = 10;

export const RecentActivity = () => {
  const { activities, isLoading } = useRecentActivity(24);
  const [showAll, setShowAll] = useState(false);

  const rows = showAll ? activities : activities.slice(0, PREVIEW_COUNT);

  return (
    <section className="mb-8">
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-9 h-9 rounded-full bg-green-50 text-theme-color-1">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Recent Activity</p>
              <p className="text-xs text-gray-400">Latest updates from your platform</p>
            </div>
          </div>
          {activities.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="flex gap-1 items-center px-3 py-1.5 text-sm font-semibold bg-gray-50 rounded-lg border border-gray-200 text-gray-700 hover:border-theme-color-1 hover:text-theme-color-1 whitespace-nowrap"
            >
              {showAll ? "Show Less" : "View All"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-gray-500">Loading recent activity...</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No activity in the last 24 hours.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Time", "Activity", "Details", "User", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((item) => {
                  const meta = RECENT_ACTIVITY_META[item.category] || RECENT_ACTIVITY_META.other;
                  const status = getActivityStatus(item.category, item.description);
                  return (
                    <tr key={item._id}>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatRelativeTime(item.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex gap-2 items-center font-semibold text-gray-900">
                          <span className={`flex flex-shrink-0 justify-center items-center w-7 h-7 rounded-full ${meta.tone}`}>
                            <meta.icon className="w-3.5 h-3.5" />
                          </span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-gray-600 truncate">{item.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.mobile && <p className="text-xs text-gray-400">{item.mobile}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status.color]}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentActivity;
