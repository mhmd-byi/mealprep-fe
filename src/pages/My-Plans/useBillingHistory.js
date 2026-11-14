import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const useBillingHistory = () => {
  const userId = sessionStorage.getItem("userId");
  return useQuery({
    queryKey: ["billing-history", userId],
    enabled: Boolean(userId),
    queryFn: async () => (await axios.get(`${base()}subscription/${userId}/history`, auth())).data,
  });
};

export const invoiceErrorText = async (error) => {
  const body = error?.response?.data;
  if (body instanceof Blob) {
    try {
      return JSON.parse(await body.text()).message || "Could not download this invoice.";
    } catch (parseError) {
      return "Could not download this invoice.";
    }
  }
  return body?.message || "Could not download this invoice.";
};

export const downloadInvoice = async (subscription) => {
  const response = await axios.get(`${base()}subscription/${subscription._id}/invoice`, { ...auth(), responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${subscription.invoiceNumber || "Mealprep-invoice"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};
