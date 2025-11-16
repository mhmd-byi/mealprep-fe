import { useState, useEffect } from "react";
import axios from "axios";

export const useUserMealTracking = () => {
  const [activityRecords, setActivityRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const token = sessionStorage.getItem("token");

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setIsFetchingUsers(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setAllUsers(response.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const filterUsers = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return allUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const firstName = user.firstName.toLowerCase();
      const lastName = user.lastName.toLowerCase();
      const email = user.email.toLowerCase();
      
      return (
        fullName.includes(lowerSearchTerm) ||
        firstName.includes(lowerSearchTerm) ||
        lastName.includes(lowerSearchTerm) ||
        email.includes(lowerSearchTerm)
      );
    });
  };

  const searchUserMealTracking = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);
      setActivityRecords([]);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}activity/get-activities?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setActivityRecords(response.data);
      } else {
        setActivityRecords([]);
      }
    } catch (err) {
      console.error("Error fetching user meal tracking:", err);
      setError(
        err.response?.data?.message || 
        "Failed to fetch meal tracking data. Please try again."
      );
      setActivityRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setActivityRecords([]);
    setError(null);
  };

  return {
    activityRecords,
    isLoading,
    error,
    searchUserMealTracking,
    filterUsers,
    allUsers,
    isFetchingUsers,
    resetSearch,
  };
};
