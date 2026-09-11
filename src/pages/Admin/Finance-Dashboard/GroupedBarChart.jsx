import { useState } from "react";
import { formatCompactINR, formatINR, niceMax } from "./format";

const VIEW_W = 900;
const VIEW_H = 340;
const MARGIN = { top: 16, right: 16, bottom: 44, left: 64 };
const INNER_W = VIEW_W - MARGIN.left - MARGIN.right;
const INNER_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const MAX_BAR_THICKNESS = 24;
const BAR_GAP = 2;

// A grouped bar chart (1..N series per category) built in plain SVG, following
// the dataviz skill: thin capped bars, hairline gridlines, a shared single
// axis (all series here are the same unit, so no dual-axis issue), a legend
// for 2+ series, and a hover tooltip that lists every series at that X — plus
// a plain-table fallback so every value stays reachable without hovering.
export const GroupedBarChart = ({ data, seriesKeys, title }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No data for this range.</p>;
  }

  const allValues = data.flatMap((row) => seriesKeys.map((s) => row[s.key] || 0));
  const maxValue = niceMax(Math.max(1, ...allValues));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxValue * f));

  const groupWidth = INNER_W / data.length;
  const barsPerGroup = seriesKeys.length;
  const barThickness = Math.min(
    MAX_BAR_THICKNESS,
    (groupWidth - BAR_GAP * (barsPerGroup + 1)) / barsPerGroup
  );
  const groupBarsWidth = barThickness * barsPerGroup + BAR_GAP * (barsPerGroup - 1);

  const yFor = (value) => INNER_H - (Math.max(0, value) / maxValue) * INNER_H;
  const rotateLabels = data.length > 8;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap items-center gap-4">
          {seriesKeys.length > 1 &&
            seriesKeys.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-theme-color-1 hover:underline whitespace-nowrap print:hidden"
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
                      {formatINR(row[s.key] || 0)}
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
              {/* Gridlines + Y ticks */}
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={0}
                    x2={INNER_W}
                    y1={yFor(tick)}
                    y2={yFor(tick)}
                    stroke="#e1e0d9"
                    strokeWidth={1}
                  />
                  <text x={-8} y={yFor(tick)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#898781">
                    {formatCompactINR(tick)}
                  </text>
                </g>
              ))}
              {/* Baseline */}
              <line x1={0} x2={INNER_W} y1={INNER_H} y2={INNER_H} stroke="#c3c2b7" strokeWidth={1} />

              {/* Bars + hover hit targets */}
              {data.map((row, i) => {
                const groupX = i * groupWidth + (groupWidth - groupBarsWidth) / 2;
                const isHovered = hoverIndex === i;
                return (
                  <g key={row.month || row.label}>
                    {/* invisible full-height hit target, bigger than the bars themselves */}
                    <rect
                      x={i * groupWidth}
                      y={0}
                      width={groupWidth}
                      height={INNER_H}
                      fill="transparent"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onFocus={() => setHoverIndex(i)}
                      onBlur={() => setHoverIndex(null)}
                      tabIndex={0}
                    />
                    {seriesKeys.map((s, si) => {
                      const value = row[s.key] || 0;
                      const barH = Math.max(0, INNER_H - yFor(value));
                      const x = groupX + si * (barThickness + BAR_GAP);
                      const y = yFor(value);
                      const r = Math.min(4, barThickness / 2, barH);
                      return (
                        <path
                          key={s.key}
                          d={
                            barH <= r
                              ? `M${x},${INNER_H} h${barThickness} v${-barH} h${-barThickness} Z`
                              : `M${x},${INNER_H} ` +
                                `H${x + barThickness} ` +
                                `V${y + r} ` +
                                `Q${x + barThickness},${y} ${x + barThickness - r},${y} ` +
                                `H${x + r} ` +
                                `Q${x},${y} ${x},${y + r} ` +
                                `Z`
                          }
                          fill={s.color}
                          opacity={isHovered || hoverIndex === null ? 1 : 0.45}
                          pointerEvents="none"
                        />
                      );
                    })}
                    <text
                      x={i * groupWidth + groupWidth / 2}
                      y={INNER_H + 18}
                      textAnchor={rotateLabels ? "end" : "middle"}
                      fontSize={11}
                      fill="#52514e"
                      transform={
                        rotateLabels
                          ? `rotate(-35 ${i * groupWidth + groupWidth / 2} ${INNER_H + 18})`
                          : undefined
                      }
                    >
                      {row.label}
                    </text>
                  </g>
                );
              })}
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
                  <span className="font-medium">{formatINR(data[hoverIndex][s.key] || 0)}</span>
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

export default GroupedBarChart;
