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
      <div className="flex justify-center items-center mb-3 rounded-md">
        <img
          src={service.icon}
          alt={service.name}
          className="object-contain w-16 h-16"
        />
      </div>
      <h3 className="text-sm font-medium text-center text-gray-800 lg:text-base">
        {service.name}
      </h3>
    </div>
  );

  const renderMobileServiceItem = (service, index) => (
    <div
      key={index}
      className="flex flex-col justify-start items-center p-2 w-full cursor-pointer"
      onClick={() => {
        if (service.path.startsWith('http')) {
          window.open(service.path, '_blank');
        } else {
          navigate(service.path);
        }
      }}
    >
      <div className="flex justify-center items-center mb-2 w-full rounded-md">
        <img
          src={service.icon}
          alt={service.name}
          className="object-contain w-14 h-14"
        />
      </div>
      <h3 className="mt-1 text-xs font-medium text-center text-gray-800">
        {service.name}
      </h3>
    </div>
  );

  return (
    <div className="px-4 mt-16 lg:mt-0">
      <section className="flex justify-center mb-6">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Features</p>
        </div>
      </section>

      {/* Mobile view - 4 columns */}
      {/* <section className="flex justify-center mt-6 lg:hidden">
        <div className="grid grid-cols-4 gap-1 w-full max-w-[500px] mx-auto">
          {services.map(renderMobileServiceItem)}
        </div>
      </section> */}

      {/* Desktop view - 4 columns */}
      {/* <section className="flex hidden justify-center my-20 lg:block">
        <div className="grid grid-cols-4 gap-4 lg:gap-10 max-w-[1500px] w-full mx-auto justify-items-center">
          {services.map(renderServiceItem)}
        </div>
      </section> */}
    </div>
  );
};
