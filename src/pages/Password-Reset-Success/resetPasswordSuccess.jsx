import React from "react";
import { useNavigate } from "react-router-dom";
const ResetPasswordSuccess = () => {
  const navigate = useNavigate();
  const navigateToSign = () => navigate("/login");
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="flex h-[680px] max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content my-auto">
            <h2 className="text-center font-medium text-5xl max-w-96">
              Password Reset Successfully
            </h2>
            <button
              type="submit"
              class="flex w-full mt-10 justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={navigateToSign}
              >
                Back to Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess;
