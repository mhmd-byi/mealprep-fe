export const Skeleton = ({ className = "" }) => (
  <span className={`inline-block bg-gray-200 rounded animate-pulse ${className}`} />
);

export default Skeleton;
