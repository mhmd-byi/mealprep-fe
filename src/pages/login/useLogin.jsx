import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const [loaderState, setLoaderState] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const sendOtp = async () => {
    if (!formData.mobile) {
      setErrMsg("Please enter your mobile number first");
      return;
    }
    setLoaderState(true);
    try {
      await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}activity/send-otp`,
        data: {
          mobileNumber: formData.mobile,
        },
      });
      setOtpSent(true);
      setErrMsg("");
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoaderState(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setErrMsg("Please enter the OTP");
      return;
    }
    setLoaderState(true);
    try {
      await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}activity/verify-otp`,
        data: {
          mobile: formData.mobile,
          otp: otp,
        },
      });
      setOtpVerified(true);
      setErrMsg("");
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoaderState(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoaderState(true);
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API_URL}user/login`,
      data: {
        email: formData.email.toLowerCase(),
        password: formData.password,
      },
    })
      .then((res) => {
        setLoaderState(false);
        sessionStorage.setItem("token", res.data.tokens.access.token);
        sessionStorage.setItem(
          "tokenExpireDate",
          res.data.tokens.access.expires
        );
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("email", formData.email.toLowerCase());
        // navigate("/dashboard");
      })
      .catch((err) => {
        setLoaderState(false);
        setErrMsg("Invalid email or password");
      });
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setErrMsg("Please verify your mobile number with OTP first");
      return;
    }
    setLoaderState(true);
    try {
      const res = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}user/login-with-otp`,
        data: {
          mobile: formData.mobile,
          otp: otp,
        },
      });
      sessionStorage.setItem("token", res.data.tokens.access.token);
      sessionStorage.setItem(
        "tokenExpireDate",
        res.data.tokens.access.expires
      );
      sessionStorage.setItem("userId", res.data.userId);
      sessionStorage.setItem("mobile", formData.mobile);
      sessionStorage.setItem("email", res.data.email);
      // setLoaderState(false);
      // navigate("/dashboard");
    } catch (err) {
      setLoaderState(false);
      setErrMsg(err.response?.data?.message || "Failed to login with OTP");
    }
  };

  return {
    handleSubmit,
    handleChange,
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
  };
};
