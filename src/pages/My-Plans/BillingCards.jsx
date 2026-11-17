import { useState } from "react";
import { toast } from "sonner";
import { Clock, CreditCard, Download, Loader2, Moon, Sun } from "lucide-react";
import { useCarbLookup } from "../../carbTypes";
import { formatTastePreference } from "../../tastePreferences";
import { subscriptionEndLabel } from "../../subscriptionUtils";
import { downloadInvoice, invoiceErrorText } from "./useBillingHistory";

export const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const mealsText = (count) => `${count} ${count === 1 ? "meal" : "meals"}`;

const STATUS_BADGES = {
  active: { label: "Active", style: "bg-green-100 text-green-700" },
  queued: { label: "Queued", style: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", style: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-700" },
};

const MEAL_TYPE_LABELS = { veg: "Veg", "non-veg": "Non-veg", both: "Veg & non-veg" };

const mealTypeLabel = (mealType) => MEAL_TYPE_LABELS[mealType] || mealType;

const mealsLeft = (plan) =>
  (plan?.lunchMeals || 0) + (plan?.dinnerMeals || 0) + (plan?.nextDayLunchMeals || 0) + (plan?.nextDayDinnerMeals || 0);

const StatusBadge = ({ status }) => {
  const badge = STATUS_BADGES[status] || { label: status, style: "bg-gray-100 text-gray-700" };
  return <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${badge.style}`}>{badge.label}</span>;
};

const Stat = ({ label, icon: Icon, iconClass = "", className = "", children }) => (
  <div className={`p-3 min-w-0 bg-white ${className}`}>
    <dt className="flex gap-1 items-center text-xs font-semibold tracking-wide text-gray-500 uppercase">
      {Icon && <Icon className={`w-3.5 h-3.5 ${iconClass}`} />}
      {label}
    </dt>
    <dd className="mt-1 text-sm font-medium text-gray-900 break-words">{children}</dd>
  </div>
);

const StatGrid = ({ children }) => (
  <dl className="grid grid-cols-2 gap-px bg-gray-100 border-t border-gray-100 md:grid-cols-4">{children}</dl>
);

const CarbValue = ({ carbType }) => {
  const carbs = useCarbLookup();
  const nutrition = carbs.nutritionLine(carbType);
  return (
    <>
      {carbs.label(carbType)}
      {nutrition && <span className="block text-xs font-normal text-gray-400">{nutrition}</span>}
    </>
  );
};

export const ActivePlanCard = ({ plan }) => {
  const left = mealsLeft(plan);
  const total = Number(plan.totalMeals) || 0;
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((left / total) * 100))) : 0;

  return (
    <article className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-3 justify-between items-start p-4 sm:p-5">
        <div className="min-w-0">
          <p className="flex gap-2 items-center text-lg font-bold text-gray-900">
            <CreditCard className="flex-shrink-0 w-5 h-5 text-theme-color-1" />
            <span className="break-words">{plan.plan}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {mealTypeLabel(plan.mealType)} · {mealsText(total)} in this plan
          </p>
        </div>
        <StatusBadge status="active" />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <p className="flex gap-2 items-baseline">
          <span className="text-3xl font-bold text-theme-color-1">{left}</span>
          <span className="text-sm text-gray-500">of {total} meals left</span>
        </p>
        <div
          className="mt-2 h-2 bg-gray-100 rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Meals left"
        >
          <div className="h-2 rounded-full bg-theme-color-1" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <StatGrid>
        <Stat label="Lunch left" icon={Sun} iconClass="text-amber-500">
          {mealsText((plan.lunchMeals || 0) + (plan.nextDayLunchMeals || 0))}
        </Stat>
        <Stat label="Dinner left" icon={Moon} iconClass="text-indigo-500">
          {mealsText((plan.dinnerMeals || 0) + (plan.nextDayDinnerMeals || 0))}
        </Stat>
        <Stat label="Started">{formatDate(plan.subscriptionStartDate)}</Stat>
        <Stat label="Carb type">
          <CarbValue carbType={plan.carbType} />
        </Stat>
      </StatGrid>
    </article>
  );
};

export const QueuedPlanCard = ({ plan }) => (
  <article className="overflow-hidden bg-white rounded-2xl border-l-4 border-amber-400 shadow-sm">
    <div className="flex gap-3 justify-between items-start p-4 sm:p-5">
      <div className="min-w-0">
        <p className="flex gap-1.5 items-center text-xs font-semibold tracking-wide text-amber-700 uppercase">
          <Clock className="flex-shrink-0 w-4 h-4 text-amber-500" />
          Next queued plan
        </p>
        <p className="mt-1 text-lg font-bold text-gray-900 break-words">{plan.plan}</p>
      </div>
      <StatusBadge status="queued" />
    </div>
    <p className="px-4 pb-4 text-sm text-gray-500 sm:px-5">
      This plan will activate automatically once your current plan&apos;s meals run out. Only an admin can cancel a queued plan.
    </p>
    <StatGrid>
      <Stat label="Total meals">{mealsText(Number(plan.totalMeals) || 0)}</Stat>
      <Stat label="Meal type">{mealTypeLabel(plan.mealType)}</Stat>
      <Stat label="Carb type">
        <CarbValue carbType={plan.carbType} />
      </Stat>
      <Stat label="Allergy">{plan.allergy || "None"}</Stat>
      <Stat label="Taste" className="col-span-2 md:col-span-4">
        {formatTastePreference(plan) || "Not specified"}
      </Stat>
    </StatGrid>
  </article>
);

const InvoiceButton = ({ subscription }) => {
  const [isDownloading, setIsDownloading] = useState(false);

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
      className="inline-flex gap-1.5 justify-center items-center px-4 py-2.5 w-full text-sm font-semibold bg-white rounded-lg border-2 sm:w-auto text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white disabled:opacity-50 whitespace-nowrap"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Invoice PDF
    </button>
  );
};

export const HistoryCard = ({ subscription }) => {
  const carbs = useCarbLookup();
  const isQueued = subscription.status === "queued";
  const hasFooter = subscription.refunded || subscription.invoiceAvailable;

  return (
    <article className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex gap-3 justify-between items-start p-4">
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900 break-words">{subscription.plan}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {mealTypeLabel(subscription.mealType)} · {carbs.label(subscription.carbType)} · {mealsText(subscription.totalMeals)}
          </p>
        </div>
        <StatusBadge status={subscription.status} />
      </div>

      <StatGrid>
        <Stat label="Purchased">{formatDate(subscription.createdAt)}</Stat>
        <Stat label="Amount">
          {subscription.amount > 0 ? (
            <>
              <span className={subscription.refunded ? "text-gray-400 line-through" : ""}>{formatAmount(subscription.amount)}</span>
              {subscription.paymentMethod && <span className="block text-xs font-normal text-gray-400">{subscription.paymentMethod}</span>}
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Stat>
        <Stat label="Plan period" className="col-span-2">
          {isQueued ? (
            <span className="font-normal text-gray-500">Starts after your current plan</span>
          ) : (
            `${formatDate(subscription.subscriptionStartDate)} – ${subscriptionEndLabel(subscription, formatDate)}`
          )}
        </Stat>
      </StatGrid>

      {hasFooter && (
        <div className="flex flex-col gap-2 px-4 py-3 border-t border-gray-100 sm:flex-row sm:justify-between sm:items-center">
          {subscription.refunded ? (
            <p className="text-sm font-semibold text-red-600">Refunded</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 truncate">Invoice {subscription.invoiceNumber}</p>
              <InvoiceButton subscription={subscription} />
            </>
          )}
        </div>
      )}
    </article>
  );
};
