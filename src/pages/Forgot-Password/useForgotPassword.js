import { useState } from "react";
import axios from "axios";

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}user/forgot-password`,
        data: {
          email: email.toLowerCase(),
        },
      }).then((res) => {
        setMessage('Check your email for a reset link.');
      }).catch((err) => {
        setMessage('Error sending reset email.');
      })
    } catch (err) {
      setMessage('Error sending reset email.');
    }
  };
  return {
    handleSubmit,
    message,
    setEmail,
    email,
  };
};
