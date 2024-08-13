import React, { useState, useRef } from "react";
import { Visibility, VisibilityOff, CloudUpload } from "@mui/icons-material";

export const Input = ({
  type = "text",
  onChange,
  id,
  disabled = false,
  name,
  value,
  placeholder,
  autocomplete = false,
  required = false,
  classes = "block w-full h-12 rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 focus:border-theme-color-1 sm:text-sm sm:leading-6",
  options = [],
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = (e) => {
    let files = [];
    if (e.target.files) {
      files = e.target.files;
    } else if (e.dataTransfer && e.dataTransfer.files) {
      files = e.dataTransfer.files;
    }

    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      onChange({ target: { ...e.target, files: files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e);
  };

  if (type === "file") {
    return (
      <div
        className="relative p-6 border-2 border-dashed border-theme-color-1 rounded-lg hover:border-dotted cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          onChange={handleFileChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          required={required}
          id={id}
          name={name}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center h-full">
          {filePreview ? (
            filePreview.startsWith("data:image") ? (
              <img
                src={filePreview}
                alt="File preview"
                className="w-60 h-60 rounded-md object-cover"
              />
            ) : (
              <span className="text-gray-500">No Preview Available</span>
            )
          ) : (
            <p className="text-gray-500 flex">
              Upload Profile Photo {<CloudUpload className="ml-2"/>}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "select") {
    return (
      <select
        onChange={onChange}
        value={value}
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        className={classes}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
        value={value}
        placeholder={placeholder}
        className={classes}
        autoComplete={autocomplete ? "on" : "off"}
        disabled={disabled}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
        >
          {showPassword ? (
            <Visibility className="h-3 w-3 text-theme-color-1" />
          ) : (
            <VisibilityOff className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
};