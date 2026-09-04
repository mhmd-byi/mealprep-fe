import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

export const useManageSubscriptions = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/all`,
        authHeaders()
      );
      setAllUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const selectUser = useCallback(async (userId) => {
    try {
      setIsLoadingUserDetail(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}user/${userId}`,
        authHeaders()
      );
      setSelectedUser(response.data);
    } catch (err) {
      console.error("Error fetching user detail:", err);
    } finally {
      setIsLoadingUserDetail(false);
    }
  }, []);

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setAuditLogs([]);
  };

  const refreshSelectedUser = useCallback(async () => {
    if (selectedUser?._id) {
      await selectUser(selectedUser._id);
    }
  }, [selectedUser?._id, selectUser]);

  const fetchAuditLogs = useCallback(async (userId) => {
    try {
      setIsLoadingLogs(true);
      const params = userId ? { userId } : {};
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}admin/subscriptions/audit-logs`,
        { ...authHeaders(), params }
      );
      setAuditLogs(response.data.logs || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setAuditLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  // Same OTP mechanism the public Signup page uses to verify a mobile number
  // before account creation.
  const sendMobileOtp = (mobile, name) =>
    axios.post(`${process.env.REACT_APP_API_URL}activity/send-otp`, {
      mobileNumber: mobile,
      name,
    });

  const verifyMobileOtp = (mobile, otp) =>
    axios.post(`${process.env.REACT_APP_API_URL}activity/verify-otp`, {
      mobile,
      otp,
    });

  // Reuses the same account-creation endpoint the public Signup page calls.
  // Selects the new user afterward so a subscription can be added right away.
  const createUser = async (payload) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}user`,
      payload
    );
    const newUserId = response.data.user._id;
    await fetchAllUsers();
    await selectUser(newUserId);
    return newUserId;
  };

  const createSubscription = async (payload) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}admin/subscriptions`,
      payload,
      authHeaders()
    );
    await refreshSelectedUser();
    await fetchAllUsers();
  };

  const updateSubscription = async (subscriptionId, payload) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}admin/subscriptions/${subscriptionId}`,
      payload,
      authHeaders()
    );
    await refreshSelectedUser();
    await fetchAllUsers();
  };

  return {
    allUsers,
    isLoadingUsers,
    selectedUser,
    isLoadingUserDetail,
    selectUser,
    clearSelectedUser,
    auditLogs,
    isLoadingLogs,
    fetchAuditLogs,
    sendMobileOtp,
    verifyMobileOtp,
    createUser,
    createSubscription,
    updateSubscription,
  };
};

export default useManageSubscriptions;
