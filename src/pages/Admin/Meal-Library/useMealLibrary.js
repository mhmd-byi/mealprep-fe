import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useMealLibrary = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}meal-library`, authHeaders());
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching meal library items:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}meal-categories`, authHeaders());
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching meal categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const createItem = async (payload) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}meal-library`, payload, authHeaders());
    await fetchItems();
    return response.data;
  };

  const updateItem = async (itemId, payload) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}meal-library/${itemId}`, payload, authHeaders());
    await fetchItems();
    return response.data;
  };

  const removeItem = async (itemId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}meal-library/${itemId}`, authHeaders());
    await fetchItems();
  };

  return { items, categories, isLoading, createItem, updateItem, removeItem, refetchItems: fetchItems, refetchCategories: fetchCategories };
};
