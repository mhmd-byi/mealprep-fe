import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import sidebarData from "./data.json";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import { useDashboard } from "../Dashboard/useDashboard";
import { LogOut, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useHeader } from "../Header/useHeader";
import useSubscription from "../../../pages/Plans/useSubscription";
import userProfileImg from "../../../assets/images/user/user-placeholder.png";

const Sidebar = ({ closeSidebar }) => {
  const { userDetails, isLoading: isUserLoading } = useDashboard();
  const { logout } = useHeader();
  const { isSubscribed, currentPlan, isLoading: isSubscriptionLoading } = useSubscription();

  const isLoading = isUserLoading || isSubscriptionLoading;

  const fetchUserProfileImage = userDetails.profileImageUrl;
  const fetchUserName = userDetails.firstName;
  const userRole = userDetails.role;

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
    closeSidebar();
  };

  const mealConditions = currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals === 0 || currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals === null || isNaN(currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals)

  const isItemVisible = (item) => {
    if (item.requiresSubscription && !isSubscribed) {
      return false;
    }
    if (item.requiresSubscription && (mealConditions)) {
      return false;
    }
    if (item.adminOnly && userRole !== "admin") {
      return false;
    }
    if (item.userOnly && userRole === "admin") {
      return false;
    }

    return true;
  };

  const visibleItems = sidebarData.filter(isItemVisible);
  let adminSectionStarted = false;

  return (
    <div className="bg-[#161b16] text-white w-80 lg:w-72 h-full flex flex-col overflow-y-auto">
      <div className="flex flex-shrink-0 justify-between items-center px-5 pt-8 pb-6 md:hidden">
        <img src={whiteLogo} alt="Mealprep Logo" className="w-32" />
        <button onClick={closeSidebar} className="p-1.5 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-shrink-0 hidden h-6 md:block" />

      <div className="flex gap-3 items-center p-3 mx-4 mb-4 rounded-xl md:hidden bg-white/5">
        <img
          src={fetchUserProfileImage || userProfileImg}
          alt="Profile"
          className="object-cover flex-shrink-0 w-11 h-11 rounded-full ring-2 ring-white/10"
        />
        <div className="min-w-0">
          <p className="text-xs text-white/50">Hi there,</p>
          <p className="font-semibold text-white truncate">{fetchUserName}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 rounded-full border-2 animate-spin border-theme-color-1 border-t-transparent"></div>
          </div>
        ) : (
          visibleItems.map((item, index) => {
            const showAdminLabel = item.adminOnly && !adminSectionStarted;
            if (showAdminLabel) adminSectionStarted = true;
            const isActive = location.pathname === item.path;
            const Icon = LucideIcons[item.icon];
            return (
              <React.Fragment key={index}>
                {showAdminLabel && (
                  <p className="px-3 pt-5 pb-2 text-xs font-semibold tracking-wider uppercase text-white/30">Admin</p>
                )}
                <button
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-theme-color-1 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <Icon className="flex-shrink-0 w-5 h-5" />
                  <span className="truncate">{item.name}</span>
                </button>
              </React.Fragment>
            );
          })
        )}
      </nav>

      <div className="flex-shrink-0 p-4 border-t md:hidden border-white/10">
        <button
          className="flex gap-3 items-center px-3 py-2.5 w-full text-sm font-medium rounded-xl transition-colors text-white/70 hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut className="flex-shrink-0 w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
