import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { notifyUsersChanged } from "../../../utils/crossTabSync";

export const useUserMealTracking = () => {
  const [activityRecords, setActivityRecords] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const token = sessionStorage.getItem("token");

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    fetchAllUsers();
    fetchHolidays();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setIsFetchingUsers(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}user`, authHeaders());
      if (response.data.users && Array.isArray(response.data.users)) {
        setAllUsers(response.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}holiday/get-holidays`, authHeaders());
      setHolidays(response.data.holidays || []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
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

  const fetchUserDetail = async (userId) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}user/${userId}`, authHeaders());
    setUserDetail(response.data);
  };

  const searchUserMealTracking = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);
      setActivityRecords([]);
      setUserDetail(null);
      setCurrentUserId(userId);

      const [activityResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}activity/get-activities?userId=${userId}`, authHeaders()),
        fetchUserDetail(userId),
      ]);

      setActivityRecords(Array.isArray(activityResponse.data) ? activityResponse.data : []);
    } catch (err) {
      console.error("Error fetching user meal tracking:", err);
      setError(err.response?.data?.message || "Failed to fetch meal tracking data. Please try again.");
      setActivityRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelQueuedPlan = useCallback(
    async (subscriptionId) => {
      await axios({
        method: "DELETE",
        url: `${process.env.REACT_APP_API_URL}subscription/queued/${subscriptionId}/cancel`,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (currentUserId) await fetchUserDetail(currentUserId);
      notifyUsersChanged();
    },
    [currentUserId, token]
  );

  const resetSearch = () => {
    setActivityRecords([]);
    setUserDetail(null);
    setCurrentUserId(null);
    setError(null);
  };

  return {
    activityRecords,
    userDetail,
    isLoading,
    error,
    searchUserMealTracking,
    filterUsers,
    allUsers,
    isFetchingUsers,
    holidays,
    cancelQueuedPlan,
    resetSearch,
  };
};
