import { useEffect, useState } from "react";
import axios from "axios";

export const useAllRegisteredUsers = () => {
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const token = sessionStorage.getItem("token");

  const getAllUsers = async () => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}user/all`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllRegisteredUsers(response.data);
    } catch (e) {
      console.error('error processing request', e);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const convertToCSV = (data) => {
    const headers = ['Name', 'Email', 'Mobile', 'Address', 'Current Plan', 'Meal Counts', 'Meal Start Date'];
    const rows = data.map(user => [
      `${user.firstName} ${user.lastName}`, // Name
      user.email, // Email
      user.mobile, // Mobile
      (user.postalAddress || "").replaceAll(",", "-"), // Address
      (user.subscriptions[user.subscriptions.length - 1]?.plan || 'No active plan'), // Current plan
      `Lunch: ${(user.mealCounts.lunchMeals || 0) + (user.mealCounts.nextDayLunchMeals || 0)}, Dinner: ${(user.mealCounts.dinnerMeals || 0) + (user.mealCounts.nextDayDinnerMeals || 0)}`, // Meal Counts
      (user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate || 'N/A') // Meal Start Date
    ]);
  
    // Combine headers and rows into a single string
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
    downloadCSV,
  };
};