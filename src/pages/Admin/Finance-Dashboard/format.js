export const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Compact Indian numbering (lakh/crore) for tight spaces like axis ticks.
export const formatCompactINR = (value) => {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  if (abs >= 1e7) return `₹${(num / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
  return `₹${num}`;
};

export const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

// Rounds up to a "nice" number (1/2/5 x 10^n) for clean axis gridlines.
export const niceMax = (value) => {
  if (value <= 0) return 10;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
};
