import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Popup from "../Popup/Popup";
import { VegNonVegIcon } from "../VegNonVegIcon/VegNonVegIcon";
import { PlanBadge } from "../PlanBadge/PlanBadge";
import { CarbTypeBadge } from "../CarbTypeBadge/CarbTypeBadge";
import { MealSlotIcon } from "../MealSlotIcon/MealSlotIcon";
import { formatTastePreference } from "../../../tastePreferences";
import { formatGender, formatProfession } from "../../../profileFields";
import { CalendarDays, CreditCard, Droplets, Utensils, History, Sun, Pencil, Package } from "lucide-react";

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  Queued: "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-red-100 text-red-700",
  "No Plan": "bg-gray-100 text-gray-500",
};

const MEAL_TYPE_LABELS = { veg: "Veg", "non-veg": "Non-Veg", both: "Both (Flexible)" };

const getLatestSub = (user) =>
  user?.subscriptions?.length ? user.subscriptions[user.subscriptions.length - 1] : null;

const getStatus = (user) => {
  const subs = user?.subscriptions || [];
  if (subs.some((s) => s.status === "active")) return "Active";
  if (subs.some((s) => s.status === "queued")) return "Queued";
  const latest = getLatestSub(user);
  if (latest?.status === "cancelled") return "Cancelled";
  if (latest?.status === "completed") return "Completed";
  return "No Plan";
};

const getSubscriptionEndLabel = (sub) => {
  if (sub.status === "completed" || sub.status === "cancelled") {
    return sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : "—";
  }
  if (sub.status === "active") return "Ongoing";
  return "Not started";
};

const DetailRow = ({ label, children }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="font-semibold text-gray-900 break-words">{children}</div>
  </div>
);

const SubscriptionField = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 items-center">
    <Icon className="flex-shrink-0 w-4 h-4 text-gray-500" />
    <span className="flex-shrink-0 w-24 text-sm text-gray-500">{label}</span>
    <div className="text-sm font-semibold text-gray-900">{children}</div>
  </div>
);

