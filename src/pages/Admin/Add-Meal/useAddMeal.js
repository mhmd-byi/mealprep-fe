import { useState } from "react";
import axios from "axios";
import { uploadFileToS3 } from "../../../utils/s3Upload";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useAddMeal = () => {
  const [isPublishing, setIsPublishing] = useState(false);

  // Publishing does two real, existing things: attaches the reference photo(s)
  // customers actually see (meal/update-meal-images), and replaces that day's
  // structured item list used for the admin's own records (meal/add-meal).
  const publishMenu = async ({ date, mealType, items, referenceImages }) => {
    const userId = sessionStorage.getItem("userId");
    setIsPublishing(true);
    try {
      if (referenceImages.length > 0) {
        const uploaded = await Promise.all(referenceImages.map((file) => uploadFileToS3(file)));
        const imageUrls = uploaded.filter(Boolean);
        if (imageUrls.length > 0) {
          await axios.put(
            `${process.env.REACT_APP_API_URL}meal/update-meal-images`,
            { date, imageUrls, userId },
            authHeaders()
          );
        }
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}meal/add-meal`,
        { userId, date, mealType, items },
        authHeaders()
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return { publishMenu, isPublishing };
};

export default useAddMeal;
