import React from "react";

const Mark = ({ isVeg, size = 15 }) => (
  <svg
    width={size}
    height={size + 1}
    viewBox="0 0 15 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0.5" y="1" width="14" height="14" stroke={isVeg ? "#007F0D" : "#FE0D0D"} />
    <circle cx="7.5" cy="8" r="3.75" fill={isVeg ? "#007F0D" : "#FE0D0D"} />
  </svg>
);

export const VegNonVegIcon = ({ value, className = "" }) => {
  const normalized = (value || "").toLowerCase();

  if (normalized === "both") {
    return (
      <span className={`inline-flex items-center gap-0.5 ${className}`} title="Veg & Non-Veg (Flexible)">
        <Mark isVeg size={11} />
        <Mark isVeg={false} size={11} />
      </span>
    );
  }

  const isVeg = normalized === "veg";
  return (
    <span className={`inline-flex items-center ${className}`} title={isVeg ? "Vegetarian" : "Non-Vegetarian"}>
      <Mark isVeg={isVeg} />
    </span>
  );
};

export default VegNonVegIcon;
