import userProfileImg from "../../../assets/images/user/user-placeholder.png";
import { useDashboard } from "../Dashboard/useDashboard";
import { useHeader } from "./useHeader";
import { MealprepLogo } from "../../shared";
import Diet from "../../../assets/images/diet.png";
import useSubscription from "../../../pages/Plans/useSubscription";
import { Menu, LogOut } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { userDetails, isLoading } = useDashboard();
  const fetchUserProfileImage = userDetails.profileImageUrl;
  const { logout } = useHeader();
  const { currentPlan, isLoading: isSubscriptionLoading } = useSubscription();

  const isDataLoading = isLoading || isSubscriptionLoading;
  const mealsLeft =
    (currentPlan?.lunchMeals || 0) +
    (currentPlan?.dinnerMeals || 0) +
    (currentPlan?.nextDayLunchMeals || 0) +
    (currentPlan?.nextDayDinnerMeals || 0);

  return (
    <header className="flex justify-between items-center py-3 px-5 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center">
        <MealprepLogo alt={"Meal Prep Logo"} classes={"max-w-40 md:max-w-52"} />
      </div>

      <div className="flex gap-3 items-center md:hidden">
        {!isDataLoading && userDetails?.role !== "admin" && (
          <div className="flex gap-1.5 items-center px-2.5 py-1 rounded-full bg-green-50">
            <img src={Diet} alt="meal-icon" className="w-5 h-5" />
            <span className="text-xs font-semibold text-theme-color-1">{mealsLeft} meals left</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden gap-4 items-center md:flex">
        {!isDataLoading && userDetails?.role !== "admin" && (
          <div className="flex gap-2 items-center px-3 py-1.5 rounded-full bg-green-50">
            <img src={Diet} alt="meal-icon" className="w-6 h-6" />
            <span className="text-sm font-semibold text-theme-color-1">{mealsLeft} meals left</span>
          </div>
        )}

        <div className="flex gap-2.5 items-center pl-4 border-l border-gray-100">
          <img
            src={fetchUserProfileImage || userProfileImg}
            alt="Profile"
            className="object-cover w-10 h-10 rounded-full ring-2 ring-gray-100"
          />
          <div className="leading-tight">
            <p className="text-xs text-gray-400">Hi,</p>
            <p className="text-sm font-semibold text-gray-800">{userDetails.firstName}</p>
          </div>
        </div>

        <button
          className="flex gap-1.5 items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-800"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
