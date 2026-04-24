import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useAllRegisteredUsers = () => {
  const [searchParams] = useSearchParams();
  const planFilter = searchParams.get("plan"); 
  const token = sessionStorage.getItem("token");
  const queryClient = useQueryClient();

  // 1. Stage 1: Fetch Active Users only (Fast Load)
  const activeUsersQuery = useQuery({
    queryKey: ['users', 'active', planFilter],
    queryFn: async () => {
      const url = new URL(`${process.env.REACT_APP_API_URL}user/all`);
      url.searchParams.set("activeOnly", "true");
      if (planFilter) url.searchParams.set("plan", planFilter);
      
      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 mins
  });

  // 2. Stage 2: Fetch All Users in background
  const allUsersQuery = useQuery({
    queryKey: ['users', 'all', planFilter],
    queryFn: async () => {
      const url = new URL(`${process.env.REACT_APP_API_URL}user/all`);
      if (planFilter) url.searchParams.set("plan", planFilter);
      
      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token && !planFilter, // Only fetch all if we aren't already filtered by plan (plan filter already implies active)
    staleTime: 5 * 60 * 1000,
  });

  const cancelQueuedPlan = async (subscriptionId) => {
    try {
      await axios({
        method: 'DELETE',
        url: `${process.env.REACT_APP_API_URL}subscription/queued/${subscriptionId}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });
      // Invalidate all user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      return true;
    } catch (e) {
      console.error('Error cancelling queued plan:', e);
      throw e;
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Name', 'Email', 'Mobile', 'Address', 'Current Plan', 'Meal Counts Left', 'Allergy', 'Meal Start Date', 'Registered Date'];
    const rows = data.map(user => [
      `${user.firstName} ${user.lastName}`, 
      user.email, 
      user.mobile, 
      (user.postalAddress || "").replaceAll(",", "-"), 
      (user.subscriptions[user.subscriptions.length - 1]?.plan || 'No active plan'), 
      `Lunch: ${(user.mealCounts.lunchMeals || 0) + (user.mealCounts.nextDayLunchMeals || 0)}, Dinner: ${(user.mealCounts.dinnerMeals || 0) + (user.mealCounts.nextDayDinnerMeals || 0)}`, 
      (user.subscriptions[user.subscriptions.length - 1]?.allergy || 'None'), 
      (user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate || 'N/A'), 
      (user.createdAt || user.created_date || 'N/A') 
    ]);
  
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };
  
  const downloadCSV = (data) => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'AllRegisteredUsers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // Return active users if still loading "all", or if plan filter is active
    allRegisteredUsers: (planFilter || !allUsersQuery.data) ? (activeUsersQuery.data || []) : allUsersQuery.data,
    isLoading: activeUsersQuery.isLoading,
    isBackgroundLoading: allUsersQuery.isLoading,
    planFilter,
    downloadCSV,
    cancelQueuedPlan
  };
};