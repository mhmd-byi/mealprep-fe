import React, { useState, useRef } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export const Input = ({
  type = "text",
  onChange,
  id,
  name,
  placeholder,
  required = false,
  classes = "block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:theme-color-1 sm:text-sm sm:leading-6 focus:border-theme-color-1",
  buttonClasses = "flex items-center justify-center px-4 py-2 bg-theme-color-1 text-white rounded-lg shadow-md hover:bg-theme-color-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-color-1",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      onChange(e);
    }
  };

  if (type === "file") {
    return (
      <div className="relative">
        <input
          type="file"
          onChange={handleFileChange}
          required={required}
          id={id}
          name={name}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className={buttonClasses}
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          <span>Upload File</span>
        </button>
        {filePreview && (
          <div className="mt-4">
            {filePreview.startsWith("data:image") ? (
              <img
                src={filePreview}
                alt="File preview"
                className="w-60 h-60 border-2 border-dashed border-theme-color-1 rounded-md object-cover"
              />
            ) : (
              <div className="w-60 h-60 border-2 border-dashed border-theme-color-1 rounded-md flex items-center justify-center text-gray-500">
                <span>No Preview Available</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type={type === "password" && showPassword ? "text" : type}
        onChange={onChange}
        required={required}
        id={id}
        name={name}
        placeholder={placeholder}
        className={classes}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};
