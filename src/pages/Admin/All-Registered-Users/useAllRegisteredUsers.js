import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export const useAllRegisteredUsers = () => {
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const planFilter = searchParams.get("plan"); // 'Weekly', 'Monthly', or null

  const getAllUsers = async () => {
    try {
      setIsLoading(true);
      // Build URL — pass plan as query param so the API filters server-side
      const url = new URL(`${process.env.REACT_APP_API_URL}user/all`);
      if (planFilter) {
        url.searchParams.set("plan", planFilter);
      }
      const response = await axios({
        method: 'GET',
        url: url.toString(),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllRegisteredUsers(response.data);
    } catch (e) {
      console.error('error processing request', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [planFilter]); // re-fetch whenever plan query param changes

  const convertToCSV = (data) => {
    const headers = ['Name', 'Email', 'Mobile', 'Address', 'Current Plan', 'Meal Counts Left', 'Allergy', 'Meal Start Date', 'Registered Date'];
    const rows = data.map(user => [
      `${user.firstName} ${user.lastName}`, // Name
      user.email, // Email
      user.mobile, // Mobile
      (user.postalAddress || "").replaceAll(",", "-"), // Address
      (user.subscriptions[user.subscriptions.length - 1]?.plan || 'No active plan'), // Current plan
      `Lunch: ${(user.mealCounts.lunchMeals || 0) + (user.mealCounts.nextDayLunchMeals || 0)}, Dinner: ${(user.mealCounts.dinnerMeals || 0) + (user.mealCounts.nextDayDinnerMeals || 0)}`, // Meal Counts
      (user.subscriptions[user.subscriptions.length - 1]?.allergy || 'None'), // Allergy
      (user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate || 'N/A'), // Meal Start Date
      (user.createdAt || user.created_date || 'N/A') // Registered Date
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
    allRegisteredUsers,
    isLoading,
    planFilter,
    downloadCSV
  };
};