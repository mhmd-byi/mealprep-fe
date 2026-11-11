import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import Pagination from "../../../components/common/Pagination/Pagination";
import {
  formatDateKey,
  formatDateTime,
  formatINR,
  inputClass,
  NEXT_ACTIONS,
  ORDER_STATUS,
  outlineButton,
  STATUS_FILTERS,
} from "./alacarteDisplay";
import { errorText, useAdminOrders, useAlacarteActions } from "./useAlacarteAdmin";

const UNPAID = ["pending_payment", "expired"];

const OrderCard = ({ order, onStatus, onClearAttention, onCheckPayment }) => {
  const status = ORDER_STATUS[order.status] || { label: order.status, style: "bg-gray-100 text-gray-700" };
  const actions = NEXT_ACTIONS[order.status] || [];
  const isUnpaid = UNPAID.includes(order.status);

  return (
    <div className={`p-4 space-y-3 bg-white rounded-2xl border shadow-sm ${order.needsAttention ? "border-amber-300" : "border-gray-100"}`}>
      <div className="flex flex-wrap gap-2 justify-between items-start">
        <div>
          <p className="font-bold text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status.style}`}>{status.label}</span>
      </div>

      {isUnpaid && (
        <div className="p-3 space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
          <p>
            {order.status === "expired"
              ? "Payment was not completed in time and the items were released."
              : "Waiting for the customer's payment."}{" "}
            If the customer says they paid, check with Razorpay.
          </p>
          {order.razorpayOrderId && <p className="text-xs text-gray-500">Razorpay order: {order.razorpayOrderId}</p>}
          <button type="button" className={outlineButton} onClick={() => onCheckPayment(order)}>
            Check payment with Razorpay
          </button>
        </div>
      )}

      {order.needsAttention && (
        <div className="flex gap-2 items-start p-3 text-sm text-amber-800 bg-amber-50 rounded-lg">
          <AlertTriangle className="flex-shrink-0 mt-0.5 w-4 h-4" />
          <div className="flex-1">
            Payment was received but an item ran out of stock. Check with the customer or refund from Razorpay.
            <button type="button" className="block mt-1 font-semibold underline" onClick={() => onClearAttention(order)}>
              Mark as handled
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Customer</p>
          <p className="text-gray-900">{order.customerName}</p>
          <a href={`tel:${order.mobile}`} className="text-theme-color-1">
            {order.mobile}
          </a>
          <p className="mt-1 text-gray-600 whitespace-pre-line">{order.address}</p>
          {order.note && <p className="mt-1 italic text-gray-500">Note: {order.note}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Deliver</p>
          <p className="text-gray-900">{formatDateKey(order.deliveryDate)}</p>
          <p className="text-gray-600">{order.slotLabel}</p>
        </div>
      </div>

      <ul className="divide-y divide-gray-100 border-y border-gray-100">
        {order.items.map((item) => (
          <li key={item.productId} className="flex gap-3 items-center py-2 text-sm">
            {item.image ? (
              <img src={item.image} alt={item.name} className="object-cover w-10 h-10 rounded-lg" />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-lg" />
            )}
            <span className="flex-1 text-gray-900">
              {item.name} <span className="text-gray-500">× {item.quantity}</span>
            </span>
            <span className="font-semibold text-gray-900">{formatINR(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="text-sm text-gray-600">
          Items {formatINR(order.subtotal)}
          {order.deliveryFee > 0 && <> · Delivery {formatINR(order.deliveryFee)}</>}
          <span className="ml-2 font-bold text-gray-900">Total {formatINR(order.total)}</span>
        </div>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <button key={action.status} type="button" className={outlineButton} onClick={() => onStatus(order, action.status)}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrdersTab = () => {
  const [status, setStatus] = useState("open");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { setOrderStatus, clearAttention, checkPayment } = useAlacarteActions();

  const params = { status, page, limit: rowsPerPage };
  if (date) params.date = date;
  if (search.trim()) params.search = search.trim();
  if (attentionOnly) params.attention = "1";

  const { data, isLoading } = useAdminOrders(params);
  const orders = data?.orders || [];

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleStatus = async (order, nextStatus) => {
    try {
      await setOrderStatus(order._id, nextStatus);
      toast.success(`${order.orderNumber} updated.`);
    } catch (error) {
      toast.error(errorText(error, "Could not update this order."));
    }
  };

  const handleCheckPayment = async (order) => {
    try {
      await checkPayment(order._id);
      toast.success(`${order.orderNumber} is paid and now placed.`);
    } catch (error) {
      toast.error(errorText(error, "Could not check this payment."));
    }
  };

  const handleClearAttention = async (order) => {
    try {
      await clearAttention(order._id);
    } catch (error) {
      toast.error(errorText(error, "Could not update this order."));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => resetPage(setStatus)(item.value)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border ${
              status === item.value ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-200 hover:border-theme-color-1"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          className={`${inputClass} sm:max-w-xs`}
          placeholder="Search order no., name or mobile"
          value={search}
          onChange={(e) => resetPage(setSearch)(e.target.value)}
        />
        <input type="date" className={`${inputClass} sm:max-w-[11rem]`} value={date} onChange={(e) => resetPage(setDate)(e.target.value)} aria-label="Delivery date" />
        {date && (
          <button type="button" className="text-sm font-semibold text-theme-color-1" onClick={() => resetPage(setDate)("")}>
            Clear date
          </button>
        )}
        <label className="flex gap-2 items-center text-sm font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={attentionOnly} onChange={(e) => resetPage(setAttentionOnly)(e.target.checked)} className="w-4 h-4 accent-amber-500" />
          Needs attention
        </label>
        {data && (
          <p className="ml-auto text-sm text-gray-500">
            {data.total} order{data.total === 1 ? "" : "s"} · {formatINR(data.amount)}
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No orders match these filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatus={handleStatus}
              onClearAttention={handleClearAttention}
              onCheckPayment={handleCheckPayment}
            />
          ))}
        </div>
      )}

      {(data?.total || 0) > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4">
            <Pagination
              totalItems={data.total}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsChange={(rows) => {
                setRowsPerPage(rows);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
