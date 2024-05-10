import React from "react";
import headerStyle from "./header.css";
import logo from "../../../assets/images/logo/mp-logo.png";
import userProfileImg from "../../../assets/images/user/user-profile.png";
import logoutButton from "../../../assets/images/logout.png";

const userName = 'John Smith'

const Header = () => {
  return (
    <header className="flex justify-between items-center px-10 py-6 bg-white text-black">
      <div className="text-xl font-bold app-logo">
        <a href="/">
          <img src={logo} className="app-logo"></img>
        </a>
      </div>
      <div className="nav-side flex gap-10 items-center">
        <div className="user flex items-center justify-center ">
          <img src={userProfileImg} />
          <p className="ml-4 align-middle">Hi, {userName}</p>
        </div>
        <div className="logout flex items-center justify-center ">
          <img src={logoutButton} />
          <p className="ml-4 align-middle">Log Out</p>
        </div>
      </div>
      
    </header>
  );
};

export default Header;
