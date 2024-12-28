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
      console.log('error processing request', e);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const convertToCSV = (data) => {
    const headers = ['Name', 'Email', 'Mobile', 'Address', 'Meal Counts'];
    const rows = data.map(user => [
      `${user.firstName} ${user.lastName}`, // Name
      user.email, // Email
      user.mobile, // Mobile
      user.postalAddress, // Address
      `Lunch: ${user.mealCounts.lunchMeals || 0}, Dinner: ${user.mealCounts.dinnerMeals || 0}` // Meal Counts
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