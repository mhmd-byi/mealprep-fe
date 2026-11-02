import { useState } from "react";
import {
  CARB_OPTIONS,
  DIET_OPTIONS,
  OPERATOR_OPTIONS,
  PLAN_OPTIONS,
  SLOT_OPTIONS,
  STATUS_OPTIONS,
  inputClass,
  toggleValue,
} from "./notificationDisplay";
import { EMPTY_FILTER, useCustomerList } from "./useNotifications";

const ChipGroup = ({ title, options, selected, onChange }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-gray-500">{title}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(toggleValue(selected, option.value))}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${
              active ? "bg-theme-color-1 text-white border-theme-color-1" : "bg-white text-gray-700 border-gray-300 hover:border-theme-color-1"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const numberOrNull = (text) => (text === "" ? null : Math.min(365, parseInt(text, 10) || 0));

const PickCustomers = ({ filter, onChange }) => {
  const customers = useCustomerList(true);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const byId = new Map((customers.data || []).map((customer) => [String(customer._id), customer]));
  const results =
    needle.length < 2
      ? []
      : (customers.data || [])
          .filter((customer) => {
            const name = `${customer.firstName} ${customer.lastName}`.toLowerCase();
            return (
              !filter.userIds.includes(String(customer._id)) &&
              (name.includes(needle) || (customer.mobile || "").includes(needle) || (customer.email || "").toLowerCase().includes(needle))
            );
          })
          .slice(0, 8);

  return (
    <div className="space-y-3">
      <input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, mobile or email" />
      {needle.length >= 2 && !customers.isLoading && results.length === 0 && <p className="text-sm text-gray-400">No customers found.</p>}
      {results.map((customer) => (
        <button
          key={customer._id}
          type="button"
          onClick={() => {
            onChange({ ...filter, userIds: [...filter.userIds, String(customer._id)] });
            setQuery("");
          }}
          className="flex justify-between items-center px-3 py-2 w-full text-sm text-left bg-white rounded-lg border border-gray-200 hover:border-theme-color-1"
        >
          <span className="font-semibold text-gray-900">
            {customer.firstName} {customer.lastName}
          </span>
          <span className="text-gray-500">{customer.mobile}</span>
        </button>
      ))}
      <div className="flex flex-wrap gap-2">
        {filter.userIds.map((id) => {
          const customer = byId.get(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ ...filter, userIds: filter.userIds.filter((userId) => userId !== id) })}
              className="px-3 py-1.5 text-sm font-semibold text-green-800 bg-green-100 rounded-full"
            >
              {customer ? `${customer.firstName} ${customer.lastName}` : "Customer"} ✕
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const AudienceFilters = ({ filter, onChange }) => {
  const [mode, setMode] = useState(filter.userIds.length > 0 ? "pick" : "filter");
  const [pincodeText, setPincodeText] = useState(filter.pincodes.join(", "));
  const patch = (changes) => onChange({ ...filter, ...changes });

  const switchMode = (next) => {
    setMode(next);
    setPincodeText("");
    onChange({ ...EMPTY_FILTER });
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex p-1 bg-gray-100 rounded-lg">
        {[
          ["filter", "Filter customers"],
          ["pick", "Pick customers"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md ${mode === key ? "bg-white text-theme-color-1 shadow-sm" : "text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "pick" ? (
        <PickCustomers filter={filter} onChange={onChange} />
      ) : (
        <div className="space-y-4">
          <ChipGroup title="Subscription status" options={STATUS_OPTIONS} selected={filter.statuses} onChange={(statuses) => patch({ statuses })} />
          <ChipGroup title="Plan" options={PLAN_OPTIONS} selected={filter.plans} onChange={(plans) => patch({ plans })} />
          <ChipGroup title="Diet" options={DIET_OPTIONS} selected={filter.diets} onChange={(diets) => patch({ diets })} />
          <ChipGroup title="Meals they get" options={SLOT_OPTIONS} selected={filter.mealSlots} onChange={(mealSlots) => patch({ mealSlots })} />
          <ChipGroup title="Carb type" options={CARB_OPTIONS} selected={filter.carbTypes} onChange={(carbTypes) => patch({ carbTypes })} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Meals left</label>
              <select
                className={inputClass}
                value={filter.mealsLeft ? filter.mealsLeft.operator : ""}
                onChange={(e) => patch({ mealsLeft: e.target.value ? { operator: e.target.value, value: filter.mealsLeft ? filter.mealsLeft.value : 0 } : null })}
              >
                <option value="">Any</option>
                {OPERATOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Count</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                disabled={!filter.mealsLeft}
                value={filter.mealsLeft ? filter.mealsLeft.value : ""}
                onChange={(e) => filter.mealsLeft && patch({ mealsLeft: { ...filter.mealsLeft, value: numberOrNull(e.target.value) ?? 0 } })}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Plan ends within (days)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                placeholder="Any"
                value={filter.endingWithinDays === null ? "" : filter.endingWithinDays}
                onChange={(e) => patch({ endingWithinDays: numberOrNull(e.target.value) })}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-500">Joined in the last (days)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                placeholder="Any"
                value={filter.joinedWithinDays === null ? "" : filter.joinedWithinDays}
                onChange={(e) => patch({ joinedWithinDays: numberOrNull(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-500">Pincodes (comma separated)</label>
            <input
              className={inputClass}
              value={pincodeText}
              placeholder="e.g. 452010, 452001"
              onChange={(e) => {
                setPincodeText(e.target.value);
                patch({ pincodes: e.target.value.split(/[\s,]+/).filter((code) => /^\d{6}$/.test(code)) });
              }}
            />
          </div>
          <p className="text-xs text-gray-400">Leave a filter empty to ignore it. Everything you set must match, so each extra filter narrows the group.</p>
        </div>
      )}
    </div>
  );
};

export default AudienceFilters;
