import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import Popup from "../../../components/common/Popup/Popup";
import { useManageSubscriptions } from "./useManageSubscriptions";
import {
  PLANS,
  LUNCH_DINNER_OPTIONS,
  MEAL_TYPES,
  CARB_TYPES,
  STATUSES,
  MEAL_COUNT_FIELDS,
} from "./constants";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// end date only exists once a plan stops delivering — updatedAt is when that happened
const getSubscriptionEndLabel = (sub) => {
  if (sub.status === "completed" || sub.status === "cancelled") {
    return sub.updatedAt ? formatDate(sub.updatedAt) : "—";
  }
  if (sub.status === "active") return "Ongoing";
  return "Not started";
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  queued: "bg-amber-100 text-amber-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyCreateForm = {
  plan: "",
  totalMeals: "",
  lunchDinner: "",
  mealType: "",
  carbType: "",
  subscriptionStartDate: "",
  allergy: "",
  paymentId: "",
  reason: "",
};

const emptyNewUserForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  postalAddress: "",
  password: "",
};

const generatePassword = () =>
  Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10);

export const ManageSubscriptions = () => {
  const {
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
  } = useManageSubscriptions();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("subscriptions"); // 'subscriptions' | 'auditLog'

  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState(emptyNewUserForm);
  const [newUserError, setNewUserError] = useState(null);
  const [isSavingNewUser, setIsSavingNewUser] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState(null);
  const [isSavingCreate, setIsSavingCreate] = useState(false);

  const [editingSub, setEditingSub] = useState(null);
  const [editFieldUpdates, setEditFieldUpdates] = useState({});
  const [editMealDeltas, setEditMealDeltas] = useState({});
  const [editReason, setEditReason] = useState("");
  const [editError, setEditError] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredUsers =
    searchQuery.trim().length > 0
      ? allUsers.filter(
          (u) =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const handleSelectUser = async (userId) => {
    setSearchQuery("");
    setActiveTab("subscriptions");
    await selectUser(userId);
  };

  const handleShowAuditLog = () => {
    setActiveTab("auditLog");
    fetchAuditLogs(selectedUser?._id);
  };

  const openNewUserModal = () => {
    setNewUserForm({ ...emptyNewUserForm, password: generatePassword() });
    setNewUserError(null);
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setIsNewUserOpen(true);
  };

  const handleNewUserChange = (field, value) => {
    setNewUserForm((prev) => ({ ...prev, [field]: value }));
    // A changed mobile number needs to be verified again
    if (field === "mobile") {
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handleSendOtp = async () => {
    if (!newUserForm.mobile) {
      setNewUserError("Enter a mobile number first.");
      return;
    }
    try {
      setIsSendingOtp(true);
      setNewUserError(null);
      await sendMobileOtp(newUserForm.mobile, newUserForm.firstName);
      setOtpSent(true);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setNewUserError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setNewUserError("Enter the OTP first.");
      return;
    }
    try {
      setIsVerifyingOtp(true);
      setNewUserError(null);
      await verifyMobileOtp(newUserForm.mobile, otp);
      setOtpVerified(true);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setNewUserError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNewUserSave = async () => {
    const { firstName, lastName, email, mobile, postalAddress, password } = newUserForm;
    if (!firstName || !lastName || !email || !mobile || !postalAddress || !password) {
      setNewUserError("All fields are required.");
      return;
    }
    if (!otpVerified) {
      setNewUserError("Please verify the mobile number with OTP first.");
      return;
    }
    try {
      setIsSavingNewUser(true);
      setNewUserError(null);
      await createUser({ firstName, lastName, email, mobile, postalAddress, password, confirmPassword: password });
      setIsNewUserOpen(false);
      setSearchQuery("");
      setActiveTab("subscriptions");
    } catch (err) {
      console.error("Error creating user:", err);
      setNewUserError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setIsSavingNewUser(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm({ ...emptyCreateForm, subscriptionStartDate: new Date().toISOString().split("T")[0] });
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreateChange = (field, value) =>
    setCreateForm((prev) => ({ ...prev, [field]: value }));

  const handleCreateSave = async () => {
    const { plan, totalMeals, lunchDinner, mealType, carbType, subscriptionStartDate, reason } = createForm;
    if (!plan || !totalMeals || !lunchDinner || !mealType || !carbType || !subscriptionStartDate || !reason.trim()) {
      setCreateError("Plan, total meals, lunch/dinner, meal type, carb type, start date and reason are all required.");
      return;
    }
    const totalMealsNum = Number(totalMeals);
    if (!Number.isFinite(totalMealsNum) || totalMealsNum <= 0) {
      setCreateError("Total meals must be a positive number.");
      return;
    }

    try {
      setIsSavingCreate(true);
      setCreateError(null);
      await createSubscription({
        userId: selectedUser._id,
        plan,
        totalMeals: totalMealsNum,
        lunchDinner,
        mealType,
        carbType,
        subscriptionStartDate,
        allergy: createForm.allergy,
        paymentId: createForm.paymentId,
        reason: createForm.reason,
      });
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Error creating subscription:", err);
      setCreateError(err.response?.data?.message || "Failed to create subscription.");
    } finally {
      setIsSavingCreate(false);
    }
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    setEditFieldUpdates({
      plan: sub.plan,
      carbType: sub.carbType,
      mealType: sub.mealType,
      allergy: sub.allergy || "",
      status: sub.status,
    });
    setEditMealDeltas({ lunchMeals: 0, dinnerMeals: 0, nextDayLunchMeals: 0, nextDayDinnerMeals: 0 });
    setEditReason("");
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingSub(null);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editReason.trim()) {
      setEditError("A reason is required to save this change.");
      return;
    }

    // Only send fields that actually changed
    const fieldUpdates = {};
    Object.keys(editFieldUpdates).forEach((key) => {
      const original = key === "allergy" ? editingSub.allergy || "" : editingSub[key];
      if (editFieldUpdates[key] !== original) {
        fieldUpdates[key] = editFieldUpdates[key];
      }
    });

    const mealDeltas = {};
    Object.keys(editMealDeltas).forEach((key) => {
      const delta = Number(editMealDeltas[key]);
      if (delta) mealDeltas[key] = delta;
    });

    if (Object.keys(fieldUpdates).length === 0 && Object.keys(mealDeltas).length === 0) {
      setEditError("No changes to save — edit a field or a meal count first.");
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError(null);
      await updateSubscription(editingSub._id, { reason: editReason, fieldUpdates, mealDeltas });
      closeEditModal();
    } catch (err) {
      console.error("Error updating subscription:", err);
      setEditError(err.response?.data?.message || "Failed to update subscription.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-start p-4 w-full sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h2 className="text-xl font-bold md:text-2xl">Manage Subscriptions</h2>
                {selectedUser && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("subscriptions")}
                      className={`px-4 py-2 text-sm font-semibold rounded-md border-2 ${
                        activeTab === "subscriptions"
                          ? "bg-theme-color-1 text-white border-theme-color-1"
                          : "bg-white text-theme-color-1 border-theme-color-1"
                      }`}
                    >
                      Subscriptions
                    </button>
                    <button
                      type="button"
                      onClick={handleShowAuditLog}
                      className={`px-4 py-2 text-sm font-semibold rounded-md border-2 ${
                        activeTab === "auditLog"
                          ? "bg-theme-color-1 text-white border-theme-color-1"
                          : "bg-white text-theme-color-1 border-theme-color-1"
                      }`}
                    >
                      Audit Log
                    </button>
                  </div>
                )}
              </div>

              {/* User search */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search a user by name or email to manage their subscriptions..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={openNewUserModal}
                    className="px-4 py-2 text-sm font-semibold bg-white rounded-md border-2 shadow-sm text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white whitespace-nowrap"
                  >
                    + New User
                  </button>
                </div>
                {isLoadingUsers && <p className="text-sm text-gray-500 mt-2">Loading users...</p>}
                {searchQuery.trim().length > 0 && (
                  <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg divide-y">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.slice(0, 20).map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => handleSelectUser(u._id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                        >
                          <span className="font-semibold">{u.firstName} {u.lastName}</span>{" "}
                          <span className="text-sm text-gray-500">{u.email}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-gray-500">No matching users.</p>
                    )}
                  </div>
                )}
              </div>

              {isLoadingUserDetail && <p className="text-gray-500 py-4">Loading user...</p>}

              {selectedUser && !isLoadingUserDetail && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-lg p-4 mb-6 gap-3">
                    <div>
                      <p className="font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email} · {selectedUser.mobile}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={openCreateModal}>+ New Subscription</Button>
                      <button
                        type="button"
                        onClick={clearSelectedUser}
                        className="px-4 py-2 text-sm font-semibold bg-white rounded-md border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        Change User
                      </button>
                    </div>
                  </div>

                  {activeTab === "subscriptions" ? (
                    <div className="overflow-x-auto">
                      {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                        <table className="w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Plan</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Start</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">End</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Meals Left</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Diet</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Carb</th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[...selectedUser.subscriptions].reverse().map((sub) => {
                              const lunchCount = (sub.lunchMeals || 0) + (sub.nextDayLunchMeals || 0);
                              const dinnerCount = (sub.dinnerMeals || 0) + (sub.nextDayDinnerMeals || 0);
                              return (
                                <tr key={sub._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{sub.plan}</td>
                                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[sub.status] || "bg-gray-100 text-gray-700"}`}>
                                      {capitalize(sub.status)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(sub.subscriptionStartDate)}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{getSubscriptionEndLabel(sub)}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">L: {lunchCount}, D: {dinnerCount}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{capitalize(sub.mealType)}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{sub.carbType}</td>
                                  <td className="px-4 py-4 text-sm whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(sub)}
                                      className="text-theme-color-1 hover:underline"
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p className="py-4 text-center text-gray-500">No subscriptions for this user yet.</p>
                      )}
                    </div>
                  ) : (
                    <AuditLogTable logs={auditLogs} isLoading={isLoadingLogs} scopeLabel={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                  )}
                </>
              )}

              {!selectedUser && !isLoadingUserDetail && (
                <p className="py-8 text-center text-gray-500">
                  Search and select a user above to view or manage their subscriptions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New User Modal */}
      <Popup
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        title="New User"
        content={
          <div className="space-y-4">
            {newUserError && <p className="text-sm text-red-600">{newUserError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <Input
                type="text"
                value={newUserForm.firstName}
                onChange={(e) => handleNewUserChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <Input
                type="text"
                value={newUserForm.lastName}
                onChange={(e) => handleNewUserChange("lastName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => handleNewUserChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newUserForm.mobile}
                  onChange={(e) => handleNewUserChange("mobile", e.target.value)}
                />
                {otpVerified ? (
                  <span className="flex items-center px-3 text-xs font-semibold text-green-700 bg-green-100 rounded-md whitespace-nowrap">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                  >
                    {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}
              </div>
              {otpSent && !otpVerified && (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-3 py-1 text-xs font-semibold text-white rounded-md bg-theme-color-1 hover:bg-black whitespace-nowrap"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mobile number must be verified with OTP before the account can be created.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address</label>
              <Input
                type="text"
                value={newUserForm.postalAddress}
                onChange={(e) => handleNewUserChange("postalAddress", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newUserForm.password}
                  onChange={(e) => handleNewUserChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleNewUserChange("password", generatePassword())}
                  className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated — share it with the customer, or they can use "Forgot Password" later.
              </p>
            </div>
          </div>
        }
        buttons={[
          { label: "Cancel", onClick: () => setIsNewUserOpen(false), className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
          { label: isSavingNewUser ? "Creating..." : "Create User", onClick: handleNewUserSave, className: "bg-theme-color-1 text-white hover:bg-black" },
        ]}
      />

      {/* Create Subscription Modal */}
      <Popup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Subscription"
        content={
          <div className="space-y-4">
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <Input
                type="select"
                value={createForm.plan}
                onChange={(e) => handleCreateChange("plan", e.target.value)}
                placeholder="Select plan"
                options={PLANS.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Meals</label>
              <Input
                type="number"
                value={createForm.totalMeals}
                onChange={(e) => handleCreateChange("totalMeals", e.target.value)}
                placeholder="e.g. 6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lunch / Dinner</label>
              <Input
                type="select"
                value={createForm.lunchDinner}
                onChange={(e) => handleCreateChange("lunchDinner", e.target.value)}
                placeholder="Select"
                options={LUNCH_DINNER_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type (Diet)</label>
              <Input
                type="select"
                value={createForm.mealType}
                onChange={(e) => handleCreateChange("mealType", e.target.value)}
                placeholder="Select"
                options={MEAL_TYPES}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carb Type</label>
              <Input
                type="select"
                value={createForm.carbType}
                onChange={(e) => handleCreateChange("carbType", e.target.value)}
                placeholder="Select"
                options={CARB_TYPES}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Start Date</label>
              <Input
                type="date"
                value={createForm.subscriptionStartDate}
                onChange={(e) => handleCreateChange("subscriptionStartDate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergy (optional)</label>
              <Input
                type="text"
                value={createForm.allergy}
                onChange={(e) => handleCreateChange("allergy", e.target.value)}
                placeholder="None"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference (optional)</label>
              <Input
                type="text"
                value={createForm.paymentId}
                onChange={(e) => handleCreateChange("paymentId", e.target.value)}
                placeholder="e.g. offline payment note, UTR, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
              <textarea
                value={createForm.reason}
                onChange={(e) => handleCreateChange("reason", e.target.value)}
                rows={2}
                placeholder="Why is this subscription being created manually?"
                className="block w-full rounded-lg border-0 px-5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 sm:text-sm sm:leading-6"
              />
            </div>
            <p className="text-xs text-gray-500">
              Active-vs-queued is decided automatically, same rule as checkout: this only queues if it shares a
              meal-type track (lunch/dinner) with a plan already active for this user.
            </p>
          </div>
        }
        buttons={[
          { label: "Cancel", onClick: () => setIsCreateOpen(false), className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
          { label: isSavingCreate ? "Saving..." : "Create Subscription", onClick: handleCreateSave, className: "bg-theme-color-1 text-white hover:bg-black" },
        ]}
      />

      {/* Edit Subscription Modal */}
      <Popup
        isOpen={!!editingSub}
        onClose={closeEditModal}
        title="Edit Subscription"
        content={
          editingSub && (
            <div className="space-y-4">
              {editError && <p className="text-sm text-red-600">{editError}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <Input
                  type="select"
                  value={editFieldUpdates.plan || ""}
                  onChange={(e) => setEditFieldUpdates((prev) => ({ ...prev, plan: e.target.value }))}
                  options={PLANS.map((p) => ({ value: p, label: p }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Input
                  type="select"
                  value={editFieldUpdates.status || ""}
                  onChange={(e) => setEditFieldUpdates((prev) => ({ ...prev, status: e.target.value }))}
                  options={STATUSES.map((s) => ({ value: s, label: capitalize(s) }))}
                />
                {editFieldUpdates.status !== editingSub.status &&
                  editingSub.status === "active" &&
                  ["cancelled", "completed"].includes(editFieldUpdates.status) && (
                    <p className="text-xs text-amber-600 mt-1">
                      This will zero out remaining meals; any queued plan for this user activates on the next
                      scheduled run.
                    </p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type (Diet)</label>
                <Input
                  type="select"
                  value={editFieldUpdates.mealType || ""}
                  onChange={(e) => setEditFieldUpdates((prev) => ({ ...prev, mealType: e.target.value }))}
                  options={MEAL_TYPES}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carb Type</label>
                <Input
                  type="select"
                  value={editFieldUpdates.carbType || ""}
                  onChange={(e) => setEditFieldUpdates((prev) => ({ ...prev, carbType: e.target.value }))}
                  options={CARB_TYPES}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergy</label>
                <Input
                  type="text"
                  value={editFieldUpdates.allergy || ""}
                  onChange={(e) => setEditFieldUpdates((prev) => ({ ...prev, allergy: e.target.value }))}
                  placeholder="None"
                />
              </div>

              <hr />

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Adjust Meal Counts (+ to add, - to subtract)</p>
                <div className="grid grid-cols-2 gap-3">
                  {MEAL_COUNT_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {label} (current: {editingSub[key] || 0})
                      </label>
                      <Input
                        type="number"
                        value={editMealDeltas[key]}
                        onChange={(e) =>
                          setEditMealDeltas((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={2}
                  placeholder="Why is this change being made?"
                  className="block w-full rounded-lg border-0 px-5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          )
        }
        buttons={[
          { label: "Cancel", onClick: closeEditModal, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
          { label: isSavingEdit ? "Saving..." : "Save Changes", onClick: handleEditSave, className: "bg-theme-color-1 text-white hover:bg-black" },
        ]}
      />
    </DashboardLayoutComponent>
  );
};

const AuditLogTable = ({ logs, isLoading, scopeLabel }) => {
  if (isLoading) return <p className="text-gray-500 py-4">Loading audit log...</p>;
  if (!logs || logs.length === 0) {
    return <p className="py-4 text-center text-gray-500">No logged actions for {scopeLabel} yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">When</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Admin</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reason</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Changes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log._id} className="align-top">
              <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
              <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{log.adminName}</td>
              <td className="px-4 py-4 text-sm whitespace-nowrap">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {capitalize(log.action)}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">{log.reason}</td>
              <td className="px-4 py-4 text-xs text-gray-500 max-w-sm">
                <FieldDiff before={log.before} after={log.after} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FieldDiff = ({ before, after }) => {
  if (!before) {
    return <span>Created as {after?.status}, {after?.totalMeals} meals ({after?.plan})</span>;
  }
  if (!after) return null;
  const changedKeys = Object.keys(after).filter((key) => JSON.stringify(after[key]) !== JSON.stringify(before[key]));
  if (changedKeys.length === 0) return <span>—</span>;
  return (
    <ul className="space-y-0.5">
      {changedKeys.map((key) => (
        <li key={key}>
          <span className="font-medium">{key}:</span> {String(before[key])} → {String(after[key])}
        </li>
      ))}
    </ul>
  );
};

export default ManageSubscriptions;
