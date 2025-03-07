import { useState } from "react";
import axios, { all } from "axios";
import { sendEmail } from "../../utils";

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
  const email = sessionStorage.getItem("email");

  const getMealItems = async (date, mealType) => {
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
        const allItems = items.map(item => `${item.name} - ${item.description} - ${item.weight}\n`);
        sendEmail(email, email, "Meal customisation request submitted", "Your request has been submitted successfully with following details: \n" + allItems);
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
    setItems,
    setErrorMessage,
  };
};
