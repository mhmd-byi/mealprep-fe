import React from "react";
import { useNavigate } from "react-router-dom";
import { useSubmitLogin } from "./useSubmitLogin";
import { Button, Input} from '../../components'

const Login = () => {
  const navigate = useNavigate();
  const navigateToSignup = () => navigate("/signup");
  const navigateToForgotPassword = () => navigate("/forgot-password");
  const { onSubmit } = useSubmitLogin();
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
              <form class="space-y-6" onSubmit={onSubmit}>
                <div>
                  <div class="mt-2">
                    <Input 
                      id="email"
                      name='email'
                      type="email"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <div>
                  <div class="mt-2">
                    <Input
                      id={'password'}
                      name={'password'}
                      type="password"
                      placeholder={'Enter password'}
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
                <Button 
                id={'login'}
                children={'Submit'}
                />
                 {/* <button
                    type="submit"
                    class="flex w-full justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  > 
                    Sign in
  </button>*/}
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
