import axios from "axios";
import { useEffect, useState } from "react";
import { calculateSubEndDate } from "../../../subscriptionUtils";

export const useData = () => {
  const [allRegisteredUsersCount, setAllRegisteredUsersCount] = useState(0);
  const [endingSoonCount, setEndingSoonCount] = useState(0);
  const [endingSoonUsers, setEndingSoonUsers] = useState([]);
  const [customisationRequestCount, setCustomisationRequestCount] = useState(0);
  const [cancelledMealsCount, setCancelledMealsCount] = useState(0);
  const [mealDeliveryListCountLunch, setMealDeliveryListCountLunch] = useState(0);
  const [mealDeliveryListCountDinner, setMealDeliveryListCountDinner] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  
  const getAllUsers = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}user/all`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = response.data;
      setAllRegisteredUsersCount(users.length);

      // Calculate subscriptions ending in next 3 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      const endingSoon = [];
      users.forEach(user => {
        const { date, formattedDate } = calculateSubEndDate(user);
        if (date && date >= today && date <= threeDaysLater) {
          endingSoon.push({
            ...user,
            estimatedEndDate: formattedDate,
            estimatedEndDateObj: date
          });
        }
      });
      setEndingSoonCount(endingSoon.length);
      setEndingSoonUsers(endingSoon);
    } catch (e) {
      console.error("error processing request", e);
    }
  };

  const getActiveSubscriptionCounts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/active-subscription-counts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWeeklyCount(response.data.weeklyCount);
      setMonthlyCount(response.data.monthlyCount);
    } catch (e) {
      console.error("error processing request", e);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const currentDate = getCurrentDate();

  const getCancelledRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/cancelled-meals?date=${currentDate}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setCancelledMealsCount(response.data.length);
    } catch (error) {
      setError('Failed to fetch cancelled meals');
      setCancelledMealsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryCount = async (mealType) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/get-meal-delivery-details?date=${currentDate}&mealType=${mealType}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.length > 0) {
        mealType === "lunch"
          ? setMealDeliveryListCountLunch(response.data.length)
          : setMealDeliveryListCountDinner(response.data.length);
      } else {
        mealType === "lunch"
          ? setMealDeliveryListCountLunch(0)
          : setMealDeliveryListCountDinner(0);
      }
    } catch (error) {
      setError(`Failed to fetch meal deliver list`);
      setMealDeliveryListCountLunch(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomisationRequestCount = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}meal/get-customisation-requests?date=${currentDate}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomisationRequestCount(response.data.length);
    } catch (e) {
      console.error("error processing request", e);
    }
  };

  const fetchBothMealCOunts = () => {
    getDeliveryCount("lunch");
    getDeliveryCount("dinner");
  };

  useEffect(() => {
    getAllUsers();
    getCancelledRequests();
    fetchBothMealCOunts();
    getCustomisationRequestCount();
    getActiveSubscriptionCounts();
  }, [token]);

  return {
    allRegisteredUsersCount,
    endingSoonCount,
    endingSoonUsers,
    cancelledMealsCount,
    mealDeliveryListCountLunch,
    mealDeliveryListCountDinner,
    customisationRequestCount,
    weeklyCount,
    monthlyCount,
  };
};
