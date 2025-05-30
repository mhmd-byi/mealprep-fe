import { useState } from "react";
import axios, { all } from "axios";
import { sendEmail } from "../../utils";

export const useCustomiseYourMeal = () => {
  const [meals, setMeals] = useState([]);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const email = sessionStorage.getItem("email");

  /**
   * Get the array of available options
   * @param {string} input 
   * @returns {string[]}
   */
  function getWeightOptions(input) {
    // Remove any invalid separator (full stop is excluded as decimal point)
    input = input.replace(/[^\w\s,-_]/g, ''); // Remove any character that's not alphanumeric, space, comma, hyphen, or underscore
  
    // Split the input by common separators (comma, hyphen, underscore, or space)
    const separatorRegex = /[\s,_-]+/;
    const weights = input.split(separatorRegex);
  
    // Use a regular expression to ensure only valid weight formats are captured
    const validWeightRegex = /\d+[a-zA-Z]+/;
  
    return weights.filter(weight => validWeightRegex.test(weight));
  };

  const getMealItems = async (date, mealType, subscribedFor) => {
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

      const subsForNonVeg = subscribedFor.toLowerCase().includes("non");

      const filteredItems = response.data[0].items.filter((item) => {
        const isNonVeg = item.type.toLowerCase().includes("non");
        const isVeg = !isNonVeg;
        return subsForNonVeg ? isNonVeg : isVeg;
      });

      const havingWeightOptsItems = filteredItems.map((itm) => {
        const weight = itm.weight || "";
        const weights = getWeightOptions(weight).map((str) => ({ value: str, label: str }));
        const selectedWeight = weights.at(0)?.value;
        return { ...itm, weights, weight: selectedWeight };
      });
      setItems(havingWeightOptsItems);
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
        setItems([]);
        setMessage('Your request has been submitted successfully');
        const allItems = items.map(item => `${item.name} - ${item.description} - ${item.weight}\n`);
        sendEmail(userId, "", "Meal Customization Request Received", `
          Your meal customization request has been received! 🍽️\n
          With our customization feature, you can request changes to your dish from today’s menu.\n
          ⏳ Customization Request Timings:\n
          Lunch: 12 Midnight – 11:00 AM\n
          Dinner: 12 Midnight – 4:30 PM\n
          For any further modifications, please reach out to us.\n
          Enjoy your personalized meal!\n\n
          Team Mealprep\n
          ` + allItems);
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
