export const formatTastePreference = (sub) => {
  const spice = sub?.spiceLevel || "";
  const flavours = (sub?.flavourPreferences || []).join(", ");
  return [spice, flavours].filter(Boolean).join(" · ");
};

export const sameFlavours = (a, b) => {
  const left = [...(a || [])].sort();
  const right = [...(b || [])].sort();
  return left.length === right.length && left.every((label, index) => label === right[index]);
};
