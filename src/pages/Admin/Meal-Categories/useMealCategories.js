import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useMealCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}meal-categories`, authHeaders());
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching meal categories:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name, color) => {
    await axios.post(`${process.env.REACT_APP_API_URL}meal-categories`, { name, color }, authHeaders());
    await fetchCategories();
  };

  const editCategory = async (categoryId, payload) => {
    await axios.put(`${process.env.REACT_APP_API_URL}meal-categories/${categoryId}`, payload, authHeaders());
    await fetchCategories();
  };

  const removeCategory = async (categoryId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}meal-categories/${categoryId}`, authHeaders());
    await fetchCategories();
  };

  return { categories, isLoading, addCategory, editCategory, removeCategory, refetch: fetchCategories };
};
