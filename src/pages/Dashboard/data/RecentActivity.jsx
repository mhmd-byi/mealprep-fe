import { useState } from "react";
import {
  Bell,
  CreditCard,
  UserPlus,
  CalendarX,
  SlidersHorizontal,
  Utensils,
  UserCog,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRecentActivity } from "./useRecentActivity";

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

const CATEGORIES = [
  { key: "account", label: "Account Created", icon: UserPlus, tone: "bg-purple-100 text-purple-600" },
  { key: "subscription", label: "New Subscription", icon: CreditCard, tone: "bg-teal-100 text-teal-600" },
  { key: "cancellation", label: "Cancellations", icon: CalendarX, tone: "bg-red-100 text-red-600" },
  { key: "customisation", label: "Customisation", icon: SlidersHorizontal, tone: "bg-orange-100 text-orange-600" },
  { key: "profile", label: "Profile Update", icon: UserCog, tone: "bg-blue-100 text-blue-600" },
  { key: "diet", label: "Meal Preference", icon: Utensils, tone: "bg-amber-100 text-amber-600" },
  { key: "meal_count", label: "Meal Logs / Meal Delivery", icon: ClipboardList, tone: "bg-teal-100 text-teal-600" },
  { key: "other", label: "Other", icon: Bell, tone: "bg-gray-100 text-gray-500" },
];

// "other" also catches holiday entries and anything not covered by a named
// category above, so every activity lands in some section instead of
// silently vanishing.
const matchesCategory = (item, categoryKey) => {
  if (categoryKey === "other") {
    return !CATEGORIES.some((c) => c.key !== "other" && c.key === item.category);
  }
  return item.category === categoryKey;
};

const ActivityTable = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {["Time", "Details", "User", "Status"].map((h) => (
            <th key={h} className="px-4 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((item) => {
          const status = getActivityStatus(item.category, item.description);
          return (
            <tr key={item._id}>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatRelativeTime(item.createdAt)}</td>
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
);

const AccordionSection = ({ category, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const rows = showAll ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full gap-3 p-4 text-left hover:bg-gray-50"
      >
        <span className="flex items-center gap-3">
          <span className={`flex flex-shrink-0 justify-center items-center w-9 h-9 rounded-full ${category.tone}`}>
            <category.icon className="w-4 h-4" />
          </span>
          <span className="font-semibold text-gray-900">{category.label}</span>
          <span className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">{items.length}</span>
        </span>
        {isOpen ? <ChevronUp className="flex-shrink-0 w-4 h-4 text-gray-400" /> : <ChevronDown className="flex-shrink-0 w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="pb-2">
          {category.key === "meal_count" && (
            <p className="px-4 pb-3 text-xs text-gray-400">
              The time shown here is when the kitchen's cutoff closed and the meal was logged — not when it reached the
              customer. Actual delivery is between 12:30–2:30 PM for lunch and 6:30–8:30 PM for dinner.
            </p>
          )}
          {items.length === 0 ? (
            <p className="py-6 text-sm text-center text-gray-500">No {category.label.toLowerCase()} activity in the last 24 hours.</p>
          ) : (
            <>
              <ActivityTable rows={rows} />
              {items.length > PREVIEW_COUNT && (
                <div className="flex justify-center p-3">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="px-3 py-1.5 text-sm font-semibold bg-gray-50 rounded-lg border border-gray-200 text-gray-700 hover:border-theme-color-1 hover:text-theme-color-1"
                  >
                    {showAll ? "Show Less" : `View All (${items.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const RecentActivity = () => {
  const { activities, isLoading } = useRecentActivity(24);

  return (
    <section className="mb-8">
      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-3 items-center p-4 border-b border-gray-100">
          <div className="flex justify-center items-center w-9 h-9 bg-green-50 rounded-full text-theme-color-1">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Recent Activity</p>
            <p className="text-xs text-gray-400">Latest updates from your platform — click a category to expand it</p>
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-gray-500">Loading recent activity...</p>
        ) : (
          <div>
            {CATEGORIES.map((category) => (
              <AccordionSection
                key={category.key}
                category={category}
                items={activities.filter((item) => matchesCategory(item, category.key))}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentActivity;
