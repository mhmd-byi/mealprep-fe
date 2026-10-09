import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import sidebarData from "./data.json";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import Diet from "../../../assets/images/diet.png";
import { useDashboard } from "../Dashboard/useDashboard";
import { LogOut, X, ChevronUp, UserCircle } from "lucide-react";
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

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !event.target.closest("[data-sidebar-profile-menu]")
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Portaled to <body> with real viewport coordinates — local absolute
  // positioning here gets painted over by the nav buttons above it, since
  // Framer Motion gives each one its own stacking context (via the
  // transform/will-change it applies for the stagger-in and active pill),
  // which breaks normal DOM-order stacking.
  useEffect(() => {
    if (!isProfileMenuOpen || !profileMenuRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = profileMenuRef.current.getBoundingClientRect();
    setMenuPos({
      left: rect.left + 16,
      width: rect.width - 32,
      bottom: window.innerHeight - rect.top + 8,
    });
  }, [isProfileMenuOpen]);

  const handleNavigate = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
    closeSidebar();
  };

  const handleProfileNavigate = () => {
    setIsProfileMenuOpen(false);
    handleNavigate("/dashboard/profile");
  };

  const mealConditions = currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals === 0 || currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals === null || isNaN(currentPlan?.lunchMeals + currentPlan?.dinnerMeals + currentPlan?.nextDayLunchMeals + currentPlan?.nextDayDinnerMeals)

  const mealsLeft =
    (currentPlan?.lunchMeals || 0) +
    (currentPlan?.dinnerMeals || 0) +
    (currentPlan?.nextDayLunchMeals || 0) +
    (currentPlan?.nextDayDinnerMeals || 0);

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
      <div className="flex flex-shrink-0 justify-between items-center px-5 pt-8 pb-4">
        <img src={whiteLogo} alt="Mealprep Logo" className="w-32" />
        <button onClick={closeSidebar} className="p-1.5 rounded-lg hover:bg-white/10 md:hidden">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {!isLoading && userRole !== "admin" && (
        <div className="flex gap-1.5 items-center px-5 pb-4 flex-shrink-0">
          <span className="flex gap-1.5 items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-white/10 text-theme-color-1">
            <img src={Diet} alt="meal-icon" className="w-4 h-4" />
            {mealsLeft} meals left
          </span>
        </div>
      )}

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
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.025, duration: 0.2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? "text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => handleNavigate(item.path)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 rounded-xl bg-theme-color-1"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="relative z-10 flex-shrink-0 w-5 h-5" />
                  <span className="relative z-10 truncate">{item.name}</span>
                </motion.button>
              </React.Fragment>
            );
          })
        )}
      </nav>

      <div className="relative flex-shrink-0 p-4 border-t border-white/10" ref={profileMenuRef}>
        {menuPos &&
          createPortal(
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  data-sidebar-profile-menu
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="overflow-hidden fixed bg-[#1f251f] rounded-xl border border-white/10 shadow-lg origin-bottom z-[300]"
                  style={{ left: menuPos.left, width: menuPos.width, bottom: menuPos.bottom }}
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProfileNavigate}
                    className="flex gap-3 items-center px-4 py-3 w-full text-sm font-medium text-left transition-colors text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <UserCircle className="flex-shrink-0 w-4 h-4" />
                    Profile
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="flex gap-3 items-center px-4 py-3 w-full text-sm font-medium text-left text-red-300 transition-colors border-t border-white/10 hover:bg-white/10 hover:text-red-200"
                  >
                    <LogOut className="flex-shrink-0 w-4 h-4" />
                    Log out
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        <button
          type="button"
          onClick={() => setIsProfileMenuOpen((v) => !v)}
          className="flex gap-3 items-center p-2 w-full rounded-xl transition-colors hover:bg-white/10"
        >
          <img
            src={fetchUserProfileImage || userProfileImg}
            alt="Profile"
            className="object-cover flex-shrink-0 w-10 h-10 rounded-full ring-2 ring-white/10"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs text-white/50">Hi there,</p>
            <p className="font-semibold text-white truncate">{fetchUserName}</p>
          </div>
          <ChevronUp className={`flex-shrink-0 w-4 h-4 text-white/50 transition-transform ${isProfileMenuOpen ? "" : "rotate-180"}`} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
