import { FileText, AlertTriangle, CheckCircle2, Plus, Pencil, RotateCcw, Trash2, Circle } from "lucide-react";
import { PRIORITY_DOT_STYLES, formatDueLabel, formatActivityTime } from "./noteDisplay";

const SummaryTile = ({ icon: Icon, tone, value, label }) => (
  <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
    <span className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg ${tone}`}>
      <Icon className="w-5 h-5" />
    </span>
    <div>
      <p className="text-xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

export const SummaryCard = ({ today }) => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <p className="mb-3 text-base font-bold text-gray-900">Today's Summary</p>
    <div className="grid grid-cols-2 gap-3">
      <SummaryTile icon={FileText} tone="bg-blue-100 text-blue-600" value={today.total} label="Total Notes" />
      <SummaryTile icon={AlertTriangle} tone="bg-red-100 text-red-600" value={today.high} label="High Priority" />
      <SummaryTile icon={AlertTriangle} tone="bg-amber-100 text-amber-600" value={today.medium} label="Medium Priority" />
      <SummaryTile icon={CheckCircle2} tone="bg-green-100 text-green-600" value={today.low} label="Low Priority" />
    </div>
  </div>
);

export const UpcomingCard = ({ items, onViewAll, onComplete }) => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-3">
      <p className="text-base font-bold text-gray-900">Upcoming / Pending</p>
      <button type="button" onClick={onViewAll} className="text-xs font-semibold text-theme-color-1 hover:underline">
        View All
      </button>
    </div>
    {items.length === 0 ? (
      <p className="py-4 text-sm text-center text-gray-400">Nothing pending with a due date.</p>
    ) : (
      <div className="space-y-4">
        {items.map((item) => {
          const overdue = new Date(item.dueAt) < new Date();
          return (
            <div key={item._id} className="flex gap-3 items-start">
              <span className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full ${PRIORITY_DOT_STYLES[item.priority]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 break-words">{item.title}</p>
                <p className={`text-xs ${overdue ? "font-semibold text-red-600" : "text-gray-500"}`}>
                  {overdue ? "Overdue · " : ""}
                  {formatDueLabel(item.dueAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onComplete(item)}
                className="flex-shrink-0 text-gray-300 hover:text-theme-color-1"
                aria-label={`Mark "${item.title}" as done`}
                title="Mark as done"
              >
                <Circle className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const ACTIVITY_ICONS = {
  added: { icon: Plus, tone: "bg-green-100 text-green-600" },
  updated: { icon: Pencil, tone: "bg-blue-100 text-blue-600" },
  completed: { icon: CheckCircle2, tone: "bg-green-100 text-green-600" },
  reopened: { icon: RotateCcw, tone: "bg-amber-100 text-amber-600" },
  deleted: { icon: Trash2, tone: "bg-red-100 text-red-600" },
};

export const RecentActivityCard = ({ activity }) => (
  <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <p className="mb-3 text-base font-bold text-gray-900">Recent Activity</p>
    {activity.length === 0 ? (
      <p className="py-4 text-sm text-center text-gray-400">No activity yet.</p>
    ) : (
      <div className="space-y-4">
        {activity.map((entry) => {
          const { icon: Icon, tone } = ACTIVITY_ICONS[entry.action] || ACTIVITY_ICONS.updated;
          return (
            <div key={entry._id} className="flex gap-3 items-start">
              <span className={`flex flex-shrink-0 justify-center items-center w-9 h-9 rounded-full ${tone}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Note {entry.action} by {entry.byName || "Admin"}
                </p>
                <p className="text-xs text-gray-500 break-words">{entry.noteTitle}</p>
              </div>
              <span className="flex-shrink-0 text-xs text-gray-400">{formatActivityTime(entry.createdAt)}</span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
