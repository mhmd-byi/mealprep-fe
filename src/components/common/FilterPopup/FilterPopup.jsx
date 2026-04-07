import React from 'react';
import Popup from '../Popup/Popup';

const FilterPopup = ({ isOpen, onClose, criteria, setCriteria, title = "Filter Results" }) => {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      content={
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bold">Plan Type</label>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bold">Meals Left Count</label>
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
        </div>
      }
      buttons={[
        {
          label: "Clear Filters",
          onClick: () => {
            setCriteria({ planType: 'All', mealCount: '', operator: '>' });
            onClose();
          },
          className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
        },
        {
          label: "Apply Filters",
          onClick: onClose,
          className: "bg-theme-color-1 text-white hover:bg-black"
        }
      ]}
    />
  );
};

export default FilterPopup;
