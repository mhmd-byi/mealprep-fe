import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const EMPTY_FILTER = {
  userIds: [],
  statuses: [],
  plans: [],
  diets: [],
  mealSlots: [],
  carbTypes: [],
  pincodes: [],
  mealsLeft: null,
  endingWithinDays: null,
  joinedWithinDays: null,
};

export const useAudiencePreview = (filter, category) =>
  useQuery({
    queryKey: ["notifications", "preview", filter, category],
    queryFn: async () => (await axios.post(`${base()}admin/notifications/preview`, { filter, category }, auth())).data,
    staleTime: 15 * 1000,
    placeholderData: keepPreviousData,
  });

export const useSentNotifications = (page, limit) =>
  useQuery({
    queryKey: ["notifications", "history", page, limit],
    queryFn: async () => (await axios.get(`${base()}admin/notifications`, { ...auth(), params: { page, limit } })).data,
    placeholderData: keepPreviousData,
    refetchInterval: 20 * 1000,
  });

export const useNotificationDetail = (id) =>
  useQuery({
    queryKey: ["notifications", "detail", id],
    queryFn: async () => (await axios.get(`${base()}admin/notifications/${id}`, auth())).data,
    enabled: Boolean(id),
  });

export const useTemplates = () =>
  useQuery({
    queryKey: ["notifications", "templates"],
    queryFn: async () => (await axios.get(`${base()}admin/notification-templates`, auth())).data,
  });

export const useAutoReminders = () =>
  useQuery({
    queryKey: ["notifications", "auto"],
    queryFn: async () => (await axios.get(`${base()}admin/notification-settings`, auth())).data,
  });

export const useCustomerList = (enabled) =>
  useQuery({
    queryKey: ["notifications", "customers"],
    queryFn: async () => {
      const response = await axios.get(`${base()}user/all`, auth());
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  return {
    send: async (payload) => {
      const response = await axios.post(`${base()}admin/notifications`, payload, auth());
      await refresh();
      return response.data;
    },
    sendTest: async (payload) => (await axios.post(`${base()}admin/notifications/test`, payload, auth())).data.message,
    cancel: async (id) => {
      await axios.post(`${base()}admin/notifications/${id}/cancel`, {}, auth());
      await refresh();
    },
    saveTemplate: async (payload, templateId) => {
      if (templateId) await axios.put(`${base()}admin/notification-templates/${templateId}`, payload, auth());
      else await axios.post(`${base()}admin/notification-templates`, payload, auth());
      await refresh();
    },
    deleteTemplate: async (templateId) => {
      await axios.delete(`${base()}admin/notification-templates/${templateId}`, auth());
      await refresh();
    },
    saveReminder: async (reminder) => {
      const response = await axios.put(`${base()}admin/notification-settings/${reminder.key}`, reminder, auth());
      await refresh();
      return response.data;
    },
  };
};

export const errorText = (error, fallback) => error?.response?.data?.message || fallback;
