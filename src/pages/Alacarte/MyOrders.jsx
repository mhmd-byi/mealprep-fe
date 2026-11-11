import { formatDateKey, formatDateTime, formatINR, ORDER_STATUS } from "../../alacarteDisplay";
import { useMyOrders } from "./useAlacarteShop";

const STEPS = ["placed", "confirmed", "out_for_delivery", "delivered"];

const Progress = ({ status }) => {
  const reached = STEPS.indexOf(status);
  return (
    <div className="flex gap-1.5">
      {STEPS.map((step, index) => (
        <div key={step} className="flex-1">
          <div className={`h-1.5 rounded-full ${index <= reached ? "bg-theme-color-1" : "bg-gray-200"}`} />
          <p className={`mt-1 text-[11px] leading-tight ${index <= reached ? "font-semibold text-gray-800" : "text-gray-400"}`}>{ORDER_STATUS[step].label}</p>
        </div>
      ))}
    </div>
  );
};

export const MyOrders = () => {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="w-10 h-10 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
        <p className="mt-3 text-sm text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (isError) return <p className="py-12 text-center text-gray-500">We could not load your orders. Please try again in a moment.</p>;

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500">You have not placed any à la carte orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = ORDER_STATUS[order.status] || { label: order.status, style: "bg-gray-100 text-gray-700" };
        return (
          <div key={order._id} className="p-5 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-2 justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{order.orderNumber}</p>
                <p className="text-xs text-gray-500">Placed {formatDateTime(order.createdAt)}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status.style}`}>{status.label}</span>
            </div>

            <Progress status={order.status} />

            <div className="text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Delivery:</span> {formatDateKey(order.deliveryDate)}, {order.slotLabel}
              </p>
              <p className="text-gray-500 whitespace-pre-line">{order.address}</p>
            </div>

            <ul className="divide-y divide-gray-100 border-y border-gray-100">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-3 items-center py-2 text-sm">
                  {item.image ? <img src={item.image} alt={item.name} className="object-cover w-10 h-10 rounded-lg" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                  <span className="flex-1 text-gray-900">
                    {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900">{formatINR(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{order.deliveryFee > 0 ? `Includes ${formatINR(order.deliveryFee)} delivery` : "Free delivery"}</span>
              <span className="font-bold text-gray-900">Total {formatINR(order.total)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrders;
