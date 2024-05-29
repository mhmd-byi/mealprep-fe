import { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const useProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    whatsappNumber: "",
    password: "",
    confirmPassword: "",
    email: "",
    postalAddress: "",
    profileImageUrl: "",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
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
      setFormData((prevFormData) => ({
        ...prevFormData,
        profileImageUrl: data.Location,
      }));
      return data.Location;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    await uploadFileToS3(file);
  };

  const handlePopupSubmit = async (event) => {
    event.preventDefault();
    try {
      axios({
        method: "PATCH",
        url: `${process.env.REACT_APP_API_URL}user/${userId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          profileImageUrl: formData.profileImageUrl,
        },
      }).then((res) => {
        console.log("Image URL updated in database successfully", res);
      });
      setShowPopup(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating image URL:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { profileImageUrl, ...otherData } = formData;
    const updatedFormData = profileImageUrl
      ? { ...formData }
      : { ...otherData };

    if (formData.password === formData.confirmPassword) {
      try {
        const response = await axios({
          method: "PATCH",
          url: `${process.env.REACT_APP_API_URL}user/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: updatedFormData,
        });
        console.log("Profile updated successfully", response);
        window.location.reload();
      } catch (error) {
        console.error("Error submitting profile:", error);
      }
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
  };
};

export default useProfile;
