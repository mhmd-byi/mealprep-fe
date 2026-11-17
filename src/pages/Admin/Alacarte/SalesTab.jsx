import { useState } from "react";
import { Download, Info } from "lucide-react";
import { downloadCSV } from "../Finance-Dashboard/exportCsv";
import { formatDateKey, formatINR, inputClass, outlineButton } from "./alacarteDisplay";
import { buildSalesCSV, presetRange, rangeProblem, SALES_PRESETS, toDateKey } from "./salesRange";
import { errorText, useAlacarteSales } from "./useAlacarteAdmin";

const Tile = ({ label, value, note }) => (
  <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    {note && <p className="mt-0.5 text-xs text-gray-500">{note}</p>}
  </div>
);

const HEADINGS = [
  { label: "Date", align: "text-left" },
  { label: "Orders", align: "text-right" },
  { label: "Items", align: "text-right" },
  { label: "Items amount", align: "text-right" },
  { label: "Delivery fees", align: "text-right" },
  { label: "Total sales", align: "text-right" },
];

const count = (value) => Number(value || 0).toLocaleString("en-IN");

export const SalesTab = () => {
  const [preset, setPreset] = useState("7d");
  const [range, setRange] = useState(() => presetRange("7d"));
  const [hideEmpty, setHideEmpty] = useState(false);

  const problem = rangeProblem(range);
  const { data, isLoading, isError, error } = useAlacarteSales(range, !problem);

  const choosePreset = (key) => {
    setPreset(key);
    setRange(presetRange(key));
  };

  const changeDate = (field) => (event) => {
    setPreset("custom");
    setRange((current) => ({ ...current, [field]: event.target.value }));
  };

  const days = data ? [...data.days].reverse().filter((day) => !hideEmpty || day.orders > 0) : [];
  const today = toDateKey(new Date());

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start p-3 text-sm text-blue-800 bg-blue-50 rounded-lg">
        <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
        <p>
          Sales are counted on the day the customer paid. Orders that were never paid or have expired are left out. These figures match the À la carte line on the
          Finance dashboard.
        </p>
      </div>

      <div className="p-4 space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {SALES_PRESETS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => choosePreset(item.key)}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border ${
                preset === item.key ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-200 hover:border-theme-color-1"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="sales-start" className="block mb-1 text-xs text-gray-500">
              From
            </label>
            <input id="sales-start" type="date" className={`${inputClass} sm:w-44`} value={range.startDate} max={today} onChange={changeDate("startDate")} />
          </div>
          <div>
            <label htmlFor="sales-end" className="block mb-1 text-xs text-gray-500">
              To
            </label>
            <input id="sales-end" type="date" className={`${inputClass} sm:w-44`} value={range.endDate} max={today} onChange={changeDate("endDate")} />
          </div>
          <button type="button" className={`${outlineButton} inline-flex gap-1.5 items-center`} disabled={!data || Boolean(problem)} onClick={() => downloadCSV(buildSalesCSV(data), `alacarte-sales-${data.startDate}-to-${data.endDate}.csv`)}>
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {problem && <p className="text-sm text-red-600">{problem}</p>}
      </div>

      {!problem && isError && <p className="text-sm text-red-600">{errorText(error, "Could not load the sales for this range.")}</p>}

      {!problem && isLoading && <p className="py-10 text-center text-gray-500">Loading sales...</p>}

      {!problem && data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile
              label="Total sales"
              value={formatINR(data.totals.total)}
              note={`Items ${formatINR(data.totals.subtotal)} + delivery ${formatINR(data.totals.deliveryFee)}`}
            />
            <Tile label="Orders" value={count(data.totals.orders)} note={`${count(data.totals.items)} item${data.totals.items === 1 ? "" : "s"} sold`} />
            <Tile label="Average order" value={formatINR(data.totals.averageOrder)} />
            <Tile
              label="Best day"
              value={data.bestDay ? formatINR(data.bestDay.total) : "—"}
              note={data.bestDay ? `${formatDateKey(data.bestDay.date)} · ${data.bestDay.orders} order${data.bestDay.orders === 1 ? "" : "s"}` : "No sales in this range"}
            />
          </div>

          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-3 justify-between items-center p-4 border-b border-gray-100">
              <div>
                <p className="text-base font-bold text-gray-900">Day-wise sales</p>
                <p className="text-sm text-gray-500">
                  {formatDateKey(data.startDate)} – {formatDateKey(data.endDate)}
                </p>
              </div>
              <label className="flex gap-2 items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={hideEmpty} onChange={(event) => setHideEmpty(event.target.checked)} className="w-4 h-4 accent-theme-color-1" />
                Hide days with no sales
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {HEADINGS.map((heading) => (
                      <th key={heading.label} className={`px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase whitespace-nowrap ${heading.align}`}>
                        {heading.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {days.length === 0 ? (
                    <tr>
                      <td colSpan={HEADINGS.length} className="px-4 py-8 text-center text-gray-500">
                        No sales in this range.
                      </td>
                    </tr>
                  ) : (
                    days.map((day) => {
                      const quiet = day.orders === 0;
                      const cellClass = `px-4 py-3 text-right whitespace-nowrap ${quiet ? "text-gray-300" : "text-gray-700"}`;
                      return (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className={`px-4 py-3 font-medium whitespace-nowrap ${quiet ? "text-gray-400" : "text-gray-900"}`}>{formatDateKey(day.date)}</td>
                          <td className={cellClass}>{quiet ? "—" : count(day.orders)}</td>
                          <td className={cellClass}>{quiet ? "—" : count(day.items)}</td>
                          <td className={cellClass}>{quiet ? "—" : formatINR(day.subtotal)}</td>
                          <td className={cellClass}>{quiet ? "—" : formatINR(day.deliveryFee)}</td>
                          <td className={`${cellClass} ${quiet ? "" : "font-semibold text-gray-900"}`}>{quiet ? "—" : formatINR(day.total)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-bold text-gray-900">
                    <td className="px-4 py-3 whitespace-nowrap">Total</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{count(data.totals.orders)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{count(data.totals.items)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatINR(data.totals.subtotal)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatINR(data.totals.deliveryFee)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatINR(data.totals.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesTab;
