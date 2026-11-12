import axios from "axios";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export const CARB_TYPES_KEY = ["carb-types", "public"];

const FALLBACK_COLOR = "#898781";

const fetchCarbTypes = async () => (await axios.get(`${process.env.REACT_APP_API_URL}public/carb-types`)).data;

export const useCarbTypes = () => useQuery({ queryKey: CARB_TYPES_KEY, queryFn: fetchCarbTypes, staleTime: 60 * 1000 });

export const useActiveCarbTypes = () =>
  useQuery({
    queryKey: CARB_TYPES_KEY,
    queryFn: fetchCarbTypes,
    staleTime: 60 * 1000,
    select: (carbTypes) => carbTypes.filter((carbType) => carbType.isActive),
  });

const titleCase = (slug) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatMacro = (macro, unit) => {
  if (!macro) return null;
  return macro.max !== null && macro.max !== undefined ? `${macro.min}–${macro.max}${unit}` : `~${macro.min}${unit}`;
};

export const buildCarbLookup = (carbTypes = []) => {
  const bySlug = new Map(carbTypes.map((carbType) => [carbType.slug, carbType]));

  const nutritionLine = (slug) => {
    const nutrition = bySlug.get(slug)?.nutrition;
    if (!nutrition) return null;
    const line = [
      formatMacro(nutrition.protein, "g Protein"),
      formatMacro(nutrition.carbs, "g Carbs"),
      formatMacro(nutrition.fat, "g Fat"),
      formatMacro(nutrition.fiber, "g Fiber"),
      formatMacro(nutrition.kcal, " kcal"),
    ]
      .filter(Boolean)
      .join(" | ");
    return line || null;
  };

  const labelMacros = (slug) => {
    const nutrition = bySlug.get(slug)?.nutrition;
    if (!nutrition || !nutrition.protein || !nutrition.carbs || !nutrition.fat || !nutrition.kcal) return "";
    return `P-${nutrition.protein.min}GM,C-${nutrition.carbs.min}GM,F-${nutrition.fat.min}GM ${nutrition.kcal.min}KCAL`;
  };

  return {
    find: (slug) => bySlug.get(slug) || null,
    label: (slug) => (slug ? bySlug.get(slug)?.name || titleCase(slug) : "—"),
    color: (slug) => bySlug.get(slug)?.color || FALLBACK_COLOR,
    shortCode: (slug) => bySlug.get(slug)?.shortCode || (slug || "").replace(/-/g, "").slice(0, 4).toUpperCase() || "—",
    nutritionLine,
    labelMacros,
  };
};

export const useCarbLookup = () => {
  const { data } = useCarbTypes();
  return useMemo(() => buildCarbLookup(data), [data]);
};
