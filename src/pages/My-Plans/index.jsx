import { useState } from "react";
import { toast } from "sonner";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { useCarbLookup } from "../../carbTypes";
import { formatTastePreference } from "../../tastePreferences";
import { subscriptionEndLabel } from "../../subscriptionUtils";
import { downloadInvoice, invoiceErrorText, useBillingHistory } from "./useBillingHistory";
import { CreditCard, Clock, Download, History, Info, Loader2, Moon, Sun } from "lucide-react";

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const STATUS_BADGES = {
  active: { label: "Active", style: "bg-green-100 text-green-700" },
  queued: { label: "Queued", style: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", style: "bg-gray-100 text-gray-700" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-700" },
};

const MEAL_TYPE_LABELS = { veg: "Veg", "non-veg": "Non-veg", both: "Veg & non-veg" };

const InvoiceButton = ({ subscription }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (subscription.refunded) return <span className="text-xs font-semibold text-red-600">Refunded</span>;
  if (!subscription.invoiceAvailable) return <span className="text-xs text-gray-400">—</span>;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadInvoice(subscription);
    } catch (error) {
      toast.error(await invoiceErrorText(error));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      title={`Download invoice ${subscription.invoiceNumber}`}
      className="inline-flex gap-1.5 items-center px-3 py-1.5 text-xs font-semibold bg-white rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap"
    >
      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      Invoice PDF
    </button>
  );
};

const SubscriptionHistory = () => {
  const carbs = useCarbLookup();
  const { data: history, isLoading, isError } = useBillingHistory();

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <p className="flex gap-2 items-center text-base font-bold text-gray-900">
          <History className="w-5 h-5 text-theme-color-1" />
          All your subscriptions
        </p>
        {history && history.length > 0 && <span className="text-sm text-gray-500">{history.length} subscription{history.length === 1 ? "" : "s"}</span>}
      </div>

      {isLoading ? (
        <p className="p-8 text-sm text-center text-gray-500">Loading your billing history...</p>
      ) : isError ? (
        <p className="p-8 text-sm text-center text-red-600">We could not load your billing history. Please try again in a moment.</p>
      ) : history.length === 0 ? (
        <p className="p-8 text-sm text-center text-gray-500">You haven&apos;t bought a subscription yet.</p>
      ) : (
        <>
          <p className="px-5 pt-4 text-sm text-gray-500">Every plan you have bought, newest first. Download a PDF invoice for any paid plan.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Plan", "Purchased", "Plan period", "Meals", "Amount", "Status", "Invoice"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((subscription) => {
                  const badge = STATUS_BADGES[subscription.status] || { label: subscription.status, style: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={subscription._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{subscription.plan}</p>
                        <p className="text-xs text-gray-400">
                          {MEAL_TYPE_LABELS[subscription.mealType] || subscription.mealType} · {carbs.label(subscription.carbType)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(subscription.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {subscription.status === "queued" ? (
                          <span className="text-gray-500">Starts after your current plan</span>
                        ) : (
                          <>
                            <p>Start: {formatDate(subscription.subscriptionStartDate)}</p>
                            <p className="text-xs text-gray-500">End: {subscriptionEndLabel(subscription, formatDate)}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{subscription.totalMeals}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {subscription.amount > 0 ? (
                          <>
                            <p className={`font-semibold ${subscription.refunded ? "text-gray-400 line-through" : "text-gray-900"}`}>{formatAmount(subscription.amount)}</p>
                            {subscription.paymentMethod && <p className="text-xs text-gray-400">{subscription.paymentMethod}</p>}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badge.style}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <InvoiceButton subscription={subscription} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export const MyPlan = () => {
  const carbs = useCarbLookup();
  const { isSubscribed, currentPlans, nextPlan, hasQueuedPlan } = useSubscription();

  const totalMealsLeft = (plan) =>
    ((plan?.lunchMeals || 0) +
      (plan?.dinnerMeals || 0) +
      (plan?.nextDayLunchMeals || 0) +
      (plan?.nextDayDinnerMeals || 0));

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; My Billing</p>
            <h2 className="text-2xl font-bold text-gray-900">My Billing</h2>
            <p className="text-sm text-gray-500">Your current subscription, everything you have bought before, and your invoices.</p>
          </div>

          <h3 className="pt-2 text-lg font-bold text-gray-900">Current subscription</h3>

          {(isSubscribed && currentPlans.length > 0) ? (
            <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <p className="flex gap-2 items-center text-base font-bold text-gray-900">
                  <CreditCard className="w-5 h-5 text-theme-color-1" />
                  {currentPlans.length > 1 ? "Current Active Plans" : "Current Active Plan"}
                </p>
                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Active</span>
              </div>
              {currentPlans.length > 1 && (
                <p className="px-5 pt-4 text-sm text-gray-500">
                  You have {currentPlans.length} active plans running at once, covering different meal types.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Plan Name", "Start Date", "Total Meals", "Meals Left", "Lunch Left", "Dinner Left", "Meal Type", "Carb Type"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">
                          <span className="flex gap-1 items-center">
                            {h === "Lunch Left" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                            {h === "Dinner Left" && <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                            {h}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPlans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{plan?.plan}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(plan?.subscriptionStartDate)}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{plan?.totalMeals} Meals</td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap text-theme-color-1">{totalMealsLeft(plan)} Meals</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {(plan?.lunchMeals || 0) + (plan?.nextDayLunchMeals || 0)} Meals
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {(plan?.dinnerMeals || 0) + (plan?.nextDayDinnerMeals || 0)} Meals
                        </td>
                        <td className="px-4 py-3 text-gray-700 uppercase whitespace-nowrap">{plan?.mealType}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {carbs.label(plan?.carbType)}
                          {carbs.nutritionLine(plan?.carbType) && (
                            <p className="text-xs text-gray-400 normal-case">{carbs.nutritionLine(plan?.carbType)}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">You don&apos;t have any active subscription plans.</p>
            </div>
          )}

          {hasQueuedPlan && nextPlan ? (
            <div className="overflow-hidden bg-white rounded-2xl border-l-4 border-amber-400 shadow-sm">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <p className="flex gap-2 items-center text-base font-bold text-gray-900">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Next Queued Plan
                </p>
                <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">Queued</span>
              </div>
              <p className="px-5 pt-4 text-sm text-gray-500">
                This plan will activate automatically once your current plan's meals run out.
                Only an admin can cancel a queued plan.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Plan Name", "Total Meals", "Meal Type", "Carb Type", "Allergy", "Taste"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold tracking-wide text-left text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{nextPlan?.plan}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{nextPlan?.totalMeals} Meals</td>
                      <td className="px-4 py-3 text-gray-700 uppercase whitespace-nowrap">{nextPlan?.mealType}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {carbs.label(nextPlan?.carbType)}
                        {carbs.nutritionLine(nextPlan?.carbType) && (
                          <p className="text-xs text-gray-400 normal-case">{carbs.nutritionLine(nextPlan?.carbType)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{nextPlan?.allergy || "None"}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatTastePreference(nextPlan) || "Not specified"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : isSubscribed ? (
            <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
              <p>
                You can queue a next plan on the{" "}
                <a href="/dashboard/plans" className="font-semibold underline">Plans page</a>{" "}
                before your current plan runs out.
              </p>
            </div>
          ) : null}

          <h3 className="pt-4 text-lg font-bold text-gray-900">Subscription history</h3>
          <SubscriptionHistory />
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default MyPlan;
