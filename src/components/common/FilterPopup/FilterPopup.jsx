import React, { useState } from 'react';
import Popup from '../Popup/Popup';

const FilterPopup = ({ isOpen, onClose, criteria, setCriteria, title = "Filter Results" }) => {
  const [endDateError, setEndDateError] = useState('');

  const handleApply = () => {
    // Validate: if an end date operator is set but no date is picked
    if (criteria.endDateOperator && !criteria.endDate) {
      setEndDateError('Please pick a date for the End Date filter.');
      return;
    }
    setEndDateError('');
    onClose();
  };

  const handleClear = () => {
    setEndDateError('');
    setCriteria({ planType: 'All', mealCount: '', operator: '>', endDateOperator: '', endDate: '' });
    onClose();
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      content={
        <div className="space-y-5 py-2">

          {/* Plan Type */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700 font-bold">Plan Type</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-theme-color-1 focus:border-theme-color-1"
              value={criteria.planType}
              onChange={(e) => setCriteria({...criteria, planType: e.target.value})}
            >
              <option value="All">All Plans</option>
              <option value="Weekly">Weekly Plan</option>
              <option value="Monthly">Monthly Plan</option>
              <option value="Trial">Trial Pack</option>
            </select>
          </div>

          {/* Meals Left Count */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700 font-bold">Meals Left Count</label>
            <div className="flex gap-2">
              <select 
                className="w-1/3 p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-theme-color-1 focus:border-theme-color-1"
                value={criteria.operator}
                onChange={(e) => setCriteria({...criteria, operator: e.target.value})}
              >
                <option value="="> Equal to (=) </option>
                <option value=">"> Greater than (&gt;)</option>
                <option value="<"> Less than (&lt;)</option>
              </select>
              <input 
                type="number"
                placeholder="Count"
                className="w-2/3 p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-theme-color-1 focus:border-theme-color-1"
                value={criteria.mealCount}
                onChange={(e) => setCriteria({...criteria, mealCount: e.target.value})}
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Est. End Date Filter */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700 font-bold">Est. End Date</label>
            <div className="flex gap-2">
              <select
                className="w-2/5 p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-theme-color-1 focus:border-theme-color-1"
                value={criteria.endDateOperator}
                onChange={(e) => {
                  setCriteria({ ...criteria, endDateOperator: e.target.value });
                  setEndDateError('');
                }}
              >
                <option value="">-- Select --</option>
                <option value="<">Less than (&lt;)</option>
                <option value=">">Greater than (&gt;)</option>
                <option value="=">Equal to (=)</option>
              </select>
              <input
                type="date"
                className={`w-3/5 p-2 border rounded-md bg-gray-50 focus:ring-theme-color-1 focus:border-theme-color-1 ${
                  endDateError ? 'border-red-400' : 'border-gray-300'
                }`}
                value={criteria.endDate}
                onChange={(e) => {
                  setCriteria({ ...criteria, endDate: e.target.value });
                  setEndDateError('');
                }}
              />
            </div>
            {endDateError && (
              <p className="text-xs text-red-500 mt-1">{endDateError}</p>
            )}
          </div>

        </div>
      }
      buttons={[
        {
          label: "Clear Filters",
          onClick: handleClear,
          className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
        },
        {
          label: "Apply Filters",
          onClick: handleApply,
          className: "bg-theme-color-1 text-white hover:bg-black"
        }
      ]}
    />
  );
};

export default FilterPopup;
