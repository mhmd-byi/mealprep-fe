import { useEffect } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateSubEndDate, holidayDateKeysFrom } from "../../../subscriptionUtils";
import { listenForUsersChanged } from "../../../utils/crossTabSync";
import { percentChange } from "../../../components/common/ChangeBadge/ChangeBadge";

// Same cadence as the Monetary Dashboard — re-fetches in the background so
// numbers stay current if this page is left open, without the admin having
// to reload.
const AUTO_REFRESH_INTERVAL = 3 * 60 * 1000;

export const useData = () => {
  const token = sessionStorage.getItem("token");
  const queryClient = useQueryClient();

  // Same cross-tab pickup as All Registered Users — without this, "Ending
  // Soon" (and its Est. End Date) only refreshes once its own 5-minute
  // staleTime expires or the page is reloaded, which is exactly why edits
  // made in Manage Subscriptions (a different tab) could take a very long
  // time to show up here even though they show up instantly elsewhere.
  useEffect(() => {
    const unsubscribe = listenForUsersChanged(() => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const currentDate = getCurrentDate();

  // Same day last week, not literally "yesterday" — Sundays have zero meal
  // activity (no deliveries at all), so a plain day-over-day comparison would
  // show a misleading spike every single Monday. Matches the comparison
  // period already used on the Cancelled Meals and Delivered Meal Log pages.
  const getSameDayLastWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  };
  const lastWeekDate = getSameDayLastWeek();

  // 1. Users & Ending Soon Query (Fetch only active users for ending soon check)
  const usersQuery = useQuery({
    queryKey: ['users', 'active-for-ending-soon'],
    queryFn: async () => {
      const [response, holidaysResponse] = await Promise.all([
        axios({
          method: "GET",
          url: `${process.env.REACT_APP_API_URL}user/all?activeOnly=true`,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}holiday/get-holidays`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const users = response.data;
      const holidayDateKeys = holidayDateKeysFrom(holidaysResponse.data.holidays || []);

      // Calculate subscriptions ending in next 3 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      const endingSoon = [];
      users.forEach(user => {
        const { date, formattedDate } = calculateSubEndDate(user, holidayDateKeys);
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
    refetchInterval: AUTO_REFRESH_INTERVAL,
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
      const users = response.data.users;
      const now = new Date();
      const newThisMonth = users.filter((u) => {
        const created = new Date(u.createdAt);
        return !Number.isNaN(created.getTime()) && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;
      // Registration dates are immutable, so "count of users who existed 30
      // days ago" can be reconstructed exactly from createdAt — unlike
      // subscription status (active/inactive), which has no history to replay.
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const countThirtyDaysAgo = users.filter((u) => {
        const created = new Date(u.createdAt);
        return !Number.isNaN(created.getTime()) && created <= thirtyDaysAgo;
      }).length;
      return { count: users.length, newThisMonth, countThirtyDaysAgo };
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  // getCancelledMeals responds 404 (not an empty array) when a date has no
  // cancellations, so that case has to be caught here rather than just read.
  const fetchCancelledCount = async (dateStr) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/cancelled-meals?date=${dateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.length;
    } catch (err) {
      if (err.response?.status === 404) return 0;
      throw err;
    }
  };

  // 2. Cancelled Requests Query — today vs. the same weekday last week
  const cancelledQuery = useQuery({
    queryKey: ['cancelledMeals', currentDate],
    queryFn: async () => {
      const [count, previousCount] = await Promise.all([
        fetchCancelledCount(currentDate),
        fetchCancelledCount(lastWeekDate),
      ]);
      return { count, previousCount };
    },
    enabled: !!token,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const fetchDeliveryCount = async (dateStr, mealType) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}subscription/get-meal-delivery-details?date=${dateStr}&mealType=${mealType}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.length;
  };

  // 3. Delivery Counts Queries — today vs. the same weekday last week
  const deliveryLunchQuery = useQuery({
    queryKey: ['deliveryCount', 'lunch', currentDate],
    queryFn: async () => {
      const [count, previousCount] = await Promise.all([
        fetchDeliveryCount(currentDate, 'lunch'),
        fetchDeliveryCount(lastWeekDate, 'lunch'),
      ]);
      return { count, previousCount };
    },
    enabled: !!token,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const deliveryDinnerQuery = useQuery({
    queryKey: ['deliveryCount', 'dinner', currentDate],
    queryFn: async () => {
      const [count, previousCount] = await Promise.all([
        fetchDeliveryCount(currentDate, 'dinner'),
        fetchDeliveryCount(lastWeekDate, 'dinner'),
      ]);
      return { count, previousCount };
    },
    enabled: !!token,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  // 4. Customisation Requests Query — today vs. the same weekday last week
  const customisationQuery = useQuery({
    queryKey: ['customisationRequests', currentDate],
    queryFn: async () => {
      const [current, previous] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}meal/get-customisation-requests?date=${currentDate}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}meal/get-customisation-requests?date=${lastWeekDate}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      return { count: current.data.length, previousCount: previous.data.length };
    },
    enabled: !!token,
    refetchInterval: AUTO_REFRESH_INTERVAL,
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
        trial: data.trialCount || 0,
        // null (not 0) means no snapshot exists yet for 7 days ago — the
        // daily snapshot job only started recording from whenever it was
        // deployed, so there's nothing to compare against until a week in.
        previousWeekly: data.previousWeeklyCount,
        previousMonthly: data.previousMonthlyCount,
        previousTrial: data.previousTrialCount
      };
    },
    enabled: !!token,
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  return {
    allRegisteredUsersCount: totalUsersQuery.data?.count || 0,
    allRegisteredUsersChange: totalUsersQuery.data
      ? percentChange(totalUsersQuery.data.count, totalUsersQuery.data.countThirtyDaysAgo)
      : undefined,
    newUsersThisMonth: totalUsersQuery.data?.newThisMonth || 0,
    endingSoonCount: usersQuery.data?.endingSoonCount || 0,
    endingSoonUsers: usersQuery.data?.endingSoonUsers || [],
    cancelledMealsCount: cancelledQuery.data?.count || 0,
    cancelledMealsChange: cancelledQuery.data
      ? percentChange(cancelledQuery.data.count, cancelledQuery.data.previousCount)
      : undefined,
    mealDeliveryListCountLunch: deliveryLunchQuery.data?.count || 0,
    mealDeliveryListCountLunchChange: deliveryLunchQuery.data
      ? percentChange(deliveryLunchQuery.data.count, deliveryLunchQuery.data.previousCount)
      : undefined,
    mealDeliveryListCountDinner: deliveryDinnerQuery.data?.count || 0,
    mealDeliveryListCountDinnerChange: deliveryDinnerQuery.data
      ? percentChange(deliveryDinnerQuery.data.count, deliveryDinnerQuery.data.previousCount)
      : undefined,
    customisationRequestCount: customisationQuery.data?.count || 0,
    customisationRequestChange: customisationQuery.data
      ? percentChange(customisationQuery.data.count, customisationQuery.data.previousCount)
      : undefined,
    weeklyCount: subscriptionsQuery.data?.weekly || 0,
    weeklyCountChange: subscriptionsQuery.data?.previousWeekly != null
      ? percentChange(subscriptionsQuery.data.weekly, subscriptionsQuery.data.previousWeekly)
      : undefined,
    monthlyCount: subscriptionsQuery.data?.monthly || 0,
    monthlyCountChange: subscriptionsQuery.data?.previousMonthly != null
      ? percentChange(subscriptionsQuery.data.monthly, subscriptionsQuery.data.previousMonthly)
      : undefined,
    trialCount: subscriptionsQuery.data?.trial || 0,
    trialCountChange: subscriptionsQuery.data?.previousTrial != null
      ? percentChange(subscriptionsQuery.data.trial, subscriptionsQuery.data.previousTrial)
      : undefined,
    loadingStates: {
      users: usersQuery.isLoading || totalUsersQuery.isLoading,
      cancelled: cancelledQuery.isLoading,
      deliveryLunch: deliveryLunchQuery.isLoading,
      deliveryDinner: deliveryDinnerQuery.isLoading,
      customisation: customisationQuery.isLoading,
      subscriptions: subscriptionsQuery.isLoading
    },
    isRefreshing: [
      usersQuery, totalUsersQuery, cancelledQuery,
      deliveryLunchQuery, deliveryDinnerQuery, customisationQuery, subscriptionsQuery,
    ].some((q) => q.isFetching),
    refresh: () => Promise.all([
      usersQuery.refetch(), totalUsersQuery.refetch(), cancelledQuery.refetch(),
      deliveryLunchQuery.refetch(), deliveryDinnerQuery.refetch(), customisationQuery.refetch(), subscriptionsQuery.refetch(),
    ]),
  };
};
