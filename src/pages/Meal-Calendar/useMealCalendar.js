// hooks/useMealCalendar.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useMealCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  const fetchMeals = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login again.");
      }
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}meal/get-meal?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('this is response', response)
      setMeals(response.data);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setError("No meals found for the following date");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleRemoveItem = async (mealId, itemId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please login again.");
      }
      await axios.delete(
        `${process.env.REACT_APP_API_URL}meal/remove-meal-item/${mealId}/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMeals(selectedDate);
    } catch (error) {
      console.error("Error removing meal item:", error);
      setError("Failed to remove meal item. Please try again.");
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  return {
    currentDate,
    selectedDate,
    meals,
    loading,
    error,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    handleRemoveItem,
    isPastDate,
  };
};
