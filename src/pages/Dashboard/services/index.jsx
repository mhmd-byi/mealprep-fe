import { useNavigate } from "react-router-dom";
import FoodMenuIcon from "../../../assets/images/icons/update/menu.png";
import CancelRequestIcon from "../../../assets/images/icons/update/cancel-request-icon.png";
import MealCalendarIcon from "../../../assets/images/icons/update/calender.png";
import CustomizedMealIcon from "../../../assets/images/icons/update/customizes.png";
import ReceiptIcon from "../../../assets/images/icons/update/rc.png";
import SubscriptionPlansIcon from "../../../assets/images/icons/update/subs.png";
import HelpIcon from "../../../assets/images/icons/update/help.png";
import WhatsAppIcon from "../../../assets/images/icons/update/chat.png";
import useSubscription from "../../Plans/useSubscription";

export const Services = () => {
  const navigate = useNavigate();
  const { currentPlan } = useSubscription();

  const checkForMeals = () => {
    if (currentPlan) {
      if (currentPlan?.meals <= 0) {
        return false;
      } else if (currentPlan?.lunchMeals + currentPlan?.dinnerMeals === 0) {
        return false;
      } else {
        return true;
      }
    }
  };

  const showServices = checkForMeals();

  const services = [
    { name: "Food Menu", path: "/dashboard/food-menu", icon: FoodMenuIcon, showOnlyToSubscribed: false },
    { name: "Meal Trackings", path: "/dashboard/meal-tracking", icon: MealCalendarIcon, showOnlyToSubscribed: false },
    { name: "Cancel Meal Request", path: "/dashboard/cancel-request", icon: CancelRequestIcon, showOnlyToSubscribed: true },
    { name: "Customized Meal", path: "/dashboard/customize-your-meal", icon: CustomizedMealIcon, showOnlyToSubscribed: true },
    { name: "My Billings", path: "/dashboard/my-billing", icon: ReceiptIcon, showOnlyToSubscribed: true },
    {
      name: "Subscription Plans",
      path: "/dashboard/plans",
      icon: SubscriptionPlansIcon,
      showOnlyToSubscribed: false,
    },
    { name: "FAQs", path: "/dashboard/help", icon: HelpIcon, showOnlyToSubscribed: false },
    { name: "Chat on WhatsApp", path: "https://wa.me/+919826157131", icon: WhatsAppIcon, showOnlyToSubscribed: false },
  ];

  const renderServiceItem = (service, index) => (
    (service.showOnlyToSubscribed === false || (showServices && service.showOnlyToSubscribed)) && (<div
      key={index}
      className="w-[calc(25%-0.375rem)] lg:w-[200px] lg:h-[200px] p-4 flex flex-col items-center justify-center rounded-lg transition-all duration-300 cursor-pointer"
      onClick={() => {
        if (service.path.startsWith('http')) {
          window.open(service.path, '_blank');
        } else {
          navigate(service.path);
        }
      }}
    >
      <div className="mb-3 rounded-md flex items-center justify-center">
        <img
          src={service.icon}
          alt={service.name}
          className="w-16 h-16  object-contain"
        />
      </div>
      <h3 className="text-sm lg:text-base font-medium text-gray-800 text-center">
        {service.name}
      </h3>
    </div>)
  );

  const renderMobileServiceItem = (service, index) => (
    (service.showOnlyToSubscribed === false || (showServices && service.showOnlyToSubscribed)) && (<div
      key={index}
      className="w-full p-2 flex flex-col items-center justify-start cursor-pointer"
      onClick={() => {
        if (service.path.startsWith('http')) {
          window.open(service.path, '_blank');
        } else {
          navigate(service.path);
        }
      }}
    >
      <div className="mb-2 rounded-md flex items-center justify-center w-full">
        <img
          src={service.icon}
          alt={service.name}
          className="w-14 h-14 object-contain"
        />
      </div>
      <h3 className="text-xs font-medium text-gray-800 text-center mt-1">
        {service.name}
      </h3>
    </div>)
  );

  return (
    <div className="px-4 mt-16 lg:mt-0">
      <section className="mb-6 flex justify-center">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Features</p>
        </div>
      </section>

      {/* Mobile view - 4 columns */}
      <section className="mt-6 lg:hidden flex justify-center">
        <div className="grid grid-cols-4 gap-1 w-full max-w-[500px] mx-auto">
          {services.map(renderMobileServiceItem)}
        </div>
      </section>

      {/* Desktop view - 4 columns */}
      <section className="my-20 hidden lg:block flex justify-center">
        <div className="grid grid-cols-4 gap-4 lg:gap-10 max-w-[1500px] w-full mx-auto justify-items-center">
          {services.map(renderServiceItem)}
        </div>
      </section>
    </div>
  );
};
