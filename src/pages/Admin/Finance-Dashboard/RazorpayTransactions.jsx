import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { formatINR } from "./format";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const STATUS_STYLES = {
  captured: "bg-green-100 text-green-700",
  refunded: "bg-amber-100 text-amber-700",
  authorized: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const formatDateTime = (isoDate) =>
  new Date(isoDate).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const RazorpayTransactions = ({ startDate, endDate }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}finance/razorpay-transactions`, {
        ...authHeaders(),
        params: { startDate, endDate },
      });
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error("Error fetching Razorpay transactions:", err);
      setError(err.response?.data?.message || err.message);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const interval = setInterval(fetchTransactions, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  if (isLoading && transactions.length === 0) {
    return <p className="text-sm text-gray-500 py-2">Loading transactions...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-500 py-2">Could not load Razorpay transactions: {error}</p>;
  }
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500 py-2">No Razorpay transactions in this range.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap">Date &amp; Time</th>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Plan</th>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Amount</th>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment ID</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((t) => (
            <tr key={t.paymentId}>
              <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
              <td className="px-3 py-2 text-gray-900">{t.customerName || "—"}</td>
              <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{t.plan || "—"}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <span className="font-medium text-gray-900">{formatINR(t.amount)}</span>
                {t.refunded > 0 && (
                  <span className="block text-xs text-amber-700">Refunded {formatINR(t.refunded)}</span>
                )}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status] || "bg-gray-100 text-gray-700"}`}>
                  {t.status}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">{t.paymentId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RazorpayTransactions;
