import { useNavigate } from "react-router-dom";
import FoodMenuIcon from "../../../assets/images/icons/update/menu.png";
import CancelRequestIcon from "../../../assets/images/icons/update/cancel-request-icon.png";
import MealCalendarIcon from "../../../assets/images/icons/update/calender.png";
import CustomizedMealIcon from "../../../assets/images/icons/update/customizes.png";
import ReceiptIcon from "../../../assets/images/icons/update/rc.png";
import SubscriptionPlansIcon from "../../../assets/images/icons/update/subs.png";
import HelpIcon from "../../../assets/images/icons/update/help.png";
import WhatsAppIcon from "../../../assets/images/icons/update/chat.png";

export const Services = () => {
  const navigation = useNavigate();

  const services = [
    { name: "Food Menu", path: "/dashboard/food-menu", icon: FoodMenuIcon },
    { name: "Meal Trackings", path: "/dashboard/meal-tracking", icon: MealCalendarIcon },
    { name: "Cancel Meal Request", path: "/dashboard/cancel-request", icon: CancelRequestIcon },
    { name: "Customized Meal", path: "/dashboard/customize-your-meal", icon: CustomizedMealIcon },
    { name: "My Billings", path: "/dashboard/my-billing", icon: ReceiptIcon },
    {
      name: "Subscription Plans",
      path: "/dashboard/plans",
      icon: SubscriptionPlansIcon,
    },
    { name: "Help", path: "", icon: HelpIcon },
    { name: "Chat on WhatsApp", path: "", icon: WhatsAppIcon },
  ];

  const renderServiceItem = (service, index) => (
    <div
      key={index}
      className="w-[calc(25%-0.375rem)] lg:w-[200px] lg:h-[200px] p-4 flex flex-col items-center justify-center rounded-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigation(service.path)}
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
    </div>
  );

  const renderMobileServiceItem = (service, index) => (
    <div
      key={index}
      className="w-1/4 p-2 flex flex-col items-center justify-start cursor-pointer"
      onClick={() => navigation(service.path)}
    >
      <div className="mb-2 rounded-md flex items-center justify-center">
        <img
          src={service.icon}
          alt={service.name}
          className="w-14 h-14  object-contain"
        />
      </div>
      <h3 className="text-xs font-medium text-gray-800 text-center mt-1">
        {service.name}
      </h3>
    </div>
  );

  return (
    <div className="px-4 mt-16 lg:mt-0">
      <section className="mb-6 flex justify-center">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Our Services</p>
        </div>
      </section>

      {/* Mobile view */}
      <section className="mt-6 lg:hidden">
        <div className="flex flex-wrap justify-start">
          {services.map(renderMobileServiceItem)}
        </div>
      </section>

      {/* Desktop view */}
      <section className="my-20 hidden lg:block">
        <div className="flex flex-wrap justify-between gap-2 lg:gap-10 lg:max-w-[1500px] lg:mx-auto">
          {services.slice(0, 4).map(renderServiceItem)}
        </div>
        <div className="flex flex-wrap justify-between gap-2 lg:gap-10 lg:max-w-[1500px] lg:mx-auto mt-2 lg:mt-10">
          {services.slice(4).map(renderServiceItem)}
        </div>
      </section>
    </div>
  );
};
