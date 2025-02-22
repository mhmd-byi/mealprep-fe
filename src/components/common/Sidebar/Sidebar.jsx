import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import sidebarData from "./data.json";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import useProfile from "../../../pages/Profile/useProfile";
import { useDashboard } from "../Dashboard/useDashboard";
import { Logout, Close } from "@mui/icons-material";
import { useHeader } from "../Header/useHeader";
import useSubscription from "../../../pages/Plans/useSubscription";

const Sidebar = ({ closeSidebar }) => {
  const { profileImageUrl } = useProfile();
  const { userDetails } = useDashboard();
  const { logout } = useHeader();
  const { isSubscribed } = useSubscription();

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

  const isItemVisible = (item) => {
    if (item.requiresSubscription && !isSubscribed) {
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

  return (
    <div className="bg-black text-white w-80 lg:w-72 h-full flex flex-col space-y-4 py-10 px-5 overflow-y-auto">
      <div className="flex justify-between items-center md:hidden mb-4">
        <img src={whiteLogo} alt="Mealprep Logo" className="w-32" />
        <button onClick={closeSidebar}>
          <Close className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="flex md:hidden items-center space-x-3 p-2">
        <img
          src={fetchUserProfileImage || profileImageUrl}
          alt="Profile"
          className="h-12 w-12 rounded-full object-fill"
        />
        <span>Hi, {fetchUserName}</span>
      </div>
      {sidebarData.map(
        (item, index) =>
          isItemVisible(item) && (
            <button
              key={index}
              className={`flex items-center space-x-3 p-2 rounded ${
                location.pathname === item.path
                  ? "bg-gray-800"
                  : "hover:bg-gray-800"
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              {React.createElement(require(`@mui/icons-material`)[item.icon], {
                className: "h-6 w-6",
              })}
              <span>{item.name}</span>
            </button>
          )
      )}
      <div
        className="mt-auto flex md:hidden items-center space-x-3 p-2"
        onClick={logout}
      >
        <Logout />
        <span>Log out</span>
      </div>
    </div>
  );
};

export default Sidebar;
