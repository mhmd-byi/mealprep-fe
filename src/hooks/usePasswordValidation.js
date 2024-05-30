import React, { useState, useEffect } from "react";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";

const usePasswordValidation = (
  formRef,
  passwordFieldName,
  confirmPasswordFieldName
) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!formRef.current) return; // Ensure the form reference exists

    const form = formRef.current;
    const passwordInput = form.elements[passwordFieldName];
    const confirmPasswordInput = form.elements[confirmPasswordFieldName];

    // Ensure both input fields are available before adding event listeners
    if (!passwordInput || !confirmPasswordInput) return;

    const validatePasswords = () => {
      if (!confirmPasswordInput.value) {
        setMessage("");
        return;
      }
      if (passwordInput.value === confirmPasswordInput.value) {
        setMessage({
          text: "Passwords match!",
          color: "text-green-500",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      } else {
        setMessage({
          text: "Passwords do not match!",
          color: "text-red-500",
          icon: <ErrorOutline className="h-5 w-5 text-red-500" />,
        });
      }
    };

    passwordInput.addEventListener("input", validatePasswords);
    confirmPasswordInput.addEventListener("input", validatePasswords);

    return () => {
      if (passwordInput && confirmPasswordInput) {
        passwordInput.removeEventListener("input", validatePasswords);
        confirmPasswordInput.removeEventListener("input", validatePasswords);
      }
    };
  }, [formRef, passwordFieldName, confirmPasswordFieldName]);

  const ValidationMessage = () =>
    message ? (
      <div className={`flex items-center ${message.color}`}>
        {message.icon}
        <span className="ml-2">{message.text}</span>
      </div>
    ) : null;

  return { ValidationMessage };
};

export default usePasswordValidation;
