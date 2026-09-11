import { useState } from "react";
import { niceMax } from "./format";

const VIEW_W = 900;
const VIEW_H = 340;
const MARGIN = { top: 16, right: 56, bottom: 44, left: 64 };
const INNER_W = VIEW_W - MARGIN.left - MARGIN.right;
const INNER_H = VIEW_H - MARGIN.top - MARGIN.bottom;

// A line chart in plain SVG — 2px lines, an end-dot per series, a crosshair
// that snaps to the nearest X and a tooltip listing every series at that X
// (per the dataviz skill's interaction spec), plus a table-view fallback.
export const LineChart = ({ data, seriesKeys, title, valueFormatter = (v) => v, allowNegative = false }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No data for this range.</p>;
  }

  const allValues = data.flatMap((row) => seriesKeys.map((s) => row[s.key] || 0));
  const dataMax = Math.max(0, ...allValues);
  const dataMin = allowNegative ? Math.min(0, ...allValues) : 0;
  const maxValue = niceMax(Math.max(1, dataMax));
  const minValue = allowNegative && dataMin < 0 ? -niceMax(Math.abs(dataMin)) : 0;
  const span = maxValue - minValue;

  const yFor = (value) => INNER_H - ((value - minValue) / span) * INNER_H;
  const xFor = (i) => (data.length === 1 ? INNER_W / 2 : (i / (data.length - 1)) * INNER_W);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(minValue + span * f));
  const rotateLabels = data.length > 8;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap items-center gap-4">
          {seriesKeys.length > 1 &&
            seriesKeys.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-theme-color-1 hover:underline whitespace-nowrap"
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                {seriesKeys.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.month || row.label}>
                  <td className="px-3 py-2 text-gray-900">{row.label}</td>
                  {seriesKeys.map((s) => (
                    <td key={s.key} className="px-3 py-2 text-right text-gray-700">
                      {valueFormatter(row[s.key] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto" role="img" aria-label={title}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line x1={0} x2={INNER_W} y1={yFor(tick)} y2={yFor(tick)} stroke="#e1e0d9" strokeWidth={1} />
                  <text x={-8} y={yFor(tick)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#898781">
                    {valueFormatter(tick)}
                  </text>
                </g>
              ))}
              {minValue < 0 && (
                <line x1={0} x2={INNER_W} y1={yFor(0)} y2={yFor(0)} stroke="#c3c2b7" strokeWidth={1} />
              )}

              {/* Hover hit targets — one per data point column */}
              {data.map((row, i) => {
                const bandW = data.length === 1 ? INNER_W : INNER_W / (data.length - 1);
                return (
                  <rect
                    key={row.month || row.label}
                    x={xFor(i) - bandW / 2}
                    y={0}
                    width={bandW}
                    height={INNER_H}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onFocus={() => setHoverIndex(i)}
                    onBlur={() => setHoverIndex(null)}
                    tabIndex={0}
                  />
                );
              })}

              {hoverIndex !== null && (
                <line
                  x1={xFor(hoverIndex)}
                  x2={xFor(hoverIndex)}
                  y1={0}
                  y2={INNER_H}
                  stroke="#c3c2b7"
                  strokeWidth={1}
                  pointerEvents="none"
                />
              )}

              {seriesKeys.map((s) => {
                const points = data.map((row, i) => [xFor(i), yFor(row[s.key] || 0)]);
                const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
                const last = points[points.length - 1];
                return (
                  <g key={s.key} pointerEvents="none">
                    <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {points.map(([x, y], i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={hoverIndex === i ? 5 : 3}
                        fill={s.color}
                        stroke="#fcfcfb"
                        strokeWidth={2}
                      />
                    ))}
                    <text x={last[0] + 6} y={last[1]} dominantBaseline="middle" fontSize={11} fill="#52514e">
                      {valueFormatter(data[data.length - 1][s.key] || 0)}
                    </text>
                  </g>
                );
              })}

              {data.map((row, i) => (
                <text
                  key={row.month || row.label}
                  x={xFor(i)}
                  y={INNER_H + 18}
                  textAnchor={rotateLabels ? "end" : "middle"}
                  fontSize={11}
                  fill="#52514e"
                  transform={rotateLabels ? `rotate(-35 ${xFor(i)} ${INNER_H + 18})` : undefined}
                >
                  {row.label}
                </text>
              ))}
            </g>
          </svg>

          {hoverIndex !== null && (
            <div
              className="absolute top-2 bg-white border rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none"
              style={{
                left: `${((hoverIndex + 0.5) / data.length) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-semibold text-gray-900 mb-1">{data[hoverIndex].label}</p>
              {seriesKeys.map((s) => (
                <p key={s.key} className="flex items-center gap-1.5 text-gray-700">
                  <span className="inline-block w-2 h-0.5 rounded" style={{ backgroundColor: s.color }} />
                  <span className="font-medium">{valueFormatter(data[hoverIndex][s.key] || 0)}</span>
                  <span className="text-gray-500">{s.label}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LineChart;
