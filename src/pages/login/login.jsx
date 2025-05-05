// Login.js file

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./useLogin";
import { Button, Input, MealprepLogo } from "../../components";
import { Alert, Tabs, Tab, Box } from "@mui/material";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const navigateToSignup = () => navigate("/signup");
  const navigateToForgotPassword = () => navigate("/forgot-password");
  const [tabValue, setTabValue] = useState(0);

  const { 
    handleChange, 
    handleSubmit, 
    formData, 
    loaderState, 
    errMsg,
    // OTP login handlers
    handleOtpLogin,
    otpSent,
    otpVerified,
    otp,
    handleOtpChange,
    sendOtp,
    verifyOtp
  } = useLogin();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 md:bg-theme-bg-3 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="login-box max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
            <div className="flex flex-col justify-center items-center">
              <MealprepLogo classes={"text-center justify-center max-w-52"} />
              <h2 className="text-center font-medium text-4xl my-5 text-slate-950">Login</h2>
            </div>
            <p className="text-center text-lg">
              If you have an account with us, <br />
              please log in.
            </p>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                className="mb-4"
              >
                <Tab label="Email/Password" />
                <Tab label="Login with OTP" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <div className="mt-2">
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
                    <div className="mt-2">
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
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p>
                        Having trouble in sign in?&nbsp;
                        <a
                          onClick={navigateToForgotPassword}
                          className="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                        >
                          Forgot password
                        </a>
                      </p>
                      <p className="mt-2">
                        Don't have an account? &nbsp;
                        <a
                          onClick={navigateToSignup}
                          className="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                        >
                          Sign Up
                        </a>
                      </p>
                    </div>
                  </div>

                  {errMsg.length > 1 && (
                    <Alert severity="error">{errMsg}</Alert>
                  )}
                  <div className="flex justify-center">
                    <Button type="submit" id={"login"}>
                      {loaderState ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <form className="space-y-6" onSubmit={handleOtpLogin}>
                  <div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.mobile}
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
                    <div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            id="otp"
                            name="otp"
                            type="text"
                            placeholder="Enter OTP"
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

                  {errMsg.length > 1 && (
                    <Alert severity="error">{errMsg}</Alert>
                  )}
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      id={"login"}
                      disabled={!otpVerified}
                    >
                      {loaderState ? "Logging in..." : "Login with OTP"}
                    </Button>
                  </div>
                </form>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
