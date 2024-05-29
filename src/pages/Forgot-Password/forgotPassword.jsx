import React from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "./useForgotPassword";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const navigateToSignin = () => navigate('/login');
  const { handleSubmit } = useForgotPassword();
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="flex h-[680px] max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content my-auto">
            <h2 className="text-center font-medium text-5xl">
              Forgot Password
            </h2>
            <p className="mt-10 text-center text-lg">
              Enter your information below to recover <br />
              your password
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6" onSubmit={handleSubmit}>
                <div class="w-full">
                  <input
                    id="recoverd-email-address"
                    name="recoverd-email-address"
                    type="email"
                    required
                    placeholder="Enter Email Address"
                    class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                  />
                </div>
                <div class="w-full">
                  <p class="text-left text-base text-black-500">
                    Back to <a
                    onClick={navigateToSignin}
                    class="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                  >
                    login
                  </a>
                  </p>
                </div>
                <button
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Next
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
