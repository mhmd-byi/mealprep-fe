import { getPlanBadgeStyle } from "../../../planDisplay";

export const PlanBadge = ({ plan }) =>
  plan ? (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPlanBadgeStyle(plan)}`}>
      {plan}
    </span>
  ) : (
    <span className="text-sm text-gray-400">—</span>
  );

export default PlanBadge;
