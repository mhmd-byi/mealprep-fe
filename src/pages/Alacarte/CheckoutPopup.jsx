import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import Popup from "../../components/common/Popup/Popup";
import VegNonVegIcon from "../../components/common/VegNonVegIcon/VegNonVegIcon";
import { formatINR } from "../../alacarteDisplay";
import { QuantityStepper } from "./QuantityStepper";
import { errorText, SHOP_KEY, startPayment, useQuote, useShopConfig } from "./useAlacarteShop";

const fieldClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const Section = ({ title, children }) => (
  <div>
    <p className="mb-2 text-sm font-bold text-gray-800">{title}</p>
    {children}
  </div>
);

export const CheckoutPopup = ({ lines, onQuantity, onClose, onOrdered }) => {
  const queryClient = useQueryClient();
  const { data: config } = useShopConfig();
  const items = lines.map((line) => ({ productId: line.product._id, quantity: line.quantity }));
  const { data: quote, error: quoteError, isPlaceholderData } = useQuote(items);

  const [dateChoice, setDateChoice] = useState("");
  const [slotChoice, setSlotChoice] = useState("morning");
  const [addressDraft, setAddressDraft] = useState(null);
  const [note, setNote] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState("");

  const address = addressDraft ?? config?.address ?? "";
  const dates = quote?.dates || [];
  const date = dates.some((option) => option.date === dateChoice) ? dateChoice : dates[0]?.date || "";
  const slots = quote?.slots || config?.slots || [];
  const slotFee = slots.find((slot) => slot.key === slotChoice)?.fee || 0;
  const subtotal = quote ? quote.subtotal : null;
  const total = subtotal === null ? null : subtotal + slotFee;
  const hasSoldOut = lines.some((line) => line.product.soldOut);
  const quoteMessage = quoteError ? errorText(quoteError, "We could not price your order. Please try again.") : "";
  const canPay = Boolean(quote) && !isPlaceholderData && !quoteError && !hasSoldOut && dates.length > 0 && Boolean(date) && address.trim().length > 0 && !isPaying;

  const handlePay = async () => {
    if (!canPay) return;
    setIsPaying(true);
    setMessage("");
    try {
      const result = await startPayment(
        { items, deliveryDate: date, slot: slotChoice, address: address.trim(), note: note.trim() },
        { name: sessionStorage.getItem("userName") || "", email: sessionStorage.getItem("email") || "", contact: config?.mobile || "" }
      );
      await queryClient.invalidateQueries({ queryKey: [SHOP_KEY] });
      if (result.outcome === "paid") {
        onOrdered({ orderNumber: result.order.orderNumber, confirmed: true });
        return;
      }
      if (result.outcome === "unconfirmed") {
        onOrdered({ orderNumber: result.orderNumber, confirmed: false });
        return;
      }
      setMessage("Payment was cancelled. You can try again whenever you are ready.");
    } catch (error) {
      setMessage(errorText(error, error?.message || "Could not start the payment. Please try again."));
    }
    setIsPaying(false);
  };

  return (
    <Popup
      isOpen
      onClose={isPaying ? () => {} : onClose}
      title="Your order"
      maxWidthClass="max-w-2xl"
      content={
        <div className="space-y-5">
          <ul className="divide-y divide-gray-100 border-y border-gray-100">
            {lines.map((line) => (
              <li key={line.product._id} className="flex gap-3 items-center py-3">
                {line.product.images[0] ? (
                  <img src={line.product.images[0]} alt={line.product.name} className="object-cover w-14 h-14 rounded-lg" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 items-center">
                    <VegNonVegIcon value={line.product.dietType} />
                    <p className="text-sm font-semibold text-gray-900 truncate">{line.product.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatINR(line.product.price)} each</p>
                  {line.product.soldOut && <p className="text-xs font-semibold text-red-600">Sold out. Remove it to continue.</p>}
                </div>
                <QuantityStepper value={line.quantity} onChange={(next) => onQuantity(line.product._id, next)} compact />
                <p className="w-16 text-sm font-bold text-right text-gray-900">{formatINR(line.product.price * line.quantity)}</p>
                <button
                  type="button"
                  onClick={() => onQuantity(line.product._id, 0)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${line.product.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          {quoteMessage && <p className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{quoteMessage}</p>}

          {quote && dates.length === 0 && !quoteMessage && (
            <p className="p-3 text-sm text-amber-800 bg-amber-50 rounded-lg">
              No delivery date works for every item in your order right now. Try removing an item and order it separately.
            </p>
          )}

          {dates.length > 0 && (
            <Section title="Delivery date">
              <div className="flex flex-wrap gap-2">
                {dates.map((option) => (
                  <button
                    key={option.date}
                    type="button"
                    onClick={() => setDateChoice(option.date)}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-lg border ${
                      option.date === date ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-300 hover:border-theme-color-1"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {slots.length > 0 && (
            <Section title="Delivery time">
              <div className="space-y-2">
                {slots.map((slot) => (
                  <label
                    key={slot.key}
                    className={`flex gap-3 items-center p-3 text-sm rounded-lg border cursor-pointer ${
                      slot.key === slotChoice ? "border-theme-color-1 bg-green-50" : "border-gray-200 hover:border-theme-color-1"
                    }`}
                  >
                    <input
                      type="radio"
                      name="alacarte-slot"
                      checked={slot.key === slotChoice}
                      onChange={() => setSlotChoice(slot.key)}
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="flex-1 font-medium text-gray-800">{slot.label}</span>
                    <span className={`font-semibold ${slot.fee > 0 ? "text-gray-900" : "text-green-700"}`}>{slot.fee > 0 ? `+ ${formatINR(slot.fee)}` : "Free"}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          <Section title="Delivery address">
            <textarea
              className={`${fieldClass} resize-y`}
              rows={3}
              maxLength={500}
              value={address}
              onChange={(e) => setAddressDraft(e.target.value)}
              placeholder="House / flat no., street, area, landmark"
            />
          </Section>

          <Section title="Note for us (optional)">
            <input className={fieldClass} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Ring the bell twice" />
          </Section>

          <div className="p-4 space-y-1 text-sm bg-gray-50 rounded-xl">
            <div className="flex justify-between text-gray-600">
              <span>Items</span>
              <span>{subtotal === null ? "—" : formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>{slotFee > 0 ? formatINR(slotFee) : "Free"}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-gray-900 border-t border-gray-200">
              <span>Total</span>
              <span>{total === null ? "—" : formatINR(total)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">Orders cannot be cancelled once paid. For any change, message us on WhatsApp.</p>
          {message && <p className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{message}</p>}
        </div>
      }
      buttons={[
        { label: "Back", onClick: isPaying ? () => {} : onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
        {
          label: isPaying ? "Opening payment..." : total === null ? "Pay" : `Pay ${formatINR(total)}`,
          onClick: handlePay,
          className: `bg-theme-color-1 text-white hover:bg-black ${canPay ? "" : "opacity-50 cursor-not-allowed"}`,
        },
      ]}
    />
  );
};

export default CheckoutPopup;
