import { useCarbLookup } from "../../../carbTypes";

export const CarbTypeBadge = ({ carbType }) => {
  const carbs = useCarbLookup();
  const color = carbs.color(carbType);
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-semibold whitespace-nowrap rounded-full"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {carbs.label(carbType)}
    </span>
  );
};

export default CarbTypeBadge;
