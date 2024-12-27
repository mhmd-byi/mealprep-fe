import { useState } from "react";
import axios from "axios";

export const useCustomiseYourMeal = () => {
  const [meals, setMeals] = useState([]);
  const [items, setItems] = useState([{
    name: "",
    description: "",
    weight: "",
  }]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const getMealItems = async (date) => {
    try {
      if (!token) {
        throw new Error("No token found. Please login again.");
      }
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}meal/get-meal?date=${date}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("this is response", response);
      setItems(response.data[0].items);
    } catch (e) {
      console.error(e);
      setErrorMessage('Menu not updated, please come back in some time');
    }
  };

  const createMealRequest = async (date) => {
    try {
      const response = await axios({
        method: "PUT",
        url: `${process.env.REACT_APP_API_URL}meal/customise-meal-request`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          userId,
          date,
          items: {
            ...items,
          },
        },
      });
      if (response.status === 201 || response.status === 200) {
        setItems([{
          name: "",
          description: "",
          weight: "",
        }]);
        setMessage('Your request has been submitted successfully');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return {
    getMealItems,
    createMealRequest,
    message,
    items,
    handleItemChange,
    errorMessage,
  };
};
