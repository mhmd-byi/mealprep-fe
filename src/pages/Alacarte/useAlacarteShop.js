import axios from "axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const base = () => process.env.REACT_APP_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

export const SHOP_KEY = "alacarte-shop";

export const errorText = (error, fallback) => error?.response?.data?.message || fallback;

export const usePublicProducts = () =>
  useQuery({
    queryKey: [SHOP_KEY, "products"],
    queryFn: async () => (await axios.get(`${base()}public/products`)).data,
    staleTime: 30 * 1000,
  });

export const useShopConfig = () =>
  useQuery({
    queryKey: [SHOP_KEY, "config"],
    queryFn: async () => (await axios.get(`${base()}alacarte/config`, auth())).data,
  });

export const useQuote = (items) =>
  useQuery({
    queryKey: [SHOP_KEY, "quote", JSON.stringify(items)],
    queryFn: async () => (await axios.post(`${base()}alacarte/quote`, { items }, auth())).data,
    enabled: items.length > 0,
    retry: false,
    placeholderData: keepPreviousData,
  });

export const useMyOrders = () =>
  useQuery({
    queryKey: [SHOP_KEY, "orders"],
    queryFn: async () => (await axios.get(`${base()}alacarte/orders`, auth())).data,
    refetchInterval: 60 * 1000,
  });

export const startPayment = async (payload, customer) => {
  if (!window.Razorpay) throw new Error("Online payment is not available right now. Please refresh the page and try again.");

  const { data } = await axios.post(`${base()}alacarte/orders`, payload, auth());

  return new Promise((resolve) => {
    let verifying = false;
    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Meal Prep",
      description: `À la carte order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        verifying = true;
        try {
          const verified = await axios.post(
            `${base()}alacarte/orders/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            auth()
          );
          resolve({ outcome: "paid", order: verified.data });
        } catch (error) {
          resolve({ outcome: "unconfirmed", orderNumber: data.orderNumber });
        }
      },
      prefill: customer,
      theme: { color: "#3C9B62" },
      modal: {
        ondismiss: () => {
          if (!verifying) resolve({ outcome: "dismissed" });
        },
      },
    });
    checkout.open();
  });
};
