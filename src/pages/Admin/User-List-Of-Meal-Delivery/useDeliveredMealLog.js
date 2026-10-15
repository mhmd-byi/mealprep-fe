import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const getTodayDateString = () => new Date().toISOString().split("T")[0];

export const useDeliveredMealLog = () => {
  const [date, setDate] = useState(getTodayDateString());
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLog = useCallback(async (selectedDate) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/delivered-meals`,
        { ...authHeaders(), params: { date: selectedDate } }
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching delivered meal log:", err);
      setError(err.response?.data?.message || err.message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog(date);
  }, [date, fetchLog]);

  return { date, setDate, data, isLoading, error, todayDateString: getTodayDateString(), refresh: () => fetchLog(date) };
};

export default useDeliveredMealLog;
