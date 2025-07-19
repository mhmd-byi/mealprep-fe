import { useState } from "react";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";

const useProfile = (setUserDetails) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    email: "",
    postalAddress: "",
    profileImageUrl: "",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState(null);

  const S3_BUCKET = process.env.REACT_APP_API_S3_BUCKET_NAME;
  const REGION = process.env.REACT_APP_API_S3_REGION;
  const ACCESS_KEY = process.env.REACT_APP_API_S3_ACCESS_KEY;
  const SECRET_ACCESS_KEY = process.env.REACT_APP_API_S3_SECRET_ACCESS_KEY;

  AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
  });

  const s3 = new AWS.S3();

  const deleteFileFromS3 = async (url) => {
    if (!url) return;

    const fileName = decodeURIComponent(url.split('/').pop().split('?')[0]);
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const uploadFileToS3 = async (fileToUpload) => {
    if (!fileToUpload) {
      alert("Please choose a file first!");
      return null;
    }

    const fileName = `${uuidv4()}-${fileToUpload.name}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: fileToUpload,
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleFileChange = (event) => {
    const fileToUpload = event.target.files[0];
    setFile(fileToUpload);
  };

  const handlePopupSubmit = async () => {
    setIsLoading(true);
    const newImageUrl = await uploadFileToS3(file);
    if (newImageUrl) {
      try {
        if (oldImageUrl) {
          await deleteFileFromS3(oldImageUrl);
        }

        const response = await axios({
          method: "PATCH",
          url: `${process.env.REACT_APP_API_URL}user/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            profileImageUrl: newImageUrl,
          },
        });

        setUserDetails((prevDetails) => ({
          ...prevDetails,
          profileImageUrl: newImageUrl,
        }));
        setOldImageUrl(newImageUrl);
        setShowPopup(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error updating image URL:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    if (updatedFormData.password === updatedFormData.confirmPassword) {
      try {
        const response = await axios({
          method: "PATCH",
          url: `${process.env.REACT_APP_API_URL}user/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: updatedFormData,
        });
        setFormData(response.data);
      } catch (error) {
        console.error("Error submitting profile:", error);
      }
    } else {
      toast.error("Passwords do not match");
    }
  };

  return {
    formData,
    setFormData,
    showPopup,
    setShowPopup,
    handleChange,
    handleSubmit,
    handleFileChange,
    handlePopupSubmit,
    setIsLoading,
    isLoading,
  };
};

export default useProfile;
