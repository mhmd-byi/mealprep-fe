import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSignUpScreen = () => {
  const navigate = useNavigate();
  const navigateToLogin = () => navigate('/login');
  const navigateToSignup = () => navigate('/signup');
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 md:bg-theme-bg-3 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="px-4 mx-auto flex gap-10">
          <button onClick={navigateToLogin} className='px-6 py-4 w-60 rounded bg-white text-center text-lg font-bold hover:bg-theme-color-1 hover:text-white shadow-2xl'>Login</button>
          <button onClick={navigateToSignup} className='px-6 py-4 w-60 rounded bg-white text-center text-lg font-bold hover:bg-theme-color-1 hover:text-white shadow-2xl'>Sign Up</button>
        </div>
      </div>
    </div>
  );
};
export default LoginSignUpScreen
