export const SubscriptionField = ({ icon: Icon, label, children }) => (
  <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center">
    <span className="flex flex-shrink-0 gap-3 items-center w-36 text-sm text-gray-500">
      <Icon className="flex-shrink-0 w-4 h-4" />
      {label}
    </span>
    <div className="min-w-0 text-sm font-semibold text-gray-900">{children}</div>
  </div>
);

export default SubscriptionField;
