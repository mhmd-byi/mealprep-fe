import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadAdminImage } from "../../../utils/imageUpload";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const errorText = (error, fallback) => error?.response?.data?.message || (error?.uploadFailed ? error.message : fallback);

export const uploadProductImage = (file) => uploadAdminImage(file, "product");

export const useAdminProducts = () =>
  useQuery({
    queryKey: ["alacarte", "products"],
    queryFn: async () => (await axios.get(`${base()}admin/products`, auth())).data,
  });

export const useProductCategories = () =>
  useQuery({
    queryKey: ["alacarte", "categories"],
    queryFn: async () => (await axios.get(`${base()}admin/product-categories`, auth())).data,
  });

export const useAdminOrders = (params) =>
  useQuery({
    queryKey: ["alacarte", "orders", params],
    queryFn: async () => (await axios.get(`${base()}admin/alacarte/orders`, { ...auth(), params })).data,
    placeholderData: keepPreviousData,
    refetchInterval: 30 * 1000,
  });

export const useAlacarteSettings = () =>
  useQuery({
    queryKey: ["alacarte", "settings"],
    queryFn: async () => (await axios.get(`${base()}admin/alacarte/settings`, auth())).data,
  });

export const useAlacarteActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["alacarte"] });
  const run = async (request) => {
    const response = await request();
    await refresh();
    return response.data;
  };

  return {
    saveProduct: (id, payload) =>
      run(() => (id ? axios.put(`${base()}admin/products/${id}`, payload, auth()) : axios.post(`${base()}admin/products`, payload, auth()))),
    setProductActive: (id, isActive) => run(() => axios.patch(`${base()}admin/products/${id}/active`, { isActive }, auth())),
    deleteProduct: (id) => run(() => axios.delete(`${base()}admin/products/${id}`, auth())),
    saveCategory: (id, payload) =>
      run(() =>
        id
          ? axios.put(`${base()}admin/product-categories/${id}`, payload, auth())
          : axios.post(`${base()}admin/product-categories`, payload, auth())
      ),
    deleteCategory: (id) => run(() => axios.delete(`${base()}admin/product-categories/${id}`, auth())),
    setOrderStatus: (id, status) => run(() => axios.patch(`${base()}admin/alacarte/orders/${id}/status`, { status }, auth())),
    clearAttention: (id) => run(() => axios.delete(`${base()}admin/alacarte/orders/${id}/attention`, auth())),
    saveSettings: (payload) => run(() => axios.put(`${base()}admin/alacarte/settings`, payload, auth())),
  };
};
