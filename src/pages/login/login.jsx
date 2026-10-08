import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./useLogin";
import { Button, Input, MealprepLogo } from "../../components";
import { AuthLayout } from "../../components/common/AuthLayout/AuthLayout";
import { ShieldCheck } from "lucide-react";

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
    verifyOtp,
  } = useLogin();

  return (
    <AuthLayout
      heading="Healthy Meals Made Easy"
      subheading="Log in to manage your subscription, track meals and stay on top of your healthy-eating journey."
    >
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <MealprepLogo classes="max-w-40" />
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 lg:text-left">Welcome back</h2>
      <p className="mt-1 text-sm text-center text-gray-500 lg:text-left">Log in to your Mealprep account to continue.</p>

      <div className="flex p-1 mt-8 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setTabValue(0)}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            tabValue === 0 ? "bg-white text-theme-color-1 shadow-sm" : "text-gray-500"
          }`}
        >
          Email &amp; Password
        </button>
        <button
          type="button"
          onClick={() => setTabValue(1)}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
            tabValue === 1 ? "bg-white text-theme-color-1 shadow-sm" : "text-gray-500"
          }`}
        >
          Login with OTP
        </button>
      </div>

      {tabValue === 0 && (
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="text-right">
            <a
              onClick={navigateToForgotPassword}
              className="text-sm font-semibold text-gray-500 cursor-pointer hover:text-theme-color-1 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {errMsg.length > 1 && (
            <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">{errMsg}</div>
          )}

          <Button type="submit" id="login" classes="w-full justify-center">
            {loaderState ? "Logging in..." : "Login"}
          </Button>
        </form>
      )}

      {tabValue === 1 && (
        <form className="mt-6 space-y-5" onSubmit={handleOtpLogin}>
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
                maxLength={10}
              />
            </div>
            {!otpVerified && (
              <Button type="button" onClick={sendOtp} disabled={otpSent}>
                {otpSent ? "OTP Sent" : "Send OTP"}
              </Button>
            )}
          </div>

          {otpSent && !otpVerified && (
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
              <Button type="button" onClick={verifyOtp}>
                Verify OTP
              </Button>
            </div>
          )}

          {otpVerified && (
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 border border-green-200 rounded-lg bg-green-50">
              <ShieldCheck className="flex-shrink-0 w-4 h-4" />
              Phone number verified
            </div>
          )}

          {errMsg.length > 1 && (
            <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">{errMsg}</div>
          )}

          <Button type="submit" id="login" disabled={!otpVerified} classes="w-full justify-center">
            {loaderState ? "Logging in..." : "Login with OTP"}
          </Button>
        </form>
      )}

      <div className="pt-6 mt-8 text-center border-t border-gray-100">
        <p className="mb-3 text-sm text-gray-500">New to Mealprep?</p>
        <Button
          type="button"
          onClick={navigateToSignup}
          classes="w-full justify-center !bg-white border-2 border-theme-color-1 !text-theme-color-1 hover:!bg-theme-color-1 hover:!text-white transition-colors"
        >
          Create an Account
        </Button>
      </div>
    </AuthLayout>
  );
};

export default Login;
