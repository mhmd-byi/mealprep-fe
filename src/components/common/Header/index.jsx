import { Bars3Icon } from "@heroicons/react/24/outline";
import logo from "../../../assets/images/logo/mp-logo.png";
import userProfileImg from "../../../assets/images/user/user-profile.png";
import logoutButton from "../../../assets/images/logout.png";
import { useNavigate } from "react-router-dom";
import useProfile from "../../../pages/Profile/useProfile";

const Header = ({ toggleSidebar }) => {
  const { profileImageUrl, formData } = useProfile();

  const navigate = useNavigate();
  const navigationToLogin = () => navigate("/");

  return (
    <header className="bg-white py-3 px-5 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <img src={logo} alt="Mealprep Logo" />
      </div>
      <div className="md:hidden">
        <button onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <img
          src={profileImageUrl}
          alt="Profile"
          className="h-12 w-12 rounded-full"
        />
        <span className="text-gray-800 hover:text-gray-600 transition-colors">
          Hi, {formData.firstName}
        </span>
        <button
          className="flex items-center space-x-1"
          onClick={navigationToLogin}
        >
          <img src={logoutButton} alt="Log out" className="h-6" />
          <span className="text-gray-800 hover:text-gray-600 transition-colors">
            Log out
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
