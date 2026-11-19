import axios from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { downloadCSV } from "../Finance-Dashboard/exportCsv";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const useCatalogLog = (params) =>
  useQuery({
    queryKey: ["catalog-log", params],
    queryFn: async () => (await axios.get(`${base()}admin/catalog-log`, { ...auth(), params })).data,
    placeholderData: keepPreviousData,
    refetchInterval: 60 * 1000,
  });

export const usePriceHistory = (itemId) =>
  useQuery({
    queryKey: ["catalog-log", "price-history", itemId],
    enabled: Boolean(itemId),
    queryFn: async () => (await axios.get(`${base()}admin/catalog-log`, { ...auth(), params: { itemId, priceOnly: "1", limit: 20 } })).data,
  });

export const exportCatalogLog = async (params) => {
  const response = await axios.get(`${base()}admin/catalog-log/export`, { ...auth(), params, responseType: "blob" });
  const text = await response.data.text();
  downloadCSV(text, `catalogue-log-${new Date().toISOString().slice(0, 10)}.csv`);
};
