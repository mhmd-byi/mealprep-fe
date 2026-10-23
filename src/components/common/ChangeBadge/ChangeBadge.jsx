import { TrendingUp, TrendingDown } from "lucide-react";

// current vs previous, as a rounded whole-number percent. null means "no
// prior-period value to compare against" (e.g. previous was 0 and current
// is > 0 — not a meaningful percentage), 0 means "truly unchanged."
export const percentChange = (current, previous) => {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// goodWhenUp flips which direction is colored green vs red — e.g. revenue
// going up is good, cancellations going up is not.
export const ChangeBadge = ({ change, goodWhenUp = true, suffix = "vs last period" }) => {
  if (change === null || change === undefined) {
    return <p className="text-xs text-gray-400">New {suffix}</p>;
  }
  if (change === 0) {
    return <p className="text-xs font-semibold text-gray-400">No change {suffix}</p>;
  }
  const up = change > 0;
  const good = up === goodWhenUp;
  return (
    <p className={`inline-flex items-center gap-0.5 text-xs font-bold ${good ? "text-green-600" : "text-red-600"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(change)}% {suffix}
    </p>
  );
};

export default ChangeBadge;
