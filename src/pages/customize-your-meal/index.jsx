"use client";

import { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../components";
import { Helmet } from "react-helmet";
import { useCustomiseYourMeal } from "./useCustomiseYourMeal";
import useSubscription from "../Plans/useSubscription";
import { CalendarDays, Utensils, Info, CheckCircle2, AlertTriangle, ListChecks } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

export const CustomizeYourMeal = () => {
  const [startDate, setStartDate] = useState("");
  const [mealType, setMealType] = useState("");
  const { getMealItems, message, items, handleItemChange, createMealRequest, errorMessage, setItems, setErrorMessage } =
    useCustomiseYourMeal();
  const { currentPlan } = useSubscription();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidTimeForCustomisation()) {
      setErrorMessage(
        mealType === "lunch"
          ? "Lunch customisation for today must be requested before 10:30 AM"
          : "Dinner customisation for today must be requested before 4:00 PM"
      );
      return;
    }
    getMealItems(startDate, mealType, currentPlan.mealType);
  };

  const handleSubmitCustomiseRequest = async (e) => {
    e.preventDefault();
    createMealRequest(startDate, mealType);
  };

  // Uses local date parts (not toISOString, which is UTC and drifts a day off
  // from the IST calendar date between midnight and 5:30 AM IST).
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // A meal type is still open for "today" while the current IST time is at or before
  // its cutoff — matches the backend's `currentTimeInMinutes > cutoff` rejection check,
  // so exactly 10:30:00/16:00:00 is still allowed on both sides.
  const isMealTypeOpenToday = (type) => {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    if (type === "lunch") return currentTimeInMinutes <= 10.5 * 60; // up to 10:30 AM
    if (type === "dinner") return currentTimeInMinutes <= 16 * 60; // up to 4:00 PM
    return false;
  };

  const isValidTimeForCustomisation = () => {
    if (startDate !== getTodayString()) return true;
    return isMealTypeOpenToday(mealType);
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Today stays selectable as long as at least one meal type is still open;
  // once both cutoffs have passed, today drops out of the picker entirely.
  const getMinSelectableDate = () => {
    return (isMealTypeOpenToday("lunch") || isMealTypeOpenToday("dinner"))
      ? getTodayString()
      : getTomorrow();
  };

  return (
    <DashboardLayoutComponent>
      <Helmet>
        <title>Customise Meal Request | Mealprep</title>
      </Helmet>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-4xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Customize Your Meal</p>
            <h2 className="text-2xl font-bold text-gray-900">Customise Meal Request</h2>
            <p className="text-sm text-gray-500">Pick a date and meal, then tell us what to leave out or swap.</p>
          </div>

          <div className="flex gap-3 items-start p-4 text-sm text-blue-800 bg-blue-50 rounded-2xl border border-blue-200">
            <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
            <div>
              <p className="font-semibold">Steps to use:</p>
              <ol className="mt-1 ml-4 list-decimal">
                <li>Select the date and meal type you want to customise</li>
                <li>Edit your requests</li>
                <li>Submit the request</li>
              </ol>
              <p className="mt-2">You can raise a customisation request from 12 midnight to 10:30 AM for lunch, and 12 midnight to 4:00 PM for dinner.</p>
            </div>
          </div>

          {message && (
            <div className="flex gap-2 items-center p-4 text-sm font-medium text-green-700 bg-green-50 rounded-2xl border border-green-200">
              <CheckCircle2 className="flex-shrink-0 w-4 h-4" />
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="flex gap-2 items-center p-4 text-sm font-medium text-red-700 bg-red-50 rounded-2xl border border-red-200">
              <AlertTriangle className="flex-shrink-0 w-4 h-4" />
              {errorMessage}
            </div>
          )}

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {items.length > 0 ? (
              <form onSubmit={handleSubmitCustomiseRequest}>
                <div className="space-y-4">
                  <p className="flex gap-2 items-center text-base font-bold text-gray-900">
                    <ListChecks className="w-5 h-5 text-theme-color-1" />
                    Meal Items
                  </p>
                  <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-1 gap-3 items-center p-4 rounded-xl border sm:grid-cols-4 ${
                          item.exclude ? "bg-gray-100 border-gray-200" : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="w-full">
                          <label className="block mb-1 text-xs font-medium text-gray-500">Item Name</label>
                          <Input type="text" value={item.name} disabled placeholder="Meal name" className={inputClass} />
                        </div>
                        <div className="w-full">
                          <label className="block mb-1 text-xs font-medium text-gray-500">Description</label>
                          <Input type="text" value={item.description} disabled placeholder="Description" className={inputClass} />
                        </div>
                        <div className="w-full">
                          <label className="block mb-1 text-xs font-medium text-gray-500">Weight</label>
                          <Input
                            type="select"
                            value={item.weight}
                            onChange={(e) => handleItemChange(index, "weight", e.target.value)}
                            disabled={item.exclude ?? false}
                            options={item.weights}
                            classes={inputClass}
                          />
                        </div>
                        <div className="w-full">
                          <label className="flex gap-2 items-center text-xs font-medium text-gray-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.exclude ?? false}
                              onChange={() => handleItemChange(index, "exclude", !(item.exclude ?? false))}
                              className="w-4 h-4 rounded border-gray-300 cursor-pointer text-theme-color-1 focus:ring-theme-color-1"
                            />
                            Exclude this item
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 justify-between items-center pt-2 sm:flex-row">
                    <Button type="submit" classes="w-full sm:w-auto justify-center">
                      Submit
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setItems([{
                          name: "",
                          description: "",
                          weight: "",
                        }]);
                        setStartDate("");
                        setMealType("");
                      }}
                      className="px-5 py-3 w-full text-sm font-semibold text-red-600 bg-white rounded-md border-2 border-red-600 transition-colors hover:bg-red-600 hover:text-white sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="startDate" className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          if (selectedDate.getDay() === 0) {
                            setErrorMessage("Sundays cannot be selected. Please choose another date.");
                            setStartDate("");
                          } else {
                            setErrorMessage("");
                            setStartDate(e.target.value);
                            // Clear a previously chosen meal type if it's no longer open for the new date
                            if (e.target.value === getTodayString() && mealType && !isMealTypeOpenToday(mealType)) {
                              setMealType("");
                            }
                          }
                        }}
                        min={getMinSelectableDate()}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="mealType" className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                        <Utensils className="w-4 h-4 text-gray-400" />
                        Meal Type
                      </label>
                      <select
                        id="mealType"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className={inputClass}
                        required
                      >
                        <option value="">Select meal type</option>
                        {currentPlan && ((currentPlan.lunchMeals || 0) + (currentPlan.nextDayLunchMeals || 0) > 0) && (startDate !== getTodayString() || isMealTypeOpenToday("lunch")) ? <option value="lunch">Lunch</option> : null}
                        {currentPlan && ((currentPlan.dinnerMeals || 0) + (currentPlan.nextDayDinnerMeals || 0) > 0) && (startDate !== getTodayString() || isMealTypeOpenToday("dinner")) ? <option value="dinner">Dinner</option> : null}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Button type="submit" classes="w-full sm:w-auto justify-center">
                      View menu
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
