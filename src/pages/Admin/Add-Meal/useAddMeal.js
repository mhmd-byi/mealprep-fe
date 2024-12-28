import { useEffect, useState } from "react";
import axios from "axios";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

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
  const [date, setDate] = useState("");
  const [menuImages, setMenuImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

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
      await axios.put(
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
    setDate(selectedDate);
    const currentDate = getCurrentDate();

    if (selectedDate >= currentDate) {
      setMealData((prev) => ({ ...prev, date: selectedDate }));
    } else {
      console.warn("Cannot select a date in the past");
    }
  };

  const getMenuImages = async (particularDate) => {
    try {
      setImagesLoading(true);
      await axios
        .get(
          `${process.env.REACT_APP_API_URL}meal/fetch-menu-images?date=${particularDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setMenuImages(response.data.imageUrls);
          setImagesLoading(false);
        })
        .catch((error) => {
          console.error("Error getting menu images:", error);
          setImagesLoading(false);
          return [];
        });
    } catch (error) {
      console.error("Error getting menu images:", error);
    }
  };

  const deleteAnImage = async (imageUrl, particularDate) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}meal/delete-menu-images`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            date: particularDate,
            url: imageUrl
          }
        }
      );

      getMenuImages(date);
      toast.success('Image deleted successfully')
      return response.data;
    } catch (error) {
      console.error("Error deleting menu images:", error);
      toast.error('Error deleting menu images')
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

  const removeItem = (index) => {
    setMealData((prev) => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  useEffect(() => {
    if (date.length > 1) {
      getMenuImages(date);
    }
  }, [date]);

  const getMealItemsInText = async (date, mealType) => {
    try {
      if (!token) {
        throw new Error("No token found. Please login again.");
      }
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}meal/get-meal?date=${date}&mealType=${mealType}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMealData((prev) => ({
        ...prev,
        items: response?.data[0]?.items || [{ name: "", weight: "", type: "", description: "" }],
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (date && mealData.mealType) {
      getMealItemsInText(date, mealData.mealType)
    }
  }, [date, mealData.mealType]);

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
    date,
    setDate,
    menuImages,
    imagesLoading,
    deleteAnImage,
    getMealItemsInText,
  };
};

export default useAddMeal;
