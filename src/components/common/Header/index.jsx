import { useDashboard } from "../Dashboard/useDashboard";
import { MealprepLogo } from "../../shared";
import Diet from "../../../assets/images/diet.png";
import useSubscription from "../../../pages/Plans/useSubscription";
import { Menu } from "lucide-react";

// Mobile-only top bar — on md+ the sidebar is permanently visible and already
// carries the logo (top) and profile/logout (bottom), so there's nothing left
// for a desktop header to show. This only exists to open the sidebar drawer
// on small screens, where that sidebar is hidden until toggled.
const Header = ({ toggleSidebar }) => {
  const { userDetails, isLoading } = useDashboard();
  const { currentPlan, isLoading: isSubscriptionLoading } = useSubscription();

  const isDataLoading = isLoading || isSubscriptionLoading;
  const mealsLeft =
    (currentPlan?.lunchMeals || 0) +
    (currentPlan?.dinnerMeals || 0) +
    (currentPlan?.nextDayLunchMeals || 0) +
    (currentPlan?.nextDayDinnerMeals || 0);

  return (
    <header className="flex md:hidden justify-between items-center py-3 px-5 bg-white border-b border-gray-100 shadow-sm">
      <MealprepLogo alt={"Meal Prep Logo"} classes={"max-w-40"} />

      <div className="flex gap-3 items-center">
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
    </header>
  );
};

export default Header;