const DayBalanceCard = ({ icon: Icon, tone, label, lunch, dinner }) => (
  <div className="flex gap-4 items-center p-4 bg-white rounded-xl border border-gray-200">
    <div className={`flex flex-shrink-0 justify-center items-center w-11 h-11 rounded-full ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="w-20 font-bold text-gray-900">{label}</p>
    <div className="flex flex-1 text-center divide-x divide-gray-200">
      <div className="flex-1 px-4">
        <p className="flex items-center gap-1 text-xs text-gray-500"><MealSlotIcon slot="lunch" />Lunch</p>
        <p className="text-xl font-bold text-theme-color-1">{lunch}</p>
      </div>
      <div className="flex-1 px-4">
        <p className="flex items-center gap-1 text-xs text-gray-500"><MealSlotIcon slot="dinner" />Dinner</p>
        <p className="text-xl font-bold text-orange-600">{dinner}</p>
      </div>
    </div>
  </div>
);

const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });

// Same "User Details" view used on All Registered Users, as a self-contained,
// reusable popup — any page can drop this in with just a userId, no need to
// wire up its own fetch/state for the full customer profile.
export const UserDetailsPopup = ({ userId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingSubId, setCancellingSubId] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}user/${userId}`, authHeaders());
      setUser(response.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error("Failed to load user details.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) fetchUser();
    else setUser(null);
  }, [isOpen, fetchUser]);

  const handleCancelQueuedPlan = async (subId) => {
    if (!window.confirm("Cancel this queued plan?")) return;
    try {
      setCancellingSubId(subId);
      await axios.delete(`${process.env.REACT_APP_API_URL}subscription/queued/${subId}/cancel`, authHeaders());
      toast.success("Queued plan cancelled.");
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel queued plan.");
    } finally {
      setCancellingSubId(null);
    }
  };

  const latestSub = getLatestSub(user);
  const status = getStatus(user);
  const lunchLeft = (user?.mealCounts?.lunchMeals || 0) + (user?.mealCounts?.nextDayLunchMeals || 0);
  const dinnerLeft = (user?.mealCounts?.dinnerMeals || 0) + (user?.mealCounts?.nextDayDinnerMeals || 0);
  const today = { lunch: user?.mealCounts?.lunchMeals || 0, dinner: user?.mealCounts?.dinnerMeals || 0 };
  const upcoming = { lunch: user?.mealCounts?.nextDayLunchMeals || 0, dinner: user?.mealCounts?.nextDayDinnerMeals || 0 };
  const registered = user
    ? (user.createdAt || user.created_date)?.split("T")[0].split("-").reverse().join("-") || "N/A"
    : "";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "";

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      maxWidthClass="max-w-3xl"
      content={
        isLoading && !user ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
          </div>
        ) : (
          user && (
            <div className="space-y-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-shrink-0 justify-center items-center w-14 h-14 text-lg font-bold text-green-800 bg-green-100 rounded-full">
                      {initials}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500">Customer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[status]}`}>
                      {status === "Active" ? "Active User" : "Inactive User"}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">Registered on {registered}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-y-3 gap-x-6 mt-4 sm:grid-cols-2">
                  <DetailRow label="Email">{user.email}</DetailRow>
                  <DetailRow label="Mobile">{user.mobile}</DetailRow>
                  <DetailRow label="Gender">{formatGender(user) || "—"}</DetailRow>
                  <DetailRow label="Profession">{formatProfession(user) || "—"}</DetailRow>
                  <div className="sm:col-span-2">
                    <DetailRow label="Address">{user.postalAddress}</DetailRow>
                  </div>
                </div>
              </div>

              <section>
                <p className="text-base font-bold text-gray-900">Meal Balance</p>
                <p className="mb-3 text-xs text-gray-500">Remaining meal counts across active plans.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="flex items-center gap-1 text-xs font-semibold text-theme-color-1"><MealSlotIcon slot="lunch" />Lunch</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lunchLeft} <span className="text-sm font-medium text-gray-600">meals left</span>
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="flex items-center gap-1 text-xs font-semibold text-orange-700"><MealSlotIcon slot="dinner" />Dinner</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dinnerLeft} <span className="text-sm font-medium text-gray-600">meals left</span>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex gap-3 items-center">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-base font-bold text-gray-900">Subscription</p>
                    <p className="text-xs text-gray-500">Current plan and preferences.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2">
                  <div className="space-y-4">
                    <SubscriptionField icon={Package} label="Plan"><PlanBadge plan={latestSub?.plan} /></SubscriptionField>
                    <SubscriptionField icon={History} label="Status">
                      {latestSub ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            latestSub.status === "active" ? "bg-green-50 text-green-700" :
                            latestSub.status === "queued" ? "bg-amber-50 text-amber-700" :
                            latestSub.status === "cancelled" || latestSub.status === "completed" ? "bg-red-50 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {latestSub.status.charAt(0).toUpperCase() + latestSub.status.slice(1)}
                        </span>
                      ) : "—"}
                    </SubscriptionField>
                    <SubscriptionField icon={CalendarDays} label="Start Date">
                      {latestSub?.subscriptionStartDate
                        ? new Date(latestSub.subscriptionStartDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                        : "N/A"}
                    </SubscriptionField>
                  </div>
                  <div className="space-y-4">
                    <SubscriptionField icon={CalendarDays} label="End Date">
                      {latestSub ? getSubscriptionEndLabel(latestSub) : "—"}
                    </SubscriptionField>
                    <SubscriptionField icon={Utensils} label="Meal Type">
                      <span className="flex gap-2 items-center">
                        {MEAL_TYPE_LABELS[latestSub?.mealType] || "—"}
                        {latestSub && <VegNonVegIcon value={latestSub.mealType} />}
                      </span>
                    </SubscriptionField>
                    <SubscriptionField icon={Droplets} label="Carb Preference">
                      <CarbTypeBadge carbType={latestSub?.carbType} />
                    </SubscriptionField>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex gap-3 items-center">
                  <CalendarDays className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-base font-bold text-gray-900">Meal Balance by Day</p>
                    <p className="text-xs text-gray-500">Today's usage and upcoming meal allocation.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
                  <DayBalanceCard icon={Sun} tone="bg-orange-50 text-orange-500" label="Today" lunch={today.lunch} dinner={today.dinner} />
                  <DayBalanceCard icon={CalendarDays} tone="bg-green-50 text-theme-color-1" label="Upcoming" lunch={upcoming.lunch} dinner={upcoming.dinner} />
                </div>
              </section>

              <section>
                <p className="mb-3 text-base font-bold text-gray-900">Subscription History</p>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                  {user.subscriptions && user.subscriptions.length > 0 ? (
                    [...user.subscriptions].reverse().map((sub, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center">
                          <PlanBadge plan={sub.plan} />
                          {sub.status === "queued" && (
                            <button
                              onClick={() => handleCancelQueuedPlan(sub._id)}
                              disabled={cancellingSubId === sub._id}
                              className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-60"
                            >
                              {cancellingSubId === sub._id ? "Cancelling..." : "Cancel Queued Plan"}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`${
                              sub.status === "active" ? "text-green-600" :
                              sub.status === "queued" ? "text-amber-600" :
                              sub.status === "cancelled" || sub.status === "completed" ? "text-red-600" :
                              "text-gray-600"
                            } font-bold`}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </div>
                          <div><span className="text-gray-500">Start Date:</span> {new Date(sub.subscriptionStartDate).toLocaleDateString()}</div>
                          <div><span className="text-gray-500">End Date:</span> {getSubscriptionEndLabel(sub)}</div>
                          <div>
                            <span className="text-gray-500">Meals:</span>{" "}
                            <span className="inline-flex gap-1.5 items-center align-middle">
                              {sub.mealType?.charAt(0).toUpperCase() + sub.mealType?.slice(1)}
                              <VegNonVegIcon value={sub.mealType} />
                            </span>
                          </div>
                          <div className="flex gap-1.5 items-center"><span className="text-gray-500">Carbs:</span> <CarbTypeBadge carbType={sub.carbType} /></div>
                          {sub.allergy && (
                            <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="font-bold text-red-500">{sub.allergy}</span></div>
                          )}
                          {formatTastePreference(sub) && (
                            <div className="col-span-2"><span className="text-gray-500">Taste:</span> <span className="font-bold text-gray-800">{formatTastePreference(sub)}</span></div>
                          )}
                          <div className="inline-flex items-center gap-1"><MealSlotIcon slot="lunch" /><span className="text-gray-500">Remaining L:</span> {sub.lunchMeals} (Today) + {sub.nextDayLunchMeals} (Next)</div>
                          <div className="inline-flex items-center gap-1"><MealSlotIcon slot="dinner" /><span className="text-gray-500">Remaining D:</span> {sub.dinnerMeals} (Today) + {sub.nextDayDinnerMeals} (Next)</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">No subscription history found.</p>
                  )}
                </div>
              </section>
            </div>
          )
        )
      }
      footerLeft={
        user && (
          <>
            <button
              type="button"
              onClick={() => navigate("/dashboard/manage-subscriptions", { state: { userId: user._id } })}
              className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4" />
              Edit User
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/user-meal-tracking", { state: { user } })}
              className="flex gap-2 items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <History className="w-4 h-4" />
              View Meal History
            </button>
          </>
        )
      }
      buttons={[
        {
          label: "Close",
          onClick: onClose,
          className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        },
      ]}
    />
  );
};

export default UserDetailsPopup;
