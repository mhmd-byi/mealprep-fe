import { useNavigate } from "react-router-dom";
import FoodMenuIcon from "../../../assets/images/icons/update/menu.png";
import CancelRequestIcon from "../../../assets/images/icons/update/cancel-request-icon.png";
import MealCalendarIcon from "../../../assets/images/icons/update/calender.png";
import CustomizedMealIcon from "../../../assets/images/icons/update/customizes.png";
import ReceiptIcon from "../../../assets/images/icons/update/rc.png";
import SubscriptionPlansIcon from "../../../assets/images/icons/update/subs.png";
import HelpIcon from "../../../assets/images/icons/update/help.png";
import WhatsAppIcon from "../../../assets/images/icons/update/chat.png";

export const AdminServices = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Add Menu", path: "/dashboard/add-menu", icon: FoodMenuIcon },
    { name: "Meal Trackings", path: "/dashboard/meal-tracking", icon: MealCalendarIcon },
    { name: "User Cancel Requests", path: "/dashboard/user-cancel-request-list", icon: CancelRequestIcon },
    { name: "Customisation Requests", path: "/dashboard/get-list-of-customisation-request", icon: CustomizedMealIcon },
    { name: "Meal Delivery List", path: "/dashboard/meal-delivery-list", icon: ReceiptIcon },
    { name: "All Registered Users", path: "/dashboard/all-registered-users", icon: SubscriptionPlansIcon },
    { name: "FAQs", path: "/dashboard/help", icon: HelpIcon },
    { name: "Chat on WhatsApp", path: "https://wa.me/+919826157131", icon: WhatsAppIcon },
  ];

  const renderServiceItem = (service, index) => (
    <div
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
    </div>
  );

  const renderMobileServiceItem = (service, index) => (
    <div
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
    </div>
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
