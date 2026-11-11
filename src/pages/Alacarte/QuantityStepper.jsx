import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "./useCart";

export const QuantityStepper = ({ value, onChange, compact = false }) => {
  const size = compact ? "w-7 h-7" : "w-9 h-9";
  return (
    <div className="inline-flex items-center rounded-lg border-2 border-theme-color-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className={`flex justify-center items-center ${size} text-theme-color-1 hover:bg-theme-color-1 hover:text-white rounded-l-md`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="px-3 min-w-[2rem] text-sm font-bold text-center text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        className={`flex justify-center items-center ${size} text-theme-color-1 hover:bg-theme-color-1 hover:text-white rounded-r-md disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantityStepper;
