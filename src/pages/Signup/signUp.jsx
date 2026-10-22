import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, MealprepLogo } from "../../components";
import { AuthLayout } from "../../components/common/AuthLayout/AuthLayout";
import { useSignup } from "./useSignup";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import { useRef } from "react";
import usePincodeValidation from "./usePincodeValidation";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const navigateToSignin = () => navigate("/");
  const {
    formData,
    handleChange,
    handleSubmit,
    errMsg,
    loaderState,
    otpSent,
    otpVerified,
    otp,
    handleOtpChange,
    sendOtp,
    verifyOtp,
  } = useSignup();

  const formRef = useRef(null);
  const { ValidationMessage } = usePasswordValidation(formRef, "newPassword", "confirmNewPassword");
  const { PincodeValidationMessage, pincodeValid } = usePincodeValidation(formRef);

  const isSubmitDisabled = !pincodeValid || !otpVerified || String(errMsg) !== "";

  return (
    <AuthLayout
      heading="Start Your Healthy Eating Journey"
      subheading="Create an account to browse plans, customize your meals and get fresh food delivered to your door."
      maxWidthClass="max-w-lg"
    >
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <MealprepLogo classes="max-w-40" />
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-900 lg:text-left">Create your account</h2>
      <p className="mt-1 text-sm text-center text-gray-500 lg:text-left">
        Already have an account?{" "}
        <a onClick={navigateToSignin} className="font-semibold cursor-pointer text-theme-color-1 hover:underline">
          Log in
        </a>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} ref={formRef}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input id="firstName" name="firstName" type="text" placeholder="First Name" required onChange={handleChange} />
          <Input id="lastName" name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              required
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
                required
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

        {otpVerified ? (
          <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 border border-green-200 rounded-lg bg-green-50">
            <ShieldCheck className="flex-shrink-0 w-4 h-4" />
            Phone number verified — fill in the rest of your details below.
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-amber-800 border border-amber-300 rounded-lg bg-amber-50">
            <AlertTriangle className="flex-shrink-0 w-4 h-4" />
            Verify your phone number above to unlock the rest of the form.
          </div>
        )}

        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email Address"
          onChange={handleChange}
          disabled={!otpVerified}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            id="newPassword"
            name="password"
            type="password"
            required
            placeholder="Enter Password"
            onChange={handleChange}
            disabled={!otpVerified}
          />
          <div>
            <Input
              id="confirmNewPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              onChange={handleChange}
              disabled={!otpVerified}
            />
            <ValidationMessage />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            id="pincode"
            name="pincode"
            type="number"
            required
            placeholder="Enter area pincode"
            onChange={handleChange}
            disabled={!otpVerified}
          />
          <div className="flex items-center">
            <PincodeValidationMessage />
          </div>
        </div>

        <Input
          required
          id="address"
          name="postalAddress"
          type="text"
          placeholder="Address"
          onChange={handleChange}
          disabled={!otpVerified}
        />

        {errMsg.length > 1 && (
          <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">{errMsg}</div>
        )}

        <Button type="submit" classes="w-full justify-center" disabled={isSubmitDisabled}>
          {loaderState ? "Creating account..." : "Submit"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
