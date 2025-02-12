// Login.js file

import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./useLogin";
import { Button, Input, MealprepLogo } from "../../components";
import { Alert } from "@mui/material";
const Login = () => {
  const navigate = useNavigate();
  const navigateToSignup = () => navigate("/signup");
  const navigateToForgotPassword = () => navigate("/forgot-password");

  const { handleChange, handleSubmit, formData, loaderState, errMsg } =
    useLogin();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="login-box max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
            <div className="flex flex-col justify-center items-center">
              <MealprepLogo classes={"text-center justify-center"} />
              <h2 className="text-center font-medium text-4xl my-5 text-slate-950">Login</h2>
            </div>
            <p className="text-center text-lg">
              If you have an account with us, <br />
              please log in.
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <div class="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <div class="mt-2">
                    <Input
                      id={"password"}
                      name={"password"}
                      type="password"
                      placeholder={"Enter password"}
                      value={formData.password}
                      onChange={handleChange}
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
                  {errMsg.length > 1 && (
                    <Alert severity="error">{errMsg}</Alert>
                  )}
                </div>
                <div className="flex justify-center">
                  <Button type="submit" id={"login"}>
                    {" "}
                    {loaderState ? "Logging in..." : "Login"}
                  </Button>
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
