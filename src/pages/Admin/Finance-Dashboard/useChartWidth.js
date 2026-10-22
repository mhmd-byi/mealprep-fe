import { useEffect, useState } from "react";

const DEFAULT_WIDTH = 900;

// Measures the chart wrapper's real rendered width so the SVG's internal
// coordinate system can match the actual rendered box 1:1 (viewBox width ===
// pixel width, viewBox height === pixel height). With a fixed CSS height,
// a mismatched viewBox aspect ratio makes the browser letterbox/shrink the
// whole drawing to fit, leaving blank gutters either side instead of filling
// the card — this keeps the two in sync so there's nothing to reconcile.
export const useChartWidth = (ref) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};

export default useChartWidth;
