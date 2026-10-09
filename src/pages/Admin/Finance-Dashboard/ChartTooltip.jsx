import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MIN_EDGE_GAP = 90;

// Portals the tooltip to document.body and positions it with real viewport
// coordinates (not CSS percentages nested inside the chart), so it always
// renders above everything and is never clipped — or scrolled-into — by an
// ancestor with overflow-x-auto/overflow-hidden (e.g. a narrow card column).
export const ChartTooltip = ({ anchorRef, xRatio, children }) => {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const rawLeft = rect.left + rect.width * xRatio;
    const clampedLeft = Math.min(Math.max(rawLeft, MIN_EDGE_GAP), window.innerWidth - MIN_EDGE_GAP);
    setPos({ left: clampedLeft, top: rect.top + 8 });
  }, [anchorRef, xRatio]);

  if (!pos) return null;

  return createPortal(
    <div
      className="fixed z-[200] px-3 py-2 text-sm bg-white rounded-lg border shadow-lg pointer-events-none"
      style={{ left: pos.left, top: pos.top, transform: "translateX(-50%)" }}
    >
      {children}
    </div>,
    document.body
  );
};

export default ChartTooltip;
