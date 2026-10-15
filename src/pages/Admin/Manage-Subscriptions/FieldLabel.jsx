import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

const TOOLTIP_WIDTH = 288; // w-72
const EDGE_GAP = 12;

// Portals the help text to document.body with fixed, viewport-relative
// coordinates instead of positioning it absolute inside the field — these
// fields live inside Popup's scrollable modal body, and an absolutely
// positioned descendant still counts toward that container's scrollable
// overflow, so the tooltip was both getting clipped and making the modal's
// scrollbar pop in and out as it opened/closed.
export const FieldLabel = ({ label, help }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);

  const isVisible = isOpen || isHovering;

  useEffect(() => {
    if (!isVisible || !buttonRef.current) {
      setPos(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedHeight = Math.ceil(help.length / 40) * 16 + 28;
    const fitsBelow = rect.bottom + estimatedHeight + EDGE_GAP < window.innerHeight;
    const top = fitsBelow ? rect.bottom + 6 : rect.top - estimatedHeight - 6;
    const left = Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - EDGE_GAP);
    setPos({ left: Math.max(left, EDGE_GAP), top: Math.max(top, EDGE_GAP) });

    const closeOnScroll = () => { setIsOpen(false); setIsHovering(false); };
    window.addEventListener("scroll", closeOnScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll, { capture: true });
  }, [isVisible, help]);

  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={() => setIsOpen(false)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={`About ${label}`}
        aria-expanded={isOpen}
        className="text-gray-400 hover:text-theme-color-1 focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isVisible && pos &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[200] w-72 max-w-[85vw] p-3 text-xs font-normal leading-relaxed text-white bg-gray-800 rounded-md shadow-lg pointer-events-none"
            style={{ left: pos.left, top: pos.top }}
          >
            {help}
          </div>,
          document.body
        )}
    </div>
  );
};

export default FieldLabel;
