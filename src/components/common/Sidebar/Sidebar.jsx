import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import sidebarData from "./data.json";
import userProfileImg from "../../../assets/images/user/user-profile.png";
import logoutButton from "../../../assets/images/logout.png";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Ensure you have this import

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div className="bg-black text-white w-fit h-full flex flex-col space-y-4 py-10 px-5 overflow-y-auto">
      <div className="flex justify-between items-center md:hidden mb-4">
        <img src={whiteLogo} alt="Mealprep Logo" className="w-32" />
        <button onClick={closeSidebar}>
          <XMarkIcon className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="flex md:hidden items-center space-x-3 p-2">
        <img
          src={userProfileImg}
          alt="Profile"
          className="h-12 w-12 rounded-full"
        />
        <span>Hi, John</span>
      </div>
      {sidebarData.map((item, index) => (
        <button
          key={index}
          className={`flex items-center space-x-3 p-2 rounded ${
            location.pathname === item.path
              ? "bg-gray-800"
              : "hover:bg-gray-800"
          }`}
          onClick={() => handleNavigate(item.path)}
        >
          {React.createElement(
            require(`@heroicons/react/24/outline`)[item.icon],
            {
              className: "h-6 w-6",
            }
          )}
          <span>{item.name}</span>
        </button>
      ))}
      <div className="mt-auto flex md:hidden items-center space-x-3 p-2">
        <img src={logoutButton} alt="Log out" className="h-6" />
        <span>Log out</span>
      </div>
    </div>
  );
};

export default Sidebar;
