import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const errorText = (error, fallback) => error?.response?.data?.message || (error?.uploadFailed ? error.message : fallback);

export const useAdminPlans = () =>
  useQuery({
    queryKey: ["plans", "admin"],
    queryFn: async () => (await axios.get(`${base()}admin/plans`, auth())).data,
  });

export const usePlanActions = () => {
  const queryClient = useQueryClient();
  const run = async (request) => {
    const response = await request();
    await queryClient.invalidateQueries({ queryKey: ["plans"] });
    return response.data;
  };

  return {
    setupPlans: () => run(() => axios.post(`${base()}admin/plans/setup`, {}, auth())),
    savePlan: (id, payload) =>
      run(() => (id ? axios.put(`${base()}admin/plans/${id}`, payload, auth()) : axios.post(`${base()}admin/plans`, payload, auth()))),
    setPlanActive: (id, isActive) => run(() => axios.patch(`${base()}admin/plans/${id}/active`, { isActive }, auth())),
    deletePlan: (id) => run(() => axios.delete(`${base()}admin/plans/${id}`, auth())),
  };
};
