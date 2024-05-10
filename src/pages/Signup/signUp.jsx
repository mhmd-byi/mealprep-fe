import React from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const navigateToSignin = () => navigate("/login");
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="flex max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
            <h2 className="text-center font-medium text-5xl">Sign Up</h2>
            <p className="mt-10 text-center text-lg">
              Enter your information below to proceed. <br />
              If you already have an account, please log in instead.
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6">
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <input
                      id="first-name"
                      name="First Name"
                      type="text"
                      required
                      class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                      placeholder="First Name"
                    />
                  </div>
                  <div class="w-full md:w-1/2 px-3">
                    <input
                      id="last-name"
                      name="Last Name"
                      type="text"
                      required
                      class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div class="w-full">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    // autocomplete="email"
                    required
                    placeholder="Address"
                    class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                  />
                </div>
                <div class="w-full">
                  <input
                    id="register-email"
                    name="register-email"
                    type="email"
                    // autocomplete="email"
                    required
                    placeholder="Email Address"
                    class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                  />
                </div>
                <div class="w-full">
                  <input
                    id="register-phone-number"
                    name="register-phone-number"
                    type="tel"
                    // autocomplete="email"
                    required
                    placeholder="Phone Number"
                    class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                  />
                </div>
                <button
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign Up
                </button>
              </form>
              <p class="mt-10 text-center text-sm text-gray-500">
                Already have an account? &nbsp;
                <a
                onClick={navigateToSignin}
                  class="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
