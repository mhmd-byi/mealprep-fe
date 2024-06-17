import userProfileImg from "../../../assets/images/user/user-profile.png";
import { useDashboard } from "../Dashboard/useDashboard";
import { Menu, ExitToAppRounded } from "@mui/icons-material";
import { useHeader } from "./useHeader";
import { MealprepLogo } from "../../shared";

const Header = ({ toggleSidebar }) => {
  const { userDetails } = useDashboard();
  const fetchUserProfileImage = userDetails.profileImageUrl;
  const { logout } = useHeader();

  return (
    <header className="bg-white py-3 px-5 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <MealprepLogo alt={"Meal Prep Logo"} />
      </div>
      <div className="md:hidden">
        <button onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <div className="hidden md:flex items-center space-x-4 w-fit">
        <div className="flex h-12 w-12 rounded-full items-center">
          <img src={fetchUserProfileImage || userProfileImg} alt="Profile" />
        </div>
        <span className="text-gray-800 hover:text-gray-600 transition-colors">
          Hi, {userDetails.firstName}
        </span>
        <button className="flex items-center space-x-1" onClick={logout}>
          <ExitToAppRounded className="h-6" />
          <span className="text-gray-800 hover:text-gray-600 transition-colors">
            Log out
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
