import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const [loaderState, setLoaderState] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        navigate("/dashboard");
      })
      .catch((err) => {
        setLoaderState(false);
        setErrMsg("Invalid email or password");
      });
  };

  return {
    handleSubmit,
    handleChange,
    formData,
    loaderState,
    errMsg,
  };
};
