import { useState } from "react";
import axios from "axios";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const useAddMeal = () => {
  const [mealData, setMealData] = useState({
    date: "",
    mealType: "",
    items: [{ name: "", weight: "", type: "", description: "" }],
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mealImage, setMealImage] = useState(null);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

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

  const uploadFileToS3 = async (fileToUpload) => {
    if (!fileToUpload) {
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
      console.log("File uploaded successfully:", data.Location);
      return data.Location;
    } catch (err) {
      console.error("Error uploading file:", err);
      return null;
    }
  };

  const handleImageUpload = async () => {
    setIsLoading(true);
    try {
      const imageUrl = await uploadFileToS3(mealImage);
      if (imageUrl) {
        await updateMealImageUrl(mealData.date, imageUrl);
        console.log("Image uploaded and database updated successfully");
        
        // Clear the date and image after successful upload
        setMealData((prev) => ({ ...prev, date: "", imageUrl: "" }));
        setMealImage(null);
        
        return true; // Indicate success
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const updateMealImageUrl = async (date, imageUrl) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}update-meal-image`,
        {
          date,
          imageUrl,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error updating meal image URL:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (mealImage) {
        await handleImageUpload();
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}add-meal`,
        {
          userId,
          ...mealData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMealData({
        date: "",
        mealType: "",
        items: [{ name: "", weight: "", type: "", description: "" }],
        imageUrl: "",
      });
      setMealImage(null);
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) =>
    setMealData((prev) => ({ ...prev, date: e.target.value }));

  const handleMealTypeChange = (e) =>
    setMealData((prev) => ({ ...prev, mealType: e.target.value }));

  const handleItemChange = (index, field, value) =>
    setMealData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });

  const addNewItem = () =>
    setMealData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", weight: "", type: "", description: "" },
      ],
    }));

  const removeItem = (index) =>
    setMealData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

  return {
    mealData,
    isLoading,
    handleDateChange,
    handleMealTypeChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleSubmit,
    setMealImage,
    handleImageUpload,
    mealImage
  };
};

export default useAddMeal;
