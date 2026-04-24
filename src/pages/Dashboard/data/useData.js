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

  // 1. Users & Ending Soon Query (Fetch only active users for ending soon check)
  const usersQuery = useQuery({
    queryKey: ['users', 'active-for-ending-soon'],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}user/all?activeOnly=true`,
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
        // Note: For 'allCount' we might still need a lightweight call or just use active count
        // For now, let's keep it as is or fetch total count from another source if needed.
        // Actually, the user usually wants total REGISTERED users.
        endingSoonCount: endingSoon.length,
        endingSoonUsers: endingSoon
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // 1.1 Total Registered Users Count (Lightweight)
  const totalUsersQuery = useQuery({
    queryKey: ['totalUserCount'],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `${process.env.REACT_APP_API_URL}user`, // This calls getAllUsers which is just User.find({})
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.users.length;
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
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

  // 5. Subscription Counts Query (Optimized to use single endpoint)
  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptionCounts'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}subscription/active-subscription-counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return {
        weekly: data.weeklyCount || 0,
        monthly: data.monthlyCount || 0,
        trial: data.trialCount || 0
      };
    },
    enabled: !!token,
  });

  return {
    allRegisteredUsersCount: totalUsersQuery.data || 0,
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
      users: usersQuery.isLoading || totalUsersQuery.isLoading,
      cancelled: cancelledQuery.isLoading,
      deliveryLunch: deliveryLunchQuery.isLoading,
      deliveryDinner: deliveryDinnerQuery.isLoading,
      customisation: customisationQuery.isLoading,
      subscriptions: subscriptionsQuery.isLoading
    }
  };
};
