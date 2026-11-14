import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useMealSchedule = (enabled) => {
  const [days, setDays] = useState([]);
  const [applicable, setApplicable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const fetchSchedule = useCallback(async () => {
    if (!enabled || !userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}subscription/${userId}/meal-schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplicable(response.data.applicable);
      setDays(response.data.days || []);
    } catch (err) {
      console.error("Error fetching meal schedule:", err);
      setError(err.response?.data?.message || "Failed to load meal schedule.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled, userId, token]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const updatePreference = async (date, mealSlot, preference) => {
    const key = `${date}_${mealSlot}`;
    const previousDays = days;

    // Optimistic update
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, [mealSlot]: preference } : d))
    );
    setSavingKey(key);
    setError(null);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}subscription/meal-schedule`,
        { userId, date, mealSlot, preference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error updating meal schedule:", err);
      setError(err.response?.data?.message || "Failed to update preference.");
      setDays(previousDays); // roll back on failure
    } finally {
      setSavingKey(null);
    }
  };

  return { days, applicable, isLoading, error, savingKey, updatePreference };
};

export default useMealSchedule;
