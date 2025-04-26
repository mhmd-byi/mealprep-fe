import React, { useState, useEffect } from "react";
import { ErrorOutline } from "@mui/icons-material";

const indorePinCodes = [
  452001, 453441, 453551, 453001, 452016, 453111, 452009, 452003, 452020,
  453331, 452010, 452006, 452013, 452002, 452015, 452018, 452014, 452011,
  453771, 453236, 453112, 453446, 453332, 453115, 452007, 452012, 452005,
  452008, 453220, 453661,
];

const usePincodeValidation = (formRef, passwordFieldName = "pincode") => {
  const [message, setMessage] = useState({});
  const [pincodeValid, setPincodeValid] = useState(false);

  useEffect(() => {
    if (!formRef.current) return;

    const form = formRef.current;
    const pincodeInput = form.elements[passwordFieldName];

    if (!pincodeInput) return;

    const validatePincode = () => {
      const pinValue = Number(pincodeInput.value);
      if (pinValue == "" || isNaN(pinValue)) {
        setPincodeValid(false);
        setMessage({});
        return;
      }

      const pinIs6Dig = pinValue > 100000 && pinValue < 999999;
      if (!pinIs6Dig) {
        setPincodeValid(false);
        setMessage({
          text: "Enter Valid 6 digit Pin Code",
          color: "text-red-500",
          icon: <ErrorOutline className="h-5 w-5 text-red-500" />,
        });
        return;
      }
      if (!indorePinCodes.includes(pinValue)) {
        setPincodeValid(false);
        setMessage({
          text: "Only Indore candidates are allowed to sign up",
          color: "text-red-500",
          icon: <ErrorOutline className="h-5 w-5 text-red-500" />,
        });
      } else {
        setPincodeValid(true);
        setMessage({});
      }
    };

    pincodeInput.addEventListener("input", validatePincode);

    return () => {
      if (pincodeInput) {
        pincodeInput.removeEventListener("input", validatePincode);
      }
    };
  }, [formRef, passwordFieldName]);

  const PincodeValidationMessage = () =>
    message ? (
      <div className={`flex items-center ${message.color}`}>
        {message.icon}
        <span className="ml-2">{message.text}</span>
      </div>
    ) : null;

  return { PincodeValidationMessage, pincodeValid };
};

export default usePincodeValidation;
