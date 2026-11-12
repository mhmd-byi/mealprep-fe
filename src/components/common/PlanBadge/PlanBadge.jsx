import { planBadgeStyle, usePlanColor } from "../../../plans";

export const PlanBadge = ({ plan }) => {
  const colorOf = usePlanColor();
  return plan ? (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={planBadgeStyle(colorOf(plan))}>
      {plan}
    </span>
  ) : (
    <span className="text-sm text-gray-400">—</span>
  );
};

export default PlanBadge;
