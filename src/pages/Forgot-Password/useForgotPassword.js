import { useState } from "react";

export const useForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return {
    handleChange,
    formData,
    handleSubmit,
  };
};
