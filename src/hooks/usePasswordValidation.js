// usePasswordValidation.js
import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

const usePasswordValidation = (
  formRef,
  passwordFieldName,
  confirmPasswordFieldName
) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const passwordInput = form.elements[passwordFieldName];
    const confirmPasswordInput = form.elements[confirmPasswordFieldName];

    const validatePasswords = () => {
      if (!confirmPasswordInput.value) {
        setMessage("");
        return;
      }
      if (passwordInput.value === confirmPasswordInput.value) {
        setMessage({
          text: "Passwords match!",
          color: "text-green-500",
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
        });
      } else {
        setMessage({
          text: "Passwords do not match!",
          color: "text-red-500",
          icon: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
        });
      }
    };

    passwordInput.addEventListener("input", validatePasswords);
    confirmPasswordInput.addEventListener("input", validatePasswords);

    return () => {
      passwordInput.removeEventListener("input", validatePasswords);
      confirmPasswordInput.removeEventListener("input", validatePasswords);
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
