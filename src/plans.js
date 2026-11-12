import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const PLANS_KEY = ["plans", "public"];

const FALLBACK_COLOR = "#6b7280";
const NAME_COLORS = { Monthly: "#2563eb", Weekly: "#16a34a", Trial: "#d97706" };

const fetchPlans = async () => (await axios.get(`${process.env.REACT_APP_API_URL}public/plans`)).data;

export const usePlans = () => useQuery({ queryKey: PLANS_KEY, queryFn: fetchPlans, staleTime: 60 * 1000 });

export const useActivePlans = () =>
  useQuery({
    queryKey: PLANS_KEY,
    queryFn: fetchPlans,
    staleTime: 60 * 1000,
    select: (plans) => plans.filter((plan) => plan.isActive),
  });

const colorFromName = (name) => {
  const key = Object.keys(NAME_COLORS).find((word) => name?.includes(word));
  return key ? NAME_COLORS[key] : FALLBACK_COLOR;
};

export const usePlanColor = () => {
  const { data } = usePlans();
  return (name) => data?.find((plan) => plan.name === name)?.color || colorFromName(name);
};

export const planBadgeStyle = (color) => ({ backgroundColor: `${color}22`, color });

export const planQuote = (plan, lunchDinner) => {
  const multiplier = lunchDinner === "lunchAndDinner" ? 2 : 1;
  const meals = plan.meals * multiplier;
  return {
    price: plan.price * multiplier,
    meals,
    duration: `${meals} ${meals === 1 ? "Meal" : "Meals"} ${plan.period}`.trim(),
  };
};

export const PLAN_COLOR_CHOICES = ["#2563eb", "#16a34a", "#d97706", "#7c3aed", "#e11d48", "#0d9488", "#ea580c", "#4f46e5", "#0891b2", "#6b7280"];
