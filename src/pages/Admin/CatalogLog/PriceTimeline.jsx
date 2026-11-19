import { formatINR } from "../../../alacarteDisplay";
import { percentText } from "./catalogLogDisplay";
import { usePriceHistory } from "./useCatalogLog";

const dayText = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const rowsOf = (entries) =>
  entries.flatMap((entry) => {
    if (entry.action === "created") {
      const price = (entry.snapshot || []).find((item) => item.label === "Price");
      return price ? [{ key: `${entry._id}-created`, at: entry.createdAt, text: `Added at ${formatINR(price.value)}`, by: entry.adminName }] : [];
    }
    return (entry.changes || [])
      .filter((change) => change.kind === "money")
      .map((change) => ({
        key: `${entry._id}-${change.field}`,
        at: entry.createdAt,
        text: `${change.label}: ${change.before === null ? "none" : formatINR(change.before)} → ${change.after === null ? "none" : formatINR(change.after)} ${percentText(change.percent)}`.trim(),
        by: entry.adminName,
      }));
  });

export const PriceTimeline = ({ itemId }) => {
  const { data, isLoading } = usePriceHistory(itemId);
  if (!itemId) return null;

  const rows = rowsOf(data?.entries || []);

  return (
    <div className="p-3 space-y-2 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-sm font-semibold text-gray-700">Price history</p>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-400">No price changes recorded yet. Changes from now on will be listed here.</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.key} className="text-xs text-gray-600">
              <span className="font-medium text-gray-800">{dayText(row.at)}</span> · {row.text} <span className="text-gray-400">(by {row.by})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PriceTimeline;
