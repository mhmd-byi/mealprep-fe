import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import { useBillingHistory } from "./useBillingHistory";
import { ActivePlanCard, HistoryCard, QueuedPlanCard } from "./BillingCards";
import { History, Info } from "lucide-react";

const Message = ({ tone = "text-gray-500", children }) => (
  <div className="p-6 text-sm text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
    <p className={tone}>{children}</p>
  </div>
);

const SubscriptionHistory = () => {
  const { data: history, isLoading, isError } = useBillingHistory();

  if (isLoading) return <Message>Loading your billing history...</Message>;
  if (isError) return <Message tone="text-red-600">We could not load your billing history. Please try again in a moment.</Message>;
  if (!history || history.length === 0) return <Message>You haven&apos;t bought a subscription yet.</Message>;

  return (
    <div className="space-y-4">
      <p className="flex flex-wrap gap-x-3 gap-y-1 justify-between items-center text-sm text-gray-500">
        <span className="flex gap-2 items-center">
          <History className="flex-shrink-0 w-4 h-4 text-theme-color-1" />
          Every plan you have bought, newest first.
        </span>
        <span>
          {history.length} subscription{history.length === 1 ? "" : "s"}
        </span>
      </p>
      {history.map((subscription) => (
        <HistoryCard key={subscription._id} subscription={subscription} />
      ))}
    </div>
  );
};

export const MyPlan = () => {
  const { isSubscribed, currentPlans, nextPlan, hasQueuedPlan } = useSubscription();

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full min-w-0 text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-4 max-w-3xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; My Billing</p>
            <h2 className="text-2xl font-bold text-gray-900">My Billing</h2>
            <p className="text-sm text-gray-500">Your current subscription, everything you have bought before, and your invoices.</p>
          </div>

          <h3 className="pt-2 text-lg font-bold text-gray-900">Current subscription</h3>

          {isSubscribed && currentPlans.length > 0 ? (
            <>
              {currentPlans.length > 1 && (
                <p className="text-sm text-gray-500">You have {currentPlans.length} active plans running at once, covering different meal types.</p>
              )}
              {currentPlans.map((plan) => (
                <ActivePlanCard key={plan._id} plan={plan} />
              ))}
            </>
          ) : (
            <Message>You don&apos;t have any active subscription plans.</Message>
          )}

          {hasQueuedPlan && nextPlan ? (
            <QueuedPlanCard plan={nextPlan} />
          ) : isSubscribed ? (
            <div className="flex gap-3 items-start p-4 text-sm text-amber-800 bg-amber-50 rounded-2xl border border-amber-200">
              <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
              <p>
                You can queue a next plan on the{" "}
                <a href="/dashboard/plans" className="font-semibold underline">
                  Plans page
                </a>{" "}
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
