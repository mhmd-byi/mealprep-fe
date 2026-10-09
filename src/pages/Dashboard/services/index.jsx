import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Activity, XCircle, Settings2, Receipt, ClipboardList, HelpCircle, MessageCircle } from "lucide-react";
import useSubscription from "../../Plans/useSubscription";

export const Services = () => {
  const navigate = useNavigate();
  const { currentPlan } = useSubscription();

  const checkForMeals = () => {
    if (currentPlan) {
      if (currentPlan?.meals <= 0) {
        return false;
      } else if (currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals === 0) {
        return false;
      } else {
        return true;
      }
    }
  };

  const showServices = checkForMeals();

  const services = [
    { name: "Food Menu", path: "/dashboard/food-menu", icon: UtensilsCrossed, tone: "bg-green-50 text-theme-color-1", showOnlyToSubscribed: false },
    { name: "Meal Trackings", path: "/dashboard/meal-tracking", icon: Activity, tone: "bg-blue-50 text-blue-600", showOnlyToSubscribed: false },
    { name: "Cancel Meal Request", path: "/dashboard/cancel-request", icon: XCircle, tone: "bg-red-50 text-red-600", showOnlyToSubscribed: true },
    { name: "Customized Meal", path: "/dashboard/customize-your-meal", icon: Settings2, tone: "bg-amber-50 text-amber-600", showOnlyToSubscribed: true },
    { name: "My Billings", path: "/dashboard/my-billing", icon: Receipt, tone: "bg-purple-50 text-purple-600", showOnlyToSubscribed: true },
    { name: "Subscription Plans", path: "/dashboard/plans", icon: ClipboardList, tone: "bg-teal-50 text-teal-600", showOnlyToSubscribed: false },
    { name: "FAQs", path: "/dashboard/help", icon: HelpCircle, tone: "bg-indigo-50 text-indigo-600", showOnlyToSubscribed: false },
    { name: "Chat on WhatsApp", path: "https://wa.me/+919826157131", icon: MessageCircle, tone: "bg-green-50 text-green-600", showOnlyToSubscribed: false },
  ];

  const handleClick = (path) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank");
    } else {
      navigate(path);
    }
  };

  const visibleServices = services.filter(
    (service) => service.showOnlyToSubscribed === false || (showServices && service.showOnlyToSubscribed)
  );

  return (
    <div className="px-4 pt-4 pb-8 text-left">
      <p className="mb-3 text-base font-bold text-gray-900">Quick Actions</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visibleServices.map((service) => (
          <button
            key={service.name}
            type="button"
            onClick={() => handleClick(service.path)}
            className="flex flex-col items-center p-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors hover:border-theme-color-1"
          >
            <div className={`flex justify-center items-center mb-2 w-12 h-12 rounded-xl ${service.tone}`}>
              <service.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">{service.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Services;
