import { useState } from "react";
import {
  Bell,
  ChevronRight,
  ChevronDown,
  CreditCard,
  UserPlus,
  CalendarX,
  SlidersHorizontal,
  Utensils,
  UserCog,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { useRecentActivity } from "./useRecentActivity";

const RECENT_ACTIVITY_META = {
  subscription: { label: "Subscription Purchased", icon: CreditCard, tone: "bg-teal-100 text-teal-600" },
  account: { label: "Account Created", icon: UserPlus, tone: "bg-purple-100 text-purple-600" },
  cancellation: { label: "Meal Cancelled", icon: CalendarX, tone: "bg-red-100 text-red-600" },
  customisation: { label: "Customized Meal", icon: SlidersHorizontal, tone: "bg-orange-100 text-orange-600" },
  diet: { label: "Diet Preference Updated", icon: Utensils, tone: "bg-amber-100 text-amber-600" },
  profile: { label: "Profile Updated", icon: UserCog, tone: "bg-blue-100 text-blue-600" },
  holiday: { label: "Holiday Added", icon: CalendarDays, tone: "bg-indigo-100 text-indigo-600" },
  meal_count: { label: "Meal Update", icon: ClipboardList, tone: "bg-teal-100 text-teal-600" },
  other: { label: "Other Activity", icon: Bell, tone: "bg-gray-100 text-gray-500" },
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

export const RecentActivity = () => {
  const { activities, isLoading } = useRecentActivity(24);
  const [expanded, setExpanded] = useState(null);

  const groups = Object.values(
    activities.reduce((acc, a) => {
      const key = a.category || "other";
      if (!acc[key]) acc[key] = { category: key, items: [] };
      acc[key].items.push(a);
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.items[0].createdAt) - new Date(a.items[0].createdAt));

  return (
    <section className="px-4 mb-8">
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex gap-2 items-center">
            <Bell className="w-5 h-5 text-theme-color-1" />
            <p className="text-base font-bold text-gray-900">Customer's Recent Activity</p>
            <span className="text-xs text-gray-400">(last 24 hours)</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full whitespace-nowrap">
            {activities.length} Total Activities
          </span>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-gray-500">Loading recent activity...</p>
        ) : groups.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No activity in the last 24 hours.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {groups.map((group) => {
              const meta = RECENT_ACTIVITY_META[group.category] || RECENT_ACTIVITY_META.other;
              const latest = group.items[0];
              const isOpen = expanded === group.category;
              return (
                <div key={group.category}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : group.category)}
                    className="flex gap-3 items-center p-4 w-full text-left hover:bg-gray-50"
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <div className={`flex flex-shrink-0 justify-center items-center w-9 h-9 rounded-full ${meta.tone}`}>
                      <meta.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="flex gap-2 items-center font-semibold text-gray-900">
                        {meta.label}
                        <span className="px-2 py-0.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full">{group.items.length}</span>
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Latest: {latest.name} {latest.mobile && `(${latest.mobile})`} — {formatRelativeTime(latest.createdAt)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-semibold text-theme-color-1 whitespace-nowrap">
                      {isOpen ? "Hide" : "Click to Expand"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2 bg-gray-50">
                      {group.items.map((item) => (
                        <div key={item._id} className="flex gap-2 justify-between items-center px-3 py-2 bg-white rounded-lg border border-gray-100">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name} {item.mobile && `· ${item.mobile}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                          </div>
                          <span className="flex-shrink-0 text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentActivity;
