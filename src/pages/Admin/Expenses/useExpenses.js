import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", category: "", search: "" });

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}expense/get-expenses`,
        { ...authHeaders(), params }
      );
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.response?.data?.message || err.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}expense/summary`,
        authHeaders()
      );
      setSummary(response.data);
    } catch (err) {
      console.error("Error fetching expense summary:", err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refreshAll = () => {
    fetchExpenses();
    fetchSummary();
  };

  const addExpense = async (payload) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}expense/add-expense`,
      payload,
      authHeaders()
    );
    refreshAll();
  };

  const editExpense = async (expenseId, payload) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}expense/update-expense/${expenseId}`,
      payload,
      authHeaders()
    );
    refreshAll();
  };

  const removeExpense = async (expenseId) => {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}expense/delete-expense/${expenseId}`,
      authHeaders()
    );
    refreshAll();
  };

  return {
    expenses,
    summary,
    isLoading,
    error,
    filters,
    setFilters,
    addExpense,
    editExpense,
    removeExpense,
  };
};

export default useExpenses;
