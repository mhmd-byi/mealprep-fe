import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import Popup from "../../components/common/Popup/Popup";
import VegNonVegIcon from "../../components/common/VegNonVegIcon/VegNonVegIcon";
import { PriceTag } from "./ProductCard";
import { QuantityStepper } from "./QuantityStepper";
import { cutoffText, daysText, discountPercent, primaryButton } from "./shopDisplay";

export const ProductDetailPopup = ({ product, quantity, onQuantity, onClose }) => {
  const [photo, setPhoto] = useState(0);
  const percent = discountPercent(product);

  return (
    <Popup
      isOpen
      onClose={onClose}
      title={product.name}
      maxWidthClass="max-w-xl"
      content={
        <div className="space-y-4">
          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {product.images[photo] ? (
              <img src={product.images[photo]} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <span className="flex justify-center items-center w-full h-full text-gray-300">
                <ImageIcon className="w-12 h-12" />
              </span>
            )}
            {percent > 0 && !product.soldOut && (
              <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md">{percent}% OFF</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPhoto(index)}
                  className={`overflow-hidden w-16 h-16 rounded-lg border-2 ${index === photo ? "border-theme-color-1" : "border-transparent"}`}
                >
                  <img src={url} alt={`${product.name} ${index + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <VegNonVegIcon value={product.dietType} />
            <span className="text-sm text-gray-500">{product.dietType === "veg" ? "Vegetarian" : "Non-vegetarian"}</span>
            {product.category && <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">{product.category}</span>}
          </div>

          {product.description && <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{product.description}</p>}

          <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-lg">
            <p>
              <span className="font-semibold text-gray-800">Delivered:</span> {daysText(product)}
            </p>
            <p>{cutoffText(product)}</p>
          </div>

          <div className="flex gap-3 justify-between items-center">
            <PriceTag product={product} large />
            {product.soldOut ? (
              <span className="font-semibold text-gray-400">Sold out</span>
            ) : quantity > 0 ? (
              <QuantityStepper value={quantity} onChange={onQuantity} />
            ) : (
              <button type="button" className={primaryButton} onClick={() => onQuantity(1)}>
                Add to order
              </button>
            )}
          </div>
        </div>
      }
      buttons={[{ label: "Close", onClick: onClose, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" }]}
    />
  );
};

export default ProductDetailPopup;
