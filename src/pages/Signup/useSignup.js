import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmail } from "../../utils";

const indorePinCodes = [
  452001, 453441, 453551,
  453001, 452016, 453111,
  452009, 452003, 452020,
  453331, 452010, 452006,
  452013, 452002, 452015,
  452018, 452014, 452011,
  453771, 453236, 453112,
  453446, 453332, 453115,
  452007, 452012, 452005,
  452008, 453220, 453661
];

export const useSignup = () => {
  const navigate = useNavigate();
  const [loaderState, setLoaderState] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    postalAddress: "",
  });
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const currentDate = getCurrentDate();

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
          name: `${formData.firstName} ${formData.lastName}`,
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

  const activityEntry = async (userId) => {
    try {
      const res = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}activity/add-activity`,
        data: {
          userId: userId,
          date: currentDate,
          description: "Account created",
        },
      });
      console.log("Activity added successfully:", res.data);
    } catch (e) {
      console.error("Error adding activity:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const match = formData.postalAddress.match(/\b\d{6}\b/);
    if (match.length > 1) {
      setErrMsg("Please enter only one valid 6 digit pin code.");
      return;
    }
    const usrPincode = match ? Number(match[0]) : null;
    if (usrPincode === null) {
      setErrMsg("Please enter a valid 6 digit pin code in the address.");
      return;
    }
    if (!indorePinCodes.includes(usrPincode)) {
      setErrMsg("Only Indore candidates are allowed to register.");
      return;
    }
    if (!otpVerified) {
      setErrMsg("Please verify your mobile number with OTP first");
      return;
    }
    setLoaderState(true);
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API_URL}user`,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        postalAddress: formData.postalAddress,
      },
    })
      .then((res) => {
        sessionStorage.setItem("token", res.data.tokens.access.token);
        sessionStorage.setItem("userId", res.data.user._id);
        activityEntry(res.data.user._id);
        sendEmail(formData.email, `${formData.firstName} ${formData.lastName}`, "Welcome to Mealprep – Your Fit Meal Journey Begins!", `Dear ${formData.firstName},\n
          Thank you for signing up with Mealprep! 🎉 Your journey towards healthy and convenient eating starts here.\n
          To begin, visit the Plans section and choose a meal plan that suits your lifestyle. Subscribe now and let us take care of your daily nutrition!\n
          👉 Browse Meal Plans\n
          Stay healthy, stay fit!\n\n
          Team Mealprep\n
          `);
        setLoaderState(false);
        navigate("/dashboard/");
      })
      .catch((err) => {
        setLoaderState(false);
        const message =
          err.response && err.response.data.message
            ? err.response.data.message
            : "An unexpected error occurred";
        setErrMsg(message);
      });
  };

  return {
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
  };
};
