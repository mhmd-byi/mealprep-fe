import { formatCarbType, getCarbTypeColor } from "../../../carbTypeDisplay";

export const CarbTypeBadge = ({ carbType }) => {
  const color = getCarbTypeColor(carbType);
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-semibold whitespace-nowrap rounded-full"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {formatCarbType(carbType)}
    </span>
  );
};

export default CarbTypeBadge;
