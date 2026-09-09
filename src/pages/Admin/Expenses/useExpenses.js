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
  const [filters, setFilters] = useState({ startDate: "", endDate: "", category: "", subcategory: "", search: "" });

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;
      if (filters.subcategory) params.subcategory = filters.subcategory;
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

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}expense-categories`,
        authHeaders()
      );
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching expense categories:", err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refreshAll = () => {
    fetchExpenses();
    fetchSummary();
  };

  const refreshCategories = () => {
    fetchCategories();
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

  const addCategory = async (name, color) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}expense-categories`,
      { name, color },
      authHeaders()
    );
    refreshCategories();
  };

  const editCategory = async (categoryId, payload) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}expense-categories/${categoryId}`,
      payload,
      authHeaders()
    );
    refreshCategories();
  };

  const removeCategory = async (categoryId) => {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}expense-categories/${categoryId}`,
      authHeaders()
    );
    refreshCategories();
  };

  const addSubcategory = async (categoryId, name) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}expense-categories/${categoryId}/subcategories`,
      { name },
      authHeaders()
    );
    refreshCategories();
  };

  const editSubcategory = async (categoryId, subcategoryId, name) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}expense-categories/${categoryId}/subcategories/${subcategoryId}`,
      { name },
      authHeaders()
    );
    refreshCategories();
  };

  const removeSubcategory = async (categoryId, subcategoryId) => {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}expense-categories/${categoryId}/subcategories/${subcategoryId}`,
      authHeaders()
    );
    refreshCategories();
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
    categories,
    isLoadingCategories,
    addCategory,
    editCategory,
    removeCategory,
    addSubcategory,
    editSubcategory,
    removeSubcategory,
  };
};

export default useExpenses;
