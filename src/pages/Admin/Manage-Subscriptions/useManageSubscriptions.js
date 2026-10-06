import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { notifyUsersChanged } from "../../../utils/crossTabSync";
import { sendEmail } from "../../../utils";
import { getActiveEmailTemplate, getQueuedEmailTemplate } from "../../../emailTemplates";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
});

// Same admin address every other subscription/reminder notification in this
// app already goes to (Plans/useSubscription.js, reminderJobs.js).
const ADMIN_NOTIFICATION_EMAIL = "ermoinzafarsheikh@hotmail.com";

export const useManageSubscriptions = () => {
  const queryClient = useQueryClient();
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
    queryClient.invalidateQueries({ queryKey: ['users'] });
    notifyUsersChanged();
    return newUserId;
  };

  const createSubscription = async (payload) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}admin/subscriptions`,
      payload,
      authHeaders()
    );
    await refreshSelectedUser();
    await fetchAllUsers();
    queryClient.invalidateQueries({ queryKey: ['users'] });
    notifyUsersChanged();

    const createdSub = response.data;
    const userName = `${selectedUser?.firstName || ""} ${selectedUser?.lastName || ""}`.trim() || "Customer";
    const userEmail = selectedUser?.email || "";
    const isQueued = createdSub.status === "queued";
    const adminNoticeBody = `A new subscription has been added manually by an admin!\n\n` +
      `--- CUSTOMER DETAILS ---\n` +
      `Name: ${userName}\nEmail: ${userEmail}\nUser ID: ${payload.userId}\n\n` +
      `--- SUBSCRIPTION DETAILS ---\n` +
      `Plan: ${payload.plan}\nMeals Total: ${payload.totalMeals}\nMeal Type: ${payload.mealType}\n` +
      `Carb Type: ${payload.carbType}\nPreference: ${payload.lunchDinner}\nStart Date: ${payload.subscriptionStartDate}\n` +
      `Allergy Info: ${payload.allergy || "None"}\nPayment Method: ${payload.paymentMethod || "Not recorded"}\n` +
      `Reason: ${payload.reason}\n\n` +
      `${isQueued ? "This plan is QUEUED and will activate when the user's current plan runs out." : "This plan is ACTIVE."}`;

    // Fire-and-forget — an email hiccup shouldn't fail the subscription that
    // already saved successfully, same as the customer purchase flow.
    if (isQueued) {
      const queuedTpl = getQueuedEmailTemplate(payload.plan, userName);
      sendEmail(payload.userId, "", queuedTpl.subject, queuedTpl.text).catch((e) => console.error("Error sending customer email:", e));
      sendEmail(ADMIN_NOTIFICATION_EMAIL, "Admin", `Queued Subscription: ${userName}`, adminNoticeBody).catch((e) => console.error("Error sending admin email:", e));
    } else {
      const activeTpl = getActiveEmailTemplate(payload.plan, userName);
      sendEmail(payload.userId, "", activeTpl.subject, activeTpl.text).catch((e) => console.error("Error sending customer email:", e));
      sendEmail(ADMIN_NOTIFICATION_EMAIL, "Admin", `New Subscription: ${userName}`, adminNoticeBody).catch((e) => console.error("Error sending admin email:", e));
    }
  };

  const updateSubscription = async (subscriptionId, payload) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}admin/subscriptions/${subscriptionId}`,
      payload,
      authHeaders()
    );
    await refreshSelectedUser();
    await fetchAllUsers();
    queryClient.invalidateQueries({ queryKey: ['users'] });
    notifyUsersChanged();
  };

  const closeAccount = async (userId, reason) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}admin/users/${userId}/close-account`,
      { reason },
      authHeaders()
    );
    await refreshSelectedUser();
    await fetchAllUsers();
    queryClient.invalidateQueries({ queryKey: ['users'] });
    notifyUsersChanged();
    return response.data;
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
    closeAccount,
  };
};

export default useManageSubscriptions;
