import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

import {
  Cancel,
  CloudUpload,
  Check,
  ReportProblemTwoTone,
  ErrorOutline,
} from "@mui/icons-material";

export const FileUpload = ({
  onFileChange,
  label,
  multiple = false,
  maxFiles = Infinity,
  maxSizeInMB = 5,
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError(
          `Some files were rejected. Please ensure they are images under ${maxSizeInMB}MB.`
        );
        return;
      }

      const newFiles = multiple
        ? [...files, ...acceptedFiles]
        : [acceptedFiles[0]];

      setError(null);
      setFiles(newFiles);
      onFileChange(multiple ? newFiles : newFiles[0]);

      const newPreviews = newFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
      }));
      setPreviews(newPreviews);
      newFiles.forEach((file) => {
        const fileId = file.name + file.size;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = (prev[fileId] || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
            }
            return { ...prev, [fileId]: Math.min(newProgress, 100) };
          });
        }, 200);
      });
    },
    [files, multiple, onFileChange, maxSizeInMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: multiple,
    maxSize: maxSizeInMB * 1024 * 1024,
  });

  const removeFile = useCallback(
    (index) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      onFileChange(multiple ? newFiles : newFiles[0] || null);

      const newPreviews = [...previews];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      setPreviews(newPreviews);
      const removedFile = files[index];
      const fileId = removedFile.name + removedFile.size;
      setUploadProgress((prev) => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });
    },
    [files, previews, multiple, onFileChange]
  );

  useEffect(() => {
    return () =>
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const renderPreviews = () => {
    if (!multiple && previews.length === 1) {
      const preview = previews[0];
      const file = files[0];
      const fileId = file.name + file.size;
      const progress = uploadProgress[fileId] || 0;

      return (
        <div className="relative w-full h-64">
          <img
            src={preview.url}
            alt="Preview"
            className="w-full h-full object-cover rounded"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile(0);
              }}
              className="text-white hover:text-red-500 transition-colors"
            >
              <Cancel fontSize="large" />
            </button>
          </div>
          {progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
              <div
                className="bg-theme-color h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {progress === 100 && (
            <div className="absolute top-2 right-2 text-green-500">
              <Check fontSize="medium" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        {previews.map((preview, index) => {
          const file = files[index];
          const fileId = file.name + file.size;
          const progress = uploadProgress[fileId] || 0;

          return (
            <div key={preview.id} className="relative group">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded transition-opacity group-hover:opacity-75"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Cancel fontSize="small" />
              </button>
              {progress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                  <div
                    className="bg-theme-color-1 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-theme-color-1 bg-blue-50 scale-105"
            : "border-gray-300 hover:border-theme-color-1"
        }`}
      >
        <input {...getInputProps()} />
        {files.length > 0 ? (
          renderPreviews()
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <CloudUpload
              fontSize="large"
              className={`${
                isDragActive ? "text-theme-color-1 animate-bounce" : "text-black"
              } mb-4`}
              style={{ fontSize: 64 }}
            />
            <p className="text-lg font-semibold text-theme-color-1">
              {isDragActive
                ? "Drop it like it's hot!"
                : "Upload your masterpiece here"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to select from your device
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <ErrorOutline fontSize="small" className="mr-1" />
          {error}
        </p>
      )}
      {multiple && files.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          {files.length} file{files.length !== 1 ? "s" : ""} uploaded
        </p>
      )}
    </div>
  );
};
