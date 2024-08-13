import { useState } from "react";
import axios from "axios";

const useAddMeal = () => {
  const [mealData, setMealData] = useState({
    date: "",
    mealType: "",
    items: [{ name: "", weight: "", type: "", description: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const handleDateChange = (event) => {
    setMealData((prevData) => ({ ...prevData, date: event.target.value }));
  };

  const handleMealTypeChange = (event) => {
    setMealData((prevData) => ({ ...prevData, mealType: event.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    setMealData((prevData) => {
      const newItems = [...prevData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prevData, items: newItems };
    });
  };

  const addNewItem = () => {
    setMealData((prevData) => ({
      ...prevData,
      items: [
        ...prevData.items,
        { name: "", weight: "", type: "", description: "" },
      ],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}add-meal`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          userId,
          ...mealData,
        },
      });

      console.log("Meal added successfully:", response.data);
      // Reset form after successful submission
      setMealData({
        date: "",
        mealType: "",
        items: [{ name: "", weight: "", type: "", description: "" }],
      });
      setIsLoading(false);
      // You might want to add some success notification here
    } catch (error) {
      console.error("Error adding meal:", error);
      setIsLoading(false);
      // You might want to add some error notification here
    }
  };
  const removeItem = (index) => {
    setMealData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index),
    }));
  };

  return {
    mealData,
    isLoading,
    handleDateChange,
    handleMealTypeChange,
    handleItemChange,
    addNewItem,
    handleSubmit,
    removeItem
  };
};

export default useAddMeal;
