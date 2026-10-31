import axios from "axios";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

const REFRESH_INTERVAL = 60 * 1000;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const compactParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null && value !== false));

export const searchNoteCustomers = async (search) => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}notes/customers`, {
    ...authHeaders(),
    params: { search },
  });
  return response.data;
};

export const useNoteCategories = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["note-categories"],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}note-categories`, authHeaders());
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 30 * 1000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["note-categories"] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["notes-overview"] });
  };

  const addCategory = async (payload) => {
    await axios.post(`${process.env.REACT_APP_API_URL}note-categories`, payload, authHeaders());
    refresh();
  };

  const editCategory = async (categoryId, payload) => {
    await axios.put(`${process.env.REACT_APP_API_URL}note-categories/${categoryId}`, payload, authHeaders());
    refresh();
  };

  const removeCategory = async (categoryId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}note-categories/${categoryId}`, authHeaders());
    refresh();
  };

  return { categories: data || [], isLoading, addCategory, editCategory, removeCategory };
};

export const useNotesList = (params) =>
  useQuery({
    queryKey: ["notes", params],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}notes`, {
        ...authHeaders(),
        params: compactParams(params),
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_INTERVAL,
  });

export const useNotesOverview = (quick) =>
  useQuery({
    queryKey: ["notes-overview", quick],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}notes/overview`, {
        ...authHeaders(),
        params: compactParams({ quick }),
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_INTERVAL,
  });

export const useNoteActions = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["notes-overview"] });
  };

  const createNote = async (payload) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}notes`, payload, authHeaders());
    refresh();
    return response.data;
  };

  const updateNote = async (noteId, payload) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}notes/${noteId}`, payload, authHeaders());
    refresh();
    return response.data;
  };

  const setNoteDone = async (noteId, isDone) => {
    const response = await axios.patch(`${process.env.REACT_APP_API_URL}notes/${noteId}/done`, { isDone }, authHeaders());
    refresh();
    return response.data;
  };

  const deleteNote = async (noteId) => {
    const response = await axios.delete(`${process.env.REACT_APP_API_URL}notes/${noteId}`, authHeaders());
    refresh();
    return response.data;
  };

  return { createNote, updateNote, setNoteDone, deleteNote };
};
