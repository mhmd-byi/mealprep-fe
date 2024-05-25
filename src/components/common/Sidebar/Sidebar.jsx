import React from "react";
import { useNavigate } from "react-router-dom";
import sidebarData from "./data.json";
import userProfileImg from '../../../assets/images/user/user-profile.png';
import logoutButton from '../../../assets/images/logout.png';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Ensure you have this import

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div className="bg-black text-white w-fit h-full flex flex-col space-y-4 py-10 px-5 overflow-y-auto">
      <button onClick={closeSidebar} className="md:hidden mb-4 ml-auto">
        <XMarkIcon className="h-6 w-6 text-white" />
      </button>
      <div className="flex md:hidden items-center space-x-3 p-2">
        <img src={userProfileImg} alt="Profile" className="h-12 w-12 rounded-full"/>
        <span>Hi, John</span>
      </div>
      {sidebarData.map((item, index) => (
        <button
          key={index}
          className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded"
          onClick={() => handleNavigate(item.path)}
        >
          {React.createElement(
            require(`@heroicons/react/24/outline`)[item.icon],
            { className: "h-6 w-6" }
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
