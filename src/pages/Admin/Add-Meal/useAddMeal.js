import { useState } from "react";
import axios from "axios";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const useAddMeal = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [mealData, setMealData] = useState({
    date: getCurrentDate(),
    mealType: "",
    items: [{ name: "", weight: "", type: "", description: "" }],
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mealImages, setMealImages] = useState([]);

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
  const handleMultipleImageUpload = async () => {
    setIsLoading(true);
    try {
      const uploadPromises = mealImages.map((file) => uploadFileToS3(file));
      const imageUrls = await Promise.all(uploadPromises);

      const validImageUrls = imageUrls.filter((url) => url !== null);

      if (validImageUrls.length > 0) {
        await updateMealImageUrls(mealData.date, validImageUrls);
        setMealImages([]);
        return true;
      } else {
        throw new Error("Failed to upload images");
      }
    } catch (error) {
      console.error("Error in handleMultipleImageUpload:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMealImageUrls = async (date, imageUrls) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}meal/update-meal-images`,
        {
          date,
          imageUrls,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error updating meal image URLs:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (mealImages.length > 0) {
        await handleMultipleImageUpload();
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}meal/add-meal`,
        {
          userId,
          ...mealData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form
      setMealData({
        date: getCurrentDate(),
        mealType: "",
        items: [{ name: "", weight: "", type: "", description: "" }],
      });
      setMealImages([]);
    } catch (error) {
      console.error("Error adding meal:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const currentDate = getCurrentDate();

    if (selectedDate >= currentDate) {
      setMealData((prev) => ({ ...prev, date: selectedDate }));
    } else {
      console.warn("Cannot select a date in the past");
    }
  };

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
    setMealImages,
    handleMultipleImageUpload,
    mealImages,
    getCurrentDate,
  };
};

export default useAddMeal;
