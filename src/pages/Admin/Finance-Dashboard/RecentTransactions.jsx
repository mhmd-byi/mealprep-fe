import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { formatINR } from "./format";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const TYPE_STYLES = {
  Revenue: "text-theme-color-1",
  Expense: "text-red-600",
};

const STATUS_STYLES = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Refunded: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const PREVIEW_LIMIT = 8;
const EXPANDED_LIMIT = 30;

export const RecentTransactions = () => {
  const [limit, setLimit] = useState(PREVIEW_LIMIT);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}finance/recent-transactions`, {
        ...authHeaders(),
        params: { limit },
      });
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error("Error fetching recent transactions:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p className="text-base font-bold text-gray-900">Recent Transactions</p>
        <button
          type="button"
          onClick={() => setLimit((v) => (v === PREVIEW_LIMIT ? EXPANDED_LIMIT : PREVIEW_LIMIT))}
          className="text-sm font-bold text-theme-color-1 hover:underline"
        >
          {limit === PREVIEW_LIMIT ? "View All →" : "View Less"}
        </button>
      </div>
      {isLoading ? (
        <p className="py-10 text-sm text-center text-gray-500">Loading transactions...</p>
      ) : error ? (
        <p className="py-10 text-sm text-center text-red-500">Could not load transactions: {error}</p>
      ) : transactions.length === 0 ? (
        <p className="py-10 text-sm text-center text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Type", "Description", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap ${TYPE_STYLES[t.type] || "text-gray-700"}`}>
                    {t.type}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{t.description}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatINR(t.amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status] || "bg-gray-100 text-gray-700"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
