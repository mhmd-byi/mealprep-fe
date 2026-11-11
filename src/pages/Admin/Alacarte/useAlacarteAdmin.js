import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

const MAX_SIDE = 1280;
const MAX_BASE64_CHARS = 1.9 * 1024 * 1024;

export const errorText = (error, fallback) => error?.response?.data?.message || fallback;

const fileToJpegBase64 = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.88;
      let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > MAX_BASE64_CHARS && quality > 0.4) {
        quality -= 0.1;
        data = canvas.toDataURL("image/jpeg", quality);
      }
      URL.revokeObjectURL(url);
      resolve(data.split(",")[1]);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image."));
    };
    image.src = url;
  });

export const uploadProductImage = async (file) => {
  const image = await fileToJpegBase64(file);
  const response = await axios.post(
    `${base()}admin/upload-image`,
    { image, contentType: "image/jpeg", folder: "product", name: file.name },
    auth()
  );
  return response.data.url;
};

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
