import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import Popup from "../../../components/common/Popup/Popup";
import VegNonVegIcon from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { cutoffText, daysText } from "../../Alacarte/shopDisplay";
import { formatINR } from "./alacarteDisplay";
import { useAdminProducts } from "./useAlacarteAdmin";

const Chip = ({ children, tone = "bg-gray-100 text-gray-600" }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tone}`}>{children}</span>
);

const Row = ({ label, children }) => (
  <div className="flex gap-3 justify-between py-1.5 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-right text-gray-900">{children}</span>
  </div>
);

export const OrderItemPopup = ({ item, onClose }) => {
  const { data: products, isLoading } = useAdminProducts();
  const [photo, setPhoto] = useState(0);

  const product = (products || []).find((entry) => String(entry._id) === String(item.productId));
  const images = product?.images?.length ? product.images.map((image) => image.url) : item.image ? [item.image] : [];
  const dietType = product?.dietType || item.dietType;
  const soldOut = Boolean(product?.trackStock) && product.stock <= 0;
  const priceChanged = product && product.price !== item.unitPrice;

  return (
    <Popup
      isOpen
      onClose={onClose}
      title={item.name}
      maxWidthClass="max-w-xl"
      content={
        <div className="space-y-4">
          <div className="flex overflow-hidden justify-center items-center w-full bg-gray-100 rounded-xl aspect-[4/3]">
            {images[photo] ? (
              <img src={images[photo]} alt={item.name} className="object-cover w-full h-full" />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-300" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPhoto(index)}
                  className={`overflow-hidden w-16 h-16 rounded-lg border-2 ${index === photo ? "border-theme-color-1" : "border-transparent"}`}
                >
                  <img src={url} alt={`${item.name} ${index + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {dietType && <VegNonVegIcon value={dietType} />}
            {dietType && <span className="text-sm text-gray-500">{dietType === "veg" ? "Vegetarian" : "Non-vegetarian"}</span>}
            {product?.category && <Chip>{product.category}</Chip>}
            {product && !product.isActive && <Chip tone="bg-amber-100 text-amber-700">Hidden from customers</Chip>}
            {soldOut && <Chip tone="bg-red-100 text-red-700">Sold out</Chip>}
          </div>

          {product?.description && <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{product.description}</p>}

          <div className="px-4 py-2 bg-gray-50 rounded-lg divide-y divide-gray-200">
            <p className="py-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">In this order</p>
            <Row label="Quantity">{item.quantity}</Row>
            <Row label="Price each">{formatINR(item.unitPrice)}</Row>
            <Row label="Line total">{formatINR(item.unitPrice * item.quantity)}</Row>
          </div>

          {isLoading && <p className="text-sm text-gray-400">Loading product details...</p>}

          {product && (
            <div className="px-4 py-2 bg-gray-50 rounded-lg divide-y divide-gray-200">
              <p className="py-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">Product today</p>
              <Row label="Current price">{formatINR(product.price)}</Row>
              <Row label="Stock">{product.trackStock ? `${product.stock} left` : "Not tracked"}</Row>
              <Row label="Delivered on">{daysText(product)}</Row>
              <Row label="Order time">{cutoffText(product)}</Row>
            </div>
          )}

          {priceChanged && (
            <p className="p-3 text-sm text-amber-800 bg-amber-50 rounded-lg">
              The price has changed since this order. The customer paid {formatINR(item.unitPrice)} each, which is what this order is billed at.
            </p>
          )}

          {!isLoading && !product && (
            <p className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">
              This product is no longer in your products list. Showing what was saved with the order.
            </p>
          )}
        </div>
      }
      buttons={[{ label: "Close", onClick: onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" }]}
    />
  );
};

export default OrderItemPopup;
