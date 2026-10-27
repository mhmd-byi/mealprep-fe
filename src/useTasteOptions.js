import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TASTE_OPTIONS_KEY = ["taste-options"];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useTasteOptions = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: TASTE_OPTIONS_KEY,
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}taste-options`, authHeaders());
      return response.data;
    },
    staleTime: 60 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: TASTE_OPTIONS_KEY });

  const addOption = async (group, label) => {
    await axios.post(`${process.env.REACT_APP_API_URL}taste-options`, { group, label }, authHeaders());
    await refresh();
  };

  const editOption = async (optionId, label) => {
    await axios.put(`${process.env.REACT_APP_API_URL}taste-options/${optionId}`, { label }, authHeaders());
    await refresh();
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const removeOption = async (optionId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}taste-options/${optionId}`, authHeaders());
    await refresh();
  };

  return {
    spiceOptions: data?.spice || [],
    flavourOptions: data?.flavour || [],
    isLoading,
    addOption,
    editOption,
    removeOption,
  };
};
