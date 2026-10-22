import { useState } from "react";
import { Users, XCircle, Search } from "lucide-react";
import { MealSlotIcon } from "../../../components/common/MealSlotIcon/MealSlotIcon";
import { VegNonVegIcon } from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { useDeliveredMealLog } from "./useDeliveredMealLog";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const StatTile = ({ icon, tone, label, value }) => (
  <div className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-xl ${tone}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const NameCell = ({ name }) => (
  <div className="flex gap-2 items-center">
    <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-xs font-bold text-green-800 bg-green-100 rounded-full">
      {getInitials(name)}
    </div>
    <span className="font-medium text-gray-900 whitespace-nowrap">{name}</span>
  </div>
);

const NameList = ({ rows, emptyLabel }) => {
  if (rows.length === 0) {
    return <p className="py-6 text-sm text-center text-gray-400">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Name</th>
            <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={`${row.userId}-${i}`}>
              <td className="px-3 py-2">
                <NameCell name={row.name} />
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <VegNonVegIcon value={row.dietaryType} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DeliveredMealLog = () => {
  const { date, setDate, data, isLoading, error, todayDateString } = useDeliveredMealLog();
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();
  const matches = (row) => !query || row.name.toLowerCase().includes(query);

  const lunchRows = (data?.lunch?.deliveries || []).filter(matches);
  const dinnerRows = (data?.dinner?.deliveries || []).filter(matches);
  const endedRows = (data?.endedSubscriptions || []).filter(matches);

  return (
    <div className="p-4 w-full text-left sm:p-6 md:p-8">
      <div className="mx-auto space-y-6 w-full">
        <div>
          <p className="text-sm text-gray-500">Dashboard &rsaquo; Meal Delivery List &rsaquo; Delivered</p>
          <h2 className="text-2xl font-bold text-gray-900">Delivered Meal Log</h2>
          <p className="text-sm text-gray-500">
            What actually went out on any day — pick a date to see who got a meal delivered, and whose plan ended that day.
          </p>
        </div>

        <div className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Date</label>
              <input
                type="date"
                value={date}
                max={todayDateString}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Search by name</label>
              <div className="flex gap-2 items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter the lists below..."
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {isLoading ? (
            <p className="py-10 text-center text-gray-500">Loading delivery log...</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700">{formatDisplayDate(date)}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile icon={<MealSlotIcon slot="lunch" className="w-5 h-5" />} tone="bg-amber-50 text-amber-600" label="Lunch Delivered" value={data?.lunch?.count ?? 0} />
                <StatTile icon={<MealSlotIcon slot="dinner" className="w-5 h-5" />} tone="bg-indigo-50 text-indigo-600" label="Dinner Delivered" value={data?.dinner?.count ?? 0} />
                <StatTile icon={<XCircle className="w-5 h-5" />} tone="bg-red-50 text-red-600" label="Subscriptions Ended" value={data?.endedSubscriptions?.length ?? 0} />
              </div>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-2 items-center p-4 border-b border-gray-100">
                <MealSlotIcon slot="lunch" />
                <p className="font-bold text-gray-900">Lunch Deliveries ({lunchRows.length})</p>
              </div>
              <NameList rows={lunchRows} emptyLabel="No lunch deliveries logged for this day." />
            </div>
            <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-2 items-center p-4 border-b border-gray-100">
                <MealSlotIcon slot="dinner" />
                <p className="font-bold text-gray-900">Dinner Deliveries ({dinnerRows.length})</p>
              </div>
              <NameList rows={dinnerRows} emptyLabel="No dinner deliveries logged for this day." />
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-2 items-center p-4 border-b border-gray-100">
              <Users className="w-4 h-4 text-red-600" />
              <p className="font-bold text-gray-900">Subscriptions That Ended This Day ({endedRows.length})</p>
            </div>
            {endedRows.length === 0 ? (
              <p className="py-6 text-sm text-center text-gray-400">No subscriptions ended on this day.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Mobile</th>
                      <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Plan</th>
                      <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">Ended At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {endedRows.map((row, i) => (
                      <tr key={`${row.userId}-${i}`}>
                        <td className="px-3 py-2">
                          <NameCell name={row.name} />
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.mobile || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{row.plan}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{formatDateTime(row.endedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveredMealLog;
