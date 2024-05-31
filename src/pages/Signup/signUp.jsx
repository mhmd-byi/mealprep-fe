import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, MealprepLogo } from "../../components";
import { useSignup } from "./useSignup";
import { Alert } from "@mui/material";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import { useRef } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const navigateToSignin = () => navigate("/");
  const { formData, handleChange, handleSubmit, errMsg } = useSignup();

  const formRef = useRef(null);
  const { ValidationMessage } = usePasswordValidation(
    formRef,
    "newPassword",
    "confirmNewPassword"
  );

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="flex px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
          <div className="flex flex-col justify-center items-center">
          <MealprepLogo />
          <h2 className="text-center font-medium text-4xl">Sign Up</h2>
          </div>
            <p className="mt-10 text-center text-lg">
              Enter your information below to proceed. <br />
              If you already have an account, please log in instead.
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6" onSubmit={handleSubmit} ref={formRef}>
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Input
                      id={"firstName"}
                      name={"firstName"}
                      type={"text"}
                      placeholder={"First Name"}
                      required={true}
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div class="w-full md:w-1/2 px-3">
                    <Input
                      id={"lastName"}
                      name={"lastName"}
                      type={"text"}
                      placeholder={"Last Name"}
                      required={true}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div class="w-full">
                  <Input
                    id={"mobile"}
                    name={"mobile"}
                    type={"tel"}
                    required={true}
                    placeholder={"Phone Number"}
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
                <div class="w-full">
                  <Input
                    id={"email"}
                    name={"email"}
                    type={"email"}
                    required={true}
                    placeholder={"Email Address"}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Input
                      id={"password"}
                      name={"password"}
                      type={"password"}
                      required={true}
                      placeholder={"Enter Password"}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div class="w-full md:w-1/2 px-3">
                    <Input
                      id={"confirmPassword"}
                      name={"confirmPassword"}
                      type={"password"}
                      required={true}
                      placeholder={"Confirm Password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <ValidationMessage />
                </div>
                <div class="w-full">
                  <Input
                    required={true}
                    id={"address"}
                    name={"postalAddress"}
                    type={"text"}
                    placeholder={"Address"}
                    value={formData.postalAddress}
                    onChange={handleChange}
                  />
                </div>

                {errMsg.length > 1 && <Alert severity="error">{errMsg}</Alert>}

                <Button type={"submit"} children={"Submit"} />
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
