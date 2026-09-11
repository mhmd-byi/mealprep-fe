import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const DAY_PRESETS = { "1w": 7, "2w": 14, "1mo": 30 };
const MONTH_PRESETS = { "3mo": 3, "6mo": 6, "12mo": 12, "24mo": 24 };

export const PRESET_OPTIONS = [
  { key: "1w", label: "1wk" },
  { key: "2w", label: "2wk" },
  { key: "1mo", label: "1mo" },
  { key: "3mo", label: "3mo" },
  { key: "6mo", label: "6mo" },
  { key: "12mo", label: "12mo" },
  { key: "24mo", label: "24mo" },
];

// "1wk/2wk/1mo" are rolling day-count windows ending today; "3mo" and up stay
// calendar-month-aligned (matches the dashboard's original behavior).
const computePresetRange = (preset) => {
  const today = new Date();
  if (DAY_PRESETS[preset]) {
    const start = new Date(today);
    start.setDate(start.getDate() - (DAY_PRESETS[preset] - 1));
    return { startDate: toDateStr(start), endDate: toDateStr(today) };
  }
  const months = MONTH_PRESETS[preset] || 12;
  const start = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);
  return { startDate: toDateStr(start), endDate: toDateStr(today) };
};

export const useFinanceDashboard = () => {
  const [preset, setPreset] = useState("12mo");
  const [customRange, setCustomRange] = useState(null); // { startDate, endDate } | null
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeRange = useMemo(() => customRange || computePresetRange(preset), [preset, customRange]);

  const selectPreset = (key) => {
    setCustomRange(null);
    setPreset(key);
  };

  const applyCustomRange = (startDate, endDate) => {
    setCustomRange({ startDate, endDate });
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}finance/dashboard`, {
        ...authHeaders(),
        params: activeRange,
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching finance dashboard:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeRange]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    preset,
    customRange,
    activeRange,
    selectPreset,
    applyCustomRange,
    data,
    isLoading,
    error,
  };
};

export default useFinanceDashboard;
