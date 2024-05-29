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

  const handlePopupSubmit = () => {
    if (formData.profileImageUrl) {
      handleSubmit();
    } else {
      alert("Please upload an image first.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (formData.password === formData.confirmPassword) {
      try {
        axios({
          method: "PATCH",
          url: `${process.env.REACT_APP_API_URL}user/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
        })
          .then(() => {
            window.location.reload();
          })
          .catch((e) => {
            console.log("this is an error", e);
          });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Passwords do not match.");
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
