import { Sun, Moon } from "lucide-react";

export const MealSlotIcon = ({ slot, className = "w-3.5 h-3.5" }) => {
  const normalized = (slot || "").toLowerCase();

  if (normalized === "lunch") {
    return <Sun className={`${className} text-amber-500`} aria-label="Lunch" />;
  }
  if (normalized === "dinner") {
    return <Moon className={`${className} text-indigo-500`} aria-label="Dinner" />;
  }
  if (normalized === "both" || normalized === "lunchanddinner") {
    return (
      <span className="inline-flex items-center gap-0.5" title="Lunch & Dinner" aria-label="Lunch & Dinner">
        <Sun className={`${className} text-amber-500`} />
        <Moon className={`${className} text-indigo-500`} />
      </span>
    );
  }
  return null;
};

export default MealSlotIcon;
