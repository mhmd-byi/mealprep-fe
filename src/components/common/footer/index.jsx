import "./style.css";
import {
  NotificationsActive,
  RestaurantMenu,
  WhatsApp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  const navigateToFoodMenu = () => {
    navigate("/dashboard/food-menu");
  };
  const navigateToPlan = () => {
    navigate("/dashboard/plans");
  };
  return (
    <footer className="drop-shadow-lg shadow-t-md">
      <div className="flex justify-between text-theme-color-1 gap-4 bg-black px-8 py-3 rounded-t-2xl">
        <RestaurantMenu className="icon" onClick={navigateToFoodMenu} />
        <WhatsApp className="icon" />
        <NotificationsActive className="icon" onClick={navigateToPlan} />
      </div>
    </footer>
  );
};
