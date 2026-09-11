import { useState } from "react";

const SIZE = 220;
const CENTER = SIZE / 2;
const OUTER_R = 100;
const INNER_R = 58;
const GAP_DEG = 1.5;
const OTHER_COLOR = "#898781";
const OTHER_LABEL = "Other";

const polarToXY = (angleDeg, r) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
};

const arcPath = (startDeg, endDeg, outerR, innerR) => {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const [x1, y1] = polarToXY(startDeg, outerR);
  const [x2, y2] = polarToXY(endDeg, outerR);
  const [x3, y3] = polarToXY(endDeg, innerR);
  const [x4, y4] = polarToXY(startDeg, innerR);
  return (
    `M${x1},${y1} A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2} ` +
    `L${x3},${y3} A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4} Z`
  );
};

// Donut chart in plain SVG. Slices below `otherThresholdPct` of the total are
// folded into a single muted-gray "Other" slice, per the app's existing
// convention for a non-categorical fold-in bucket (same as Expenses' own
// "Other" category) — keeps the wheel readable regardless of how many real
// categories/plans/methods exist.
export const PieChart = ({ data, title, valueFormatter = (v) => v, otherThresholdPct = 3 }) => {
  const [hoverKey, setHoverKey] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (!data || data.length === 0 || total <= 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No data for this range.</p>;
  }

  const main = [];
  let otherValue = 0;
  data.forEach((d) => {
    const pct = (d.value / total) * 100;
    if (pct < otherThresholdPct) otherValue += d.value;
    else main.push(d);
  });
  const slices = [...main.sort((a, b) => b.value - a.value)];
  if (otherValue > 0) slices.push({ label: OTHER_LABEL, value: otherValue, color: OTHER_COLOR });

  const gapTotal = GAP_DEG * slices.length;
  let cursor = 0;
  const arcs = slices.map((s) => {
    const span = ((s.value / total) * 360 * (360 - gapTotal)) / 360;
    const start = cursor;
    const end = cursor + span;
    cursor = end + GAP_DEG;
    return { ...s, start, end, pct: Math.round((s.value / total) * 1000) / 10 };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{title}</span>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-theme-color-1 hover:underline whitespace-nowrap"
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <table className="w-full text-sm divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-100">
            {arcs.map((s) => (
              <tr key={s.label}>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-gray-900">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{valueFormatter(s.value)}</td>
                <td className="px-3 py-2 text-right text-gray-500 w-16">{s.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
              {arcs.map((s) => (
                <path
                  key={s.label}
                  d={arcPath(s.start, s.end, hoverKey === s.label ? OUTER_R + 4 : OUTER_R, INNER_R)}
                  fill={s.color}
                  onMouseEnter={() => setHoverKey(s.label)}
                  onMouseLeave={() => setHoverKey(null)}
                  onFocus={() => setHoverKey(s.label)}
                  onBlur={() => setHoverKey(null)}
                  tabIndex={0}
                  style={{ cursor: "pointer", transition: "d 0.1s" }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {hoverKey ? (
                <>
                  <span className="text-xs text-gray-500">{hoverKey}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {valueFormatter(arcs.find((a) => a.label === hoverKey)?.value || 0)}
                  </span>
                  <span className="text-xs text-gray-400">{arcs.find((a) => a.label === hoverKey)?.pct}%</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">{valueFormatter(total)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {arcs.map((s) => (
              <div
                key={s.label}
                onMouseEnter={() => setHoverKey(s.label)}
                onMouseLeave={() => setHoverKey(null)}
                className={`flex items-center gap-2 text-xs rounded px-1.5 py-1 cursor-pointer ${
                  hoverKey === s.label ? "bg-gray-100" : ""
                }`}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-gray-700 flex-1 truncate">{s.label}</span>
                <span className="font-medium text-gray-900">{valueFormatter(s.value)}</span>
                <span className="text-gray-400 w-10 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;
