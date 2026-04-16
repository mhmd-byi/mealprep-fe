import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { calculateSubEndDate } from "../../../subscriptionUtils";

export const useData = () => {
  const token = sessionStorage.getItem("token");

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const currentDate = getCurrentDate();

  // 1. Users & Ending Soon Query
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}user/all`,
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data;

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

      return {
        allCount: users.length,
        endingSoonCount: endingSoon.length,
        endingSoonUsers: endingSoon
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 2. Cancelled Requests Query
  const cancelledQuery = useQuery({
    queryKey: ['cancelledMeals', currentDate],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/cancelled-meals?date=${currentDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.length;
    },
    enabled: !!token,
  });

  // 3. Delivery Counts Queries
  const deliveryLunchQuery = useQuery({
    queryKey: ['deliveryCount', 'lunch', currentDate],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/get-meal-delivery-details?date=${currentDate}&mealType=lunch`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.length;
    },
    enabled: !!token,
  });

  const deliveryDinnerQuery = useQuery({
    queryKey: ['deliveryCount', 'dinner', currentDate],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/get-meal-delivery-details?date=${currentDate}&mealType=dinner`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.length;
    },
    enabled: !!token,
  });

  // 4. Customisation Requests Query
  const customisationQuery = useQuery({
    queryKey: ['customisationRequests', currentDate],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}meal/get-customisation-requests?date=${currentDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.length;
    },
    enabled: !!token,
  });

  // 5. Subscription Counts Query
  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptionCounts'],
    queryFn: async () => {
      const [weeklyRes, monthlyRes, trialRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}user/all?plan=Weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}user/all?plan=Monthly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}user/all?plan=Trial`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      return {
        weekly: weeklyRes.data.length,
        monthly: monthlyRes.data.length,
        trial: trialRes.data.length
      };
    },
    enabled: !!token,
  });

  return {
    allRegisteredUsersCount: usersQuery.data?.allCount || 0,
    endingSoonCount: usersQuery.data?.endingSoonCount || 0,
    endingSoonUsers: usersQuery.data?.endingSoonUsers || [],
    cancelledMealsCount: cancelledQuery.data || 0,
    mealDeliveryListCountLunch: deliveryLunchQuery.data || 0,
    mealDeliveryListCountDinner: deliveryDinnerQuery.data || 0,
    customisationRequestCount: customisationQuery.data || 0,
    weeklyCount: subscriptionsQuery.data?.weekly || 0,
    monthlyCount: subscriptionsQuery.data?.monthly || 0,
    trialCount: subscriptionsQuery.data?.trial || 0,
    loadingStates: {
      users: usersQuery.isLoading,
      cancelled: cancelledQuery.isLoading,
      deliveryLunch: deliveryLunchQuery.isLoading,
      deliveryDinner: deliveryDinnerQuery.isLoading,
      customisation: customisationQuery.isLoading,
      subscriptions: subscriptionsQuery.isLoading
    }
  };
};
