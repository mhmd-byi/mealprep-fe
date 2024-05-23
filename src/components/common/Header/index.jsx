import React from "react";
import logo from "../../../assets/images/logo/mp-logo.png";
import userProfileImg from "../../../assets/images/user/user-profile.png";
import logoutButton from "../../../assets/images/logout.png";


const Header = () => {
  return (
    <header className="bg-white py-3 px-5 flex justify-between items-center shadow-md">
    <div className="flex items-center">
      {/* Assuming logo is an SVG or similar; replace `logo.svg` with your actual logo path */}
      <img src={logo} alt="Mealprep Logo" className="" />
    </div>
    <div className="flex items-center space-x-4">
      {/* Profile Image */}
      <img src={userProfileImg} alt="Profile" className="h-12 w-12 rounded-full"/>
      <span className="text-gray-800 hover:text-gray-600 transition-colors">Hi, John</span>
      
      {/* Logout Button with Image */}
      <button className="flex items-center space-x-1">
        <img src={logoutButton} alt="Log out" className="h-6" />
        <span className="text-gray-800 hover:text-gray-600 transition-colors">Log out</span>
      </button>
    </div>
  </header>
  );
};

export default Header;
