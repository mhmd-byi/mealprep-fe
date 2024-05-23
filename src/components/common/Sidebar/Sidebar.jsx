import React from "react";
import { useNavigate } from "react-router-dom";
import sidebarData from "./data.json";
const Sidebar = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-black text-white w-fit h-screen flex flex-col space-y-4 py-10 px-5">
      {sidebarData.map((item, index) => (
        <button
          key={index}
          className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded"
          onClick={() => handleNavigate(item.path)}
        >
          {React.createElement(
            // Dynamically import the icon component based on the name
            require(`@heroicons/react/24/outline`)[item.icon],
            { className: "h-6 w-6" }
          )}
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;