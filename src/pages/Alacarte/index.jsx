import { useMemo, useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { formatINR } from "../../alacarteDisplay";
import { CheckoutPopup } from "./CheckoutPopup";
import { MyOrders } from "./MyOrders";
import { ProductCard } from "./ProductCard";
import { ProductDetailPopup } from "./ProductDetailPopup";
import { primaryButton } from "./shopDisplay";
import { usePublicProducts } from "./useAlacarteShop";
import { useCart } from "./useCart";

const TABS = [
  { key: "shop", label: "Shop" },
  { key: "orders", label: "My orders" },
];

export const AlacarteShop = () => {
  const { data, isLoading, isError, refetch } = usePublicProducts();
  const cart = useCart();
  const [tab, setTab] = useState("shop");
  const [category, setCategory] = useState("");
  const [openProductId, setOpenProductId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notice, setNotice] = useState(null);

  const products = useMemo(() => data?.products || [], [data]);
  const categories = data?.categories || [];
  const byId = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);

  const lines = useMemo(
    () => cart.items.map((entry) => ({ product: byId.get(entry.productId), quantity: entry.quantity })).filter((line) => line.product),
    [cart.items, byId]
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  const visible = category ? products.filter((product) => product.category === category) : products;
  const openProduct = openProductId ? byId.get(openProductId) : null;

  const handleOrdered = (result) => {
    cart.clear();
    setShowCheckout(false);
    setNotice(result);
    setTab("orders");
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-6xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; À la carte</p>
            <h2 className="text-2xl font-bold text-gray-900">À la carte</h2>
            <p className="text-sm text-gray-500">Order extras on top of your plan, or on their own. Pick a date and time that suits you.</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  tab === item.key ? "bg-theme-color-1 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-theme-color-1"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {notice && (
            <div className="flex gap-3 items-start p-4 text-sm bg-green-50 rounded-xl border border-green-200">
              <CheckCircle2 className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-600" />
              <div className="flex-1 text-green-900">
                {notice.confirmed ? (
                  <>
                    <p className="font-bold">Order {notice.orderNumber} is placed.</p>
                    <p>We will confirm it shortly and update the status below.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">Payment received for order {notice.orderNumber}.</p>
                    <p>We are still confirming it. It will appear below within a minute or two. If it does not, message us on WhatsApp.</p>
                  </>
                )}
              </div>
              <button type="button" className="font-semibold text-green-800 underline" onClick={() => setNotice(null)}>
                Dismiss
              </button>
            </div>
          )}

          {tab === "orders" && <MyOrders />}

          {tab === "shop" && (
            <>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {["", ...categories].map((name) => (
                    <button
                      key={name || "all"}
                      type="button"
                      onClick={() => setCategory(name)}
                      className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border ${
                        category === name ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-200 hover:border-theme-color-1"
                      }`}
                    >
                      {name || "All"}
                    </button>
                  ))}
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="w-10 h-10 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading products...</p>
                </div>
              ) : isError ? (
                <div className="py-16 text-center">
                  <p className="text-gray-500">We could not load the products.</p>
                  <button type="button" className={`${primaryButton} mt-3`} onClick={() => refetch()}>
                    Try again
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500">Nothing to order here right now. Please check back soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      quantity={cart.quantityOf(product._id)}
                      onQuantity={(next) => cart.setQuantity(product._id, next)}
                      onOpen={() => setOpenProductId(product._id)}
                    />
                  ))}
                </div>
              )}

              {itemCount > 0 && (
                <div className="sticky bottom-4 z-10 flex gap-3 justify-between items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <div className="flex gap-3 items-center">
                    <ShoppingBag className="w-6 h-6 text-theme-color-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-gray-500">{formatINR(cartTotal)} before delivery</p>
                    </div>
                  </div>
                  <button type="button" className={primaryButton} onClick={() => setShowCheckout(true)}>
                    View order
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {openProduct && (
        <ProductDetailPopup
          key={openProduct._id}
          product={openProduct}
          quantity={cart.quantityOf(openProduct._id)}
          onQuantity={(next) => cart.setQuantity(openProduct._id, next)}
          onClose={() => setOpenProductId(null)}
        />
      )}

      {showCheckout && lines.length > 0 && (
        <CheckoutPopup lines={lines} onQuantity={cart.setQuantity} onClose={() => setShowCheckout(false)} onOrdered={handleOrdered} />
      )}
    </DashboardLayoutComponent>
  );
};

export default AlacarteShop;
