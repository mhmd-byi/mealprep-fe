import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { CategoriesTab } from "./CategoriesTab";
import { OrdersTab } from "./OrdersTab";
import { ProductsTab } from "./ProductsTab";
import { SettingsTab } from "./SettingsTab";

const TABS = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "settings", label: "Delivery settings" },
];

export const Alacarte = () => {
  const [tab, setTab] = useState("orders");

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">À la carte</h2>
            <p className="text-sm text-gray-500">Manage the products customers can order on their own, and the orders they place.</p>
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

          {tab === "orders" && <OrdersTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default Alacarte;
