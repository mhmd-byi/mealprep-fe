import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

const pad2 = (n) => String(n).padStart(2, "0");

export const useAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = pad2(today.getMonth() + 1);
    return {
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-${pad2(today.getDate())}`,
      action: "",
    };
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = { page: currentPage, limit: rowsPerPage };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.action) params.action = filters.action;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/subscriptions/audit-logs`,
        { ...authHeaders(), params }
      );
      setLogs(response.data.logs || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err.response?.data?.message || err.message);
      setLogs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const applyFilters = (next) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = pad2(today.getMonth() + 1);
    setFilters({
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-${pad2(today.getDate())}`,
      action: "",
    });
    setCurrentPage(1);
  };

  return {
    logs,
    total,
    isLoading,
    error,
    filters,
    applyFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    refresh: fetchLogs,
  };
};

export default useAuditLog;
