import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useRecentActivity = (hours = 24) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}activity/recent`, {
        ...authHeaders(),
        params: { hours },
      });
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // This widget is meant to feel live on a dashboard that may be left open all day.
  useEffect(() => {
    const interval = setInterval(fetchActivities, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return { activities, isLoading, refresh: fetchActivities };
};
