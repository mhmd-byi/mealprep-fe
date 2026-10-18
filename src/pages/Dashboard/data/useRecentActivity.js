import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useRecentActivity = (hours = 24) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const fetchActivities = useCallback(async () => {
    const isFirstLoad = !hasLoadedOnce.current;
    // Only the very first load should show a loading state — a background
    // refresh (every 60s below) swaps the data in place once it arrives,
    // instead of hiding and re-showing the whole widget every minute.
    if (isFirstLoad) setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}activity/recent`, {
        ...authHeaders(),
        params: { hours },
      });
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      // A background refresh failing shouldn't wipe out the last known-good
      // list — only clear it if this was the first load and there's nothing
      // to fall back to.
      if (isFirstLoad) setActivities([]);
    } finally {
      hasLoadedOnce.current = true;
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
