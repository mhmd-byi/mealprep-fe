import { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const useProfile = (initialProfileImage) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    whatsappNumber: "",
    newPassword: "",
    confirmNewPassword: "",
    email: "",
    postalAddress: "",
  });

  const [profileImageUrl, setProfileImageUrl] = useState(initialProfileImage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const S3_BUCKET = process.env.REACT_APP_API_S3_BUCKET_NAME;
  const REGION = process.env.REACT_APP_API_S3_REGION;
  const ACCESS_KEY = process.env.REACT_APP_API_S3_ACCESS_kEY;
  const SECRET_ACCESS_KEY = process.env.REACT_APP_API_S3_SECRET_ACCESS_KEY;

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
  });
  const s3 = new AWS.S3();

  useEffect(() => {
    // Store Form data
    const storedFormData = localStorage.getItem("formData");
    if (storedFormData) {
      setFormData(JSON.parse(storedFormData));
    }

    // Store profile image
    const storedProfileImageUrl = localStorage.getItem("profileImageUrl");
    if (storedProfileImageUrl) {
      setProfileImageUrl(storedProfileImageUrl);
    }
  }, []);

  const handleUpdateProfilePhoto = async () => {
    try {
      if (selectedFile) {
        const fileUrl = await uploadFileToS3(selectedFile);
        if (fileUrl) {
          setProfileImageUrl(fileUrl);
          localStorage.setItem("profileImageUrl", fileUrl);
          console.log("File uploaded successfully:", fileUrl);
        } else {
          console.error("Failed to upload file.");
        }
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
    } finally {
      setShowPopup(false);
      setSelectedFile(null);
    }
  };

  const uploadFileToS3 = async (file) => {
    if (!file) {
      alert("Please choose a file first!");
      return null;
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file,
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.newPassword === formData.confirmNewPassword) {
      localStorage.setItem("formData", JSON.stringify(formData));
      console.log("Form data saved to localStorage:", formData);
    }
  };

  return {
    formData,
    setFormData,
    profileImageUrl,
    setProfileImageUrl,
    showPopup,
    setShowPopup,
    selectedFile,
    handleUpdateProfilePhoto,
    handleFileChange,
    handleInputChange,
    handleSubmit,
  };
};

export default useProfile;
