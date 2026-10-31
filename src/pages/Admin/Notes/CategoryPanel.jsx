import { Pencil, Plus, Leaf, FileText } from "lucide-react";
import { getCategoryIcon, withAlpha, QUICK_FILTERS } from "./noteDisplay";

const rowBase = "flex items-center rounded-xl border transition-colors";

export const CategoryPanel = ({
  categories,
  countsByCategory,
  totalNotes,
  activeCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  quick,
  onSelectQuick,
}) => (
  <div className="space-y-4">
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <p className="text-base font-bold text-gray-900">Categories</p>
        <button
          type="button"
          onClick={onAddCategory}
          className="flex gap-1 items-center px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-lg border border-gray-200 hover:border-theme-color-1 hover:text-theme-color-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelectCategory("")}
          className={`${rowBase} w-full gap-3 px-3 py-2.5 text-left ${
            activeCategory === "" ? "bg-green-50 border-theme-color-1" : "bg-gray-50 border-transparent hover:border-gray-200"
          }`}
        >
          <span className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-gray-600 bg-white rounded-lg">
            <FileText className="w-4 h-4" />
          </span>
          <span className="flex-1 text-sm font-semibold text-gray-900">All Notes</span>
          <span className="text-sm font-semibold text-gray-600">{totalNotes}</span>
        </button>

        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const isActive = activeCategory === category.name;
          return (
            <div
              key={category._id}
              className={`${rowBase} pr-1`}
              style={{
                backgroundColor: withAlpha(category.color, "14"),
                borderColor: isActive ? category.color : "transparent",
              }}
            >
              <button
                type="button"
                onClick={() => onSelectCategory(category.name)}
                className="flex flex-1 gap-3 items-center px-3 py-2.5 min-w-0 text-left"
              >
                <span
                  className="flex flex-shrink-0 justify-center items-center w-8 h-8 text-white rounded-lg"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-900 truncate">{category.name}</span>
                <span className="text-sm font-semibold text-gray-600">{countsByCategory[category.name] || 0}</span>
              </button>
              <button
                type="button"
                onClick={() => onEditCategory(category)}
                className="p-1.5 text-gray-400 rounded-lg hover:text-gray-700 hover:bg-white/70"
                aria-label={`Edit ${category.name}`}
                title="Edit category"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {categories.length === 0 && (
          <p className="px-1 py-2 text-xs text-gray-400">No categories yet. Use Add to create your first one.</p>
        )}
      </div>

      <p className="mt-5 mb-2 text-sm font-bold text-gray-900">Quick Filters</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onSelectQuick(quick === filter.key ? "" : filter.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              quick === filter.key
                ? "bg-theme-color-1 text-white border-theme-color-1"
                : "bg-white text-gray-700 border-gray-200 hover:border-theme-color-1"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex gap-3 items-center p-4 bg-green-50 rounded-2xl border border-green-100">
      <Leaf className="flex-shrink-0 w-6 h-6 text-theme-color-1" />
      <p className="text-sm font-semibold text-gray-700">Better planning, smoother operations.</p>
    </div>
  </div>
);

export default CategoryPanel;
