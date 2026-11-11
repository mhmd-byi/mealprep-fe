import { Image as ImageIcon } from "lucide-react";
import VegNonVegIcon from "../../components/common/VegNonVegIcon/VegNonVegIcon";
import { formatINR } from "../../alacarteDisplay";
import { QuantityStepper } from "./QuantityStepper";
import { cutoffText, daysText, discountPercent, primaryButton } from "./shopDisplay";

export const PriceTag = ({ product, large = false }) => (
  <p className="flex flex-wrap gap-x-2 items-baseline">
    <span className={`font-bold text-gray-900 ${large ? "text-2xl" : "text-lg"}`}>{formatINR(product.price)}</span>
    {product.compareAtPrice ? <span className="text-sm text-gray-400 line-through">{formatINR(product.compareAtPrice)}</span> : null}
  </p>
);

export const ProductCard = ({ product, quantity, onQuantity, onOpen }) => {
  const percent = discountPercent(product);

  return (
    <div className="flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
      <button type="button" onClick={onOpen} className="block relative w-full aspect-[4/3] bg-gray-100">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className={`object-cover w-full h-full ${product.soldOut ? "opacity-60" : ""}`} />
        ) : (
          <span className="flex justify-center items-center w-full h-full text-gray-300">
            <ImageIcon className="w-10 h-10" />
          </span>
        )}
        {percent > 0 && !product.soldOut && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md">{percent}% OFF</span>
        )}
        {product.soldOut && <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white bg-gray-800 rounded-md">Sold out</span>}
      </button>

      <div className="flex flex-col flex-1 gap-2 p-4">
        <div className="flex gap-2 items-start">
          <VegNonVegIcon value={product.dietType} className="mt-1" />
          <button type="button" onClick={onOpen} className="font-bold text-left text-gray-900 hover:text-theme-color-1">
            {product.name}
          </button>
        </div>
        {product.description && <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>}
        <p className="text-xs text-gray-400">
          {daysText(product)} · {cutoffText(product)}
        </p>

        <div className="flex gap-3 justify-between items-center pt-2 mt-auto">
          <PriceTag product={product} />
          {product.soldOut ? (
            <span className="text-sm font-semibold text-gray-400">Unavailable</span>
          ) : quantity > 0 ? (
            <QuantityStepper value={quantity} onChange={onQuantity} compact />
          ) : (
            <button type="button" className={primaryButton} onClick={() => onQuantity(1)}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
