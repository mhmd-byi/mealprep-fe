import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const shiftDateString = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const fetchDeliveredMeals = (selectedDate) =>
  axios.get(
    `${process.env.REACT_APP_API_URL}subscription/delivered-meals`,
    { ...authHeaders(), params: { date: selectedDate } }
  );

export const useDeliveredMealLog = () => {
  const [date, setDate] = useState(getTodayDateString());
  const [data, setData] = useState(null);
  // Same day last week — for the trend badges on the stat tiles.
  const [previousData, setPreviousData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLog = useCallback(async (selectedDate) => {
    try {
      setIsLoading(true);
      setError(null);
      const [current, previous] = await Promise.all([
        fetchDeliveredMeals(selectedDate),
        fetchDeliveredMeals(shiftDateString(selectedDate, -7)).catch(() => null),
      ]);
      setData(current.data);
      setPreviousData(previous?.data || null);
    } catch (err) {
      console.error("Error fetching delivered meal log:", err);
      setError(err.response?.data?.message || err.message);
      setData(null);
      setPreviousData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog(date);
  }, [date, fetchLog]);

  return { date, setDate, data, previousData, isLoading, error, todayDateString: getTodayDateString(), refresh: () => fetchLog(date) };
};

export default useDeliveredMealLog;
