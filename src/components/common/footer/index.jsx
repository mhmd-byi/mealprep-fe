import "./style.css";
import { RestaurantMenu } from "@mui/icons-material";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  const navigateToFoodMenu = () => {
    navigate("/dashboard/food-menu");
  };
  const navigateToPlan = () => {
    navigate("/dashboard/plans");
  };
  const navigateToHome = () => {
    navigate("/dashboard");
  };
  return (
    <footer className="drop-shadow-lg shadow-t-md">
      <div className="flex justify-between text-theme-color-1 gap-4 bg-black px-8 py-3 rounded-t-2xl">
        <RestaurantMenu className="icon" onClick={navigateToFoodMenu} />
        <HomeIcon className="icon" onClick={navigateToHome} />
        <ViewCarouselIcon className="icon" onClick={navigateToPlan} />
      </div>
    </footer>
  );
};
