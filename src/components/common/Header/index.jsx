import { Bars3Icon } from '@heroicons/react/24/outline';
import logo from '../../../assets/images/logo/mp-logo.png'
import userProfileImg from '../../../assets/images/user/user-profile.png'
import logoutButton from  '../../../assets/images/logout.png'
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const navigationToLogin = () => navigate('/login')

  return (
    <header className="bg-white py-3 px-5 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <img src={logo} alt="Mealprep Logo" />
        {/* Hamburger Icon for small screens */}
        <button className="md:hidden ml-5" onClick={toggleSidebar}>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <img src={userProfileImg} alt="Profile" className="h-12 w-12 rounded-full"/>
        <span className="text-gray-800 hover:text-gray-600 transition-colors">Hi, John</span>
        <button className="flex items-center space-x-1" onClick={navigationToLogin}>
          <img src={logoutButton} alt="Log out" className="h-6" />
          <span className="text-gray-800 hover:text-gray-600 transition-colors">Log out</span>
        </button>
      </div>
    </header>
  );
};

export default Header
