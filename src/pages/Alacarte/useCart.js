import { useEffect, useState } from "react";

export const MAX_QUANTITY = 20;

const storageKey = () => `alacarte-cart-${sessionStorage.getItem("userId") || "guest"}`;

const readCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) => entry && typeof entry.productId === "string" && Number.isInteger(entry.quantity) && entry.quantity > 0 && entry.quantity <= MAX_QUANTITY
    );
  } catch (error) {
    return [];
  }
};

export const useCart = () => {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(items));
    } catch (error) {
      return;
    }
  }, [items]);

  const quantityOf = (productId) => items.find((entry) => entry.productId === productId)?.quantity || 0;

  const setQuantity = (productId, quantity) => {
    const next = Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity) || 0));
    setItems((current) => {
      const without = current.filter((entry) => entry.productId !== productId);
      return next > 0 ? [...without, { productId, quantity: next }] : without;
    });
  };

  const clear = () => setItems([]);

  return { items, quantityOf, setQuantity, clear };
};
