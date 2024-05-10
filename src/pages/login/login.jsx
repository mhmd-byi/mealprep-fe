import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const navigateToSignup = () => navigate("/signup");
  const navigateToForgotPassword = () => navigate("/forgot-password");
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="login-box max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
            <h2 className="text-center font-medium text-5xl">Login</h2>
            <p className="mt-10 text-center text-lg">
              If you have an account with us, <br />
              please log in.
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6" action="#" method="POST">
                <div>
                  <div class="mt-2">
                    <input
                      id="user-credentials"
                      name="user-credentials"
                      type="text"
                      // autocomplete="email"
                      required
                      placeholder="Email of Phone Number"
                      class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <div class="mt-2">
                    <input
                      id="password"
                      name="passsword"
                      type="password"
                      // autocomplete="password"
                      required
                      placeholder="Enter Password"
                      class="block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="text-sm">
                    <p>
                      Having trouble in sign in?&nbsp;
                      <a
                        onClick={navigateToForgotPassword}
                        class="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                      >
                        Forgot password
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    class="flex w-full justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in
                  </button>
                </div>
              </form>

              <p class="mt-10 text-center text-sm text-gray-500">
                Don’t have an account? &nbsp;
                <a
                  onClick={navigateToSignup}
                  class="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
