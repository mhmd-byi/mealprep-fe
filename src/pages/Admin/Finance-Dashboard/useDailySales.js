import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const pad2 = (n) => String(n).padStart(2, "0");

export const useDailySales = () => {
  const [days, setDays] = useState([]);
  const [totals, setTotals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}`;
  });

  const fetchDailySales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [year, monthNum] = month.split("-").map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${pad2(lastDay)}`;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}finance/daily-sales`,
        { ...authHeaders(), params: { startDate, endDate } }
      );
      setDays(response.data.days || []);
      setTotals(response.data.totals || null);
    } catch (err) {
      console.error("Error fetching daily sales:", err);
      setError(err.response?.data?.message || err.message);
      setDays([]);
      setTotals(null);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  return { days, totals, isLoading, error, month, setMonth, refresh: fetchDailySales };
};

export default useDailySales;
