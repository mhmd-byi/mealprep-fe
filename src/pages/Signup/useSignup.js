import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
  const navigate = useNavigate();
  const [loaderState, setLoaderState] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    postalAddress: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setLoaderState(false);
        sessionStorage.setItem("token", res.data.tokens.access.token);
        sessionStorage.setItem("userId", res.data.user._id);
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
  };
};
