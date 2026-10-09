import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useMealTracking = () => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const [activityRecords, setActivityRecords] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [activityRes, userRes, holidaysRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}activity/get-activities?userId=${userId}`, authHeaders()),
        axios.get(`${process.env.REACT_APP_API_URL}user/${userId}`, authHeaders()),
        axios.get(`${process.env.REACT_APP_API_URL}holiday/get-holidays`, authHeaders()),
      ]);
      setActivityRecords(Array.isArray(activityRes.data) ? activityRes.data : []);
      setUserDetail(userRes.data);
      setHolidays(holidaysRes.data.holidays || []);
    } catch (err) {
      console.error("Error fetching meal tracking data:", err);
      setError(err.response?.data?.message || "Failed to load your meal tracking data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activityRecords, userDetail, holidays, isLoading, error, refresh: fetchAll };
};

export default useMealTracking;
