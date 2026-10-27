import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PROFESSION_OPTIONS_KEY = ["profession-options"];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useProfessionOptions = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: PROFESSION_OPTIONS_KEY,
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}profession-options`);
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: PROFESSION_OPTIONS_KEY });

  const addOption = async (label) => {
    await axios.post(`${process.env.REACT_APP_API_URL}profession-options`, { label }, authHeaders());
    await refresh();
  };

  const editOption = async (optionId, label) => {
    await axios.put(`${process.env.REACT_APP_API_URL}profession-options/${optionId}`, { label }, authHeaders());
    await refresh();
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const removeOption = async (optionId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}profession-options/${optionId}`, authHeaders());
    await refresh();
  };

  return {
    professionOptions: Array.isArray(data) ? data : [],
    isLoading,
    addOption,
    editOption,
    removeOption,
  };
};
