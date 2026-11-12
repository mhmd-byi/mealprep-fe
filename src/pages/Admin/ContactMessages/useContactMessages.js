import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const errorText = (error, fallback) => error?.response?.data?.message || fallback;

export const useContactMessages = (params) =>
  useQuery({
    queryKey: ["contact-messages", "list", params],
    queryFn: async () => (await axios.get(`${base()}admin/contact-messages`, { ...auth(), params })).data,
    placeholderData: keepPreviousData,
    refetchInterval: 60 * 1000,
  });

export const useContactMessageActions = () => {
  const queryClient = useQueryClient();
  const run = async (request) => {
    const response = await request();
    await queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    return response.data;
  };

  return {
    updateMessage: (id, payload) => run(() => axios.patch(`${base()}admin/contact-messages/${id}`, payload, auth())),
    deleteMessage: (id) => run(() => axios.delete(`${base()}admin/contact-messages/${id}`, auth())),
  };
};
