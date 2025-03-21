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
  const { 
    formData, 
    handleChange, 
    handleSubmit, 
    errMsg, 
    otpSent, 
    otpVerified, 
    otp, 
    handleOtpChange, 
    sendOtp, 
    verifyOtp 
  } = useSignup();

  const formRef = useRef(null);
  const { ValidationMessage } = usePasswordValidation(
    formRef,
    "newPassword",
    "confirmNewPassword"
  );

  return (
    <div className="relative flex flex-col items-center justify-center h-full lg:h-screen bg-theme-bg-2 md:bg-theme-bg-3 bg-no-repeat bg-cover">
      <div className="flex px-5 lg:px-12 py-8 shadow-md bg-white rounded-lg">
        <div className="content">
          <div className="flex flex-col justify-center items-center">
            <MealprepLogo classes={"text-center justify-center max-w-52"} />
            <h2 className="text-center font-medium text-4xl my-5">Sign Up</h2>
          </div>
          <p className="text-center text-lg">
            Enter your information below to proceed. <br />
            If you already have an account, please log in instead.
          </p>
          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleSubmit} ref={formRef}>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    id={"firstName"}
                    name={"firstName"}
                    type={"text"}
                    placeholder={"First Name"}
                    required={true}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    id={"lastName"}
                    name={"lastName"}
                    type={"text"}
                    placeholder={"Last Name"}
                    required={true}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="w-full">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id={"mobile"}
                      name={"mobile"}
                      type={"tel"}
                      required={true}
                      placeholder={"Phone Number"}
                      onChange={handleChange}
                      disabled={otpVerified}
                    />
                  </div>
                  {!otpVerified && (
                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpSent}
                      children={otpSent ? "OTP Sent" : "Send OTP"}
                    />
                  )}
                </div>
              </div>
              {otpSent && !otpVerified && (
                <div className="w-full">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id={"otp"}
                        name={"otp"}
                        type={"text"}
                        required={true}
                        placeholder={"Enter OTP"}
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={verifyOtp}
                      children="Verify OTP"
                    />
                  </div>
                </div>
              )}
              {otpVerified && (
                <div className="text-green-600 text-sm text-center">
                  ✓ Phone number verified
                </div>
              )}
              <div className="w-full">
                <Input
                  id={"email"}
                  name={"email"}
                  type={"email"}
                  required={true}
                  placeholder={"Email Address"}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    id={"newPassword"}
                    name={"password"}
                    type={"password"}
                    required={true}
                    placeholder={"Enter Password"}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    id={"confirmNewPassword"}
                    name={"confirmPassword"}
                    type={"password"}
                    required={true}
                    placeholder={"Confirm Password"}
                    onChange={handleChange}
                  />
                  <ValidationMessage />
                </div>
              </div>
              <div className="w-full">
                <Input
                  required={true}
                  id={"address"}
                  name={"postalAddress"}
                  type={"text"}
                  placeholder={"Address"}
                  onChange={handleChange}
                />
              </div>

              {errMsg.length > 1 && <Alert severity="error">{errMsg}</Alert>}
              <div className="flex justify-center">
                <Button type={"submit"} children={"Submit"} disabled={!otpVerified} />
              </div>
            </form>
            <p className="mt-10 text-center text-sm text-gray-500">
              Already have an account? &nbsp;
              <a
                onClick={navigateToSignin}
                className="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
