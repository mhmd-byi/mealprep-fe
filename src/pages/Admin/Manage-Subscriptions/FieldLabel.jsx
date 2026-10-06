import { useState } from "react";
import { HelpCircle } from "lucide-react";

export const FieldLabel = ({ label, help }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group flex items-center gap-1.5 mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={() => setIsOpen(false)}
        aria-label={`About ${label}`}
        aria-expanded={isOpen}
        className="text-gray-400 hover:text-theme-color-1 focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      <div
        role="tooltip"
        className={`${isOpen ? "block" : "hidden"} group-hover:block absolute left-0 top-full mt-1 z-20 w-72 max-w-[85vw] p-3 text-xs font-normal leading-relaxed text-white bg-gray-800 rounded-md shadow-lg`}
      >
        {help}
      </div>
    </div>
  );
};
