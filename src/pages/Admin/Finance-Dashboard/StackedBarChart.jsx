import { useState } from "react";
import { niceMax } from "./format";

const VIEW_W = 900;
const VIEW_H = 340;
const MARGIN = { top: 16, right: 16, bottom: 44, left: 64 };
const INNER_W = VIEW_W - MARGIN.left - MARGIN.right;
const INNER_H = VIEW_H - MARGIN.top - MARGIN.bottom;
const MAX_BAR_THICKNESS = 40;
const SEGMENT_GAP = 2;

// A stacked bar chart in plain SVG — segments separated by a 2px surface-color
// gap (never a stroke, per the dataviz skill), 4px rounded cap only on the
// topmost segment of each stack, hover tooltip listing every segment + the
// stack total, legend for 2+ series, and a table-view fallback.
export const StackedBarChart = ({ data, seriesKeys, title, valueFormatter = (v) => v }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No data for this range.</p>;
  }

  const totals = data.map((row) => seriesKeys.reduce((s, k) => s + (row[k.key] || 0), 0));
  const maxValue = niceMax(Math.max(1, ...totals));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxValue * f));

  const groupWidth = INNER_W / data.length;
  const barThickness = Math.min(MAX_BAR_THICKNESS, groupWidth * 0.6);

  const yFor = (value) => INNER_H - (Math.max(0, value) / maxValue) * INNER_H;
  const rotateLabels = data.length > 8;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap items-center gap-4">
          {seriesKeys.map((s) => (
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
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => (
                <tr key={row.month || row.label}>
                  <td className="px-3 py-2 text-gray-900">{row.label}</td>
                  {seriesKeys.map((s) => (
                    <td key={s.key} className="px-3 py-2 text-right text-gray-700">
                      {valueFormatter(row[s.key] || 0)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{valueFormatter(totals[i])}</td>
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
              <line x1={0} x2={INNER_W} y1={INNER_H} y2={INNER_H} stroke="#c3c2b7" strokeWidth={1} />

              {data.map((row, i) => {
                const x = i * groupWidth + (groupWidth - barThickness) / 2;
                const isHovered = hoverIndex === i;

                // stack segments bottom-up, leaving a 2px surface gap between them
                let cumulative = 0;
                const segments = seriesKeys
                  .map((s) => {
                    const raw = row[s.key] || 0;
                    const segTop = cumulative + raw;
                    cumulative = segTop;
                    return { key: s.key, color: s.color, from: segTop - raw, to: segTop, raw };
                  })
                  .filter((seg) => seg.raw > 0);

                return (
                  <g key={row.month || row.label}>
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
                    {segments.map((seg, si) => {
                      const isTop = si === segments.length - 1;
                      const yTop = yFor(seg.to);
                      const yBottom = yFor(seg.from);
                      // Pull the top edge down (away from the segment above) unless this
                      // IS the top segment; pull the bottom edge up (away from the segment
                      // below) unless this is the bottom segment sitting on the baseline.
                      const gapAdjustedTop = yTop + (isTop ? 0 : SEGMENT_GAP / 2);
                      const gapAdjustedBottom = yBottom - (si === 0 ? 0 : SEGMENT_GAP / 2);
                      const h = Math.max(0, gapAdjustedBottom - gapAdjustedTop);
                      const r = isTop ? Math.min(4, barThickness / 2, h) : 0;
                      return (
                        <path
                          key={seg.key}
                          d={
                            !isTop || h <= r
                              ? `M${x},${gapAdjustedBottom} h${barThickness} v${-h} h${-barThickness} Z`
                              : `M${x},${gapAdjustedBottom} ` +
                                `H${x + barThickness} ` +
                                `V${gapAdjustedTop + r} ` +
                                `Q${x + barThickness},${gapAdjustedTop} ${x + barThickness - r},${gapAdjustedTop} ` +
                                `H${x + r} ` +
                                `Q${x},${gapAdjustedTop} ${x},${gapAdjustedTop + r} ` +
                                `Z`
                          }
                          fill={seg.color}
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
                      transform={rotateLabels ? `rotate(-35 ${i * groupWidth + groupWidth / 2} ${INNER_H + 18})` : undefined}
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
                  <span className="font-medium">{valueFormatter(data[hoverIndex][s.key] || 0)}</span>
                  <span className="text-gray-500">{s.label}</span>
                </p>
              ))}
              <p className="mt-1 pt-1 border-t text-gray-900 font-semibold">Total: {valueFormatter(totals[hoverIndex])}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
