// The 3 plan types shown throughout the admin panel, color-coded the same
// way everywhere: Monthly = blue, Weekly = green, Trial = yellow/amber.
export const PLAN_BADGE_STYLES = {
  Monthly: "bg-blue-100 text-blue-800",
  Weekly: "bg-green-100 text-green-800",
  Trial: "bg-amber-100 text-amber-800",
};

export const PLAN_DOT_COLORS = {
  Monthly: "bg-blue-500",
  Weekly: "bg-green-500",
  Trial: "bg-amber-500",
};

// Plan names come from a free-text field (e.g. "Monthly Plan", "Trial Pack"),
// so this matches by substring rather than an exact key.
const matchPlanKey = (plan) => Object.keys(PLAN_BADGE_STYLES).find((k) => plan?.includes(k));

export const getPlanBadgeStyle = (plan) => PLAN_BADGE_STYLES[matchPlanKey(plan)] || "bg-gray-100 text-gray-600";
export const getPlanDotColor = (plan) => PLAN_DOT_COLORS[matchPlanKey(plan)] || "bg-gray-400";
