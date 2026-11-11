import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import VegNonVegIcon from "../../../components/common/VegNonVegIcon/VegNonVegIcon";
import { formatINR, outlineButton, primaryButton } from "./alacarteDisplay";
import { ProductFormPopup } from "./ProductFormPopup";
import { errorText, useAdminProducts, useAlacarteActions, useProductCategories } from "./useAlacarteAdmin";

export const ProductsTab = () => {
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useProductCategories();
  const { saveProduct, setProductActive, deleteProduct } = useAlacarteActions();
  const [form, setForm] = useState(null);

  const handleSave = async (payload) => {
    await saveProduct(form.product?._id, payload);
    toast.success(form.product ? "Product updated." : "Product added.");
    setForm(null);
  };

  const handleToggle = async (product) => {
    try {
      await setProductActive(product._id, !product.isActive);
      toast.success(product.isActive ? `${product.name} is now hidden.` : `${product.name} is now visible.`);
    } catch (error) {
      toast.error(errorText(error, "Could not change this product."));
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Past orders keep their details.`)) return;
    try {
      await deleteProduct(product._id);
      toast.success("Product deleted.");
    } catch (error) {
      toast.error(errorText(error, "Could not delete this product."));
    }
  };

  const list = products || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <p className="text-sm text-gray-500">These products show on the website, in the web app and in the mobile app.</p>
        <button type="button" className={`${primaryButton} flex gap-2 items-center`} onClick={() => setForm({ product: null })}>
          <Plus className="w-4 h-4" />
          Add product
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-gray-500">Loading products...</p>
      ) : list.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No products yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((product) => {
            const soldOut = product.trackStock && product.stock <= 0;
            return (
              <div key={product._id} className={`flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm ${product.isActive ? "" : "opacity-70"}`}>
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="object-cover flex-shrink-0 w-24 h-24 rounded-xl" />
                ) : (
                  <div className="flex flex-shrink-0 justify-center items-center w-24 h-24 text-xs text-gray-400 bg-gray-100 rounded-xl">No photo</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center">
                    <VegNonVegIcon value={product.dietType} />
                    <p className="font-bold text-gray-900 truncate">{product.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{product.category || "No category"}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatINR(product.price)}
                    {product.compareAtPrice ? <span className="ml-2 text-xs font-normal text-gray-400 line-through">{formatINR(product.compareAtPrice)}</span> : null}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {!product.isActive && <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">Hidden</span>}
                    {soldOut && <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Sold out</span>}
                    {product.trackStock && !soldOut && (
                      <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">{product.stock} in stock</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" className={`${outlineButton} flex gap-1.5 items-center`} onClick={() => setForm({ product })}>
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button type="button" className={outlineButton} onClick={() => handleToggle(product)}>
                      {product.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      className="flex gap-1.5 items-center px-3 py-2 text-sm font-semibold text-red-600 rounded-lg border-2 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && <ProductFormPopup key={form.product?._id || "new"} product={form.product} categories={categories || []} onClose={() => setForm(null)} onSave={handleSave} />}
    </div>
  );
};

export default ProductsTab;
