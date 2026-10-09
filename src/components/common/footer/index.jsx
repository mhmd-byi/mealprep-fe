import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, UtensilsCrossed, Activity, ClipboardList } from "lucide-react";
import { useDashboard } from "../Dashboard/useDashboard";

const TABS = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Menu", path: "/dashboard/food-menu", icon: UtensilsCrossed },
  { name: "Tracking", path: "/dashboard/meal-tracking", icon: Activity },
  { name: "Plans", path: "/dashboard/plans", icon: ClipboardList },
];

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails } = useDashboard();

  if (userDetails.role === "admin") return null;

  return (
    <footer
      className="bg-white border-t border-gray-100"
      style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.06)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-stretch px-2">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.92 }}
              className="flex relative flex-col flex-1 gap-1 items-center py-2.5"
            >
              {isActive && (
                <motion.span
                  layoutId="footerActiveDot"
                  className="absolute top-1 w-1 h-1 rounded-full bg-theme-color-1"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon className={`w-5 h-5 ${isActive ? "text-theme-color-1" : "text-gray-400"}`} />
              <span className={`text-[11px] font-medium ${isActive ? "text-theme-color-1" : "text-gray-400"}`}>
                {tab.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </footer>
  );
};
