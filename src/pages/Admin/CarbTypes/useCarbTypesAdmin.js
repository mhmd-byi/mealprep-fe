import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const errorText = (error, fallback) => error?.response?.data?.message || fallback;

export const useAdminCarbTypes = () =>
  useQuery({
    queryKey: ["carb-types", "admin"],
    queryFn: async () => (await axios.get(`${base()}admin/carb-types`, auth())).data,
  });

export const useCarbTypeActions = () => {
  const queryClient = useQueryClient();
  const run = async (request) => {
    const response = await request();
    await queryClient.invalidateQueries({ queryKey: ["carb-types"] });
    return response.data;
  };

  return {
    setupCarbTypes: () => run(() => axios.post(`${base()}admin/carb-types/setup`, {}, auth())),
    saveCarbType: (id, payload) =>
      run(() => (id ? axios.put(`${base()}admin/carb-types/${id}`, payload, auth()) : axios.post(`${base()}admin/carb-types`, payload, auth()))),
    setCarbTypeActive: (id, isActive) => run(() => axios.patch(`${base()}admin/carb-types/${id}/active`, { isActive }, auth())),
    deleteCarbType: (id) => run(() => axios.delete(`${base()}admin/carb-types/${id}`, auth())),
  };
};
