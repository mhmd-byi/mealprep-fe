"use client";

import { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import axios from "axios";
import { Button, Input } from "../../components";
import { Helmet } from "react-helmet";
import { useCustomiseYourMeal } from "./useCustomiseYourMeal";
import { IconButton } from "@mui/material";

export const CustomizeYourMeal = () => {
  const [startDate, setStartDate] = useState("");
  const [mealType, setMealType] = useState("");
  const { getMealItems, message, items, handleItemChange, createMealRequest, errorMessage, setItems } =
    useCustomiseYourMeal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    getMealItems(startDate, mealType);
  };

  const handleSubmitCustomiseRequest = async (e) => {
    e.preventDefault();
    createMealRequest(startDate);
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  return (
    <DashboardLayoutComponent>
      <Helmet>
        <title>Customise Meal Request | Mealprep</title>
      </Helmet>
      <div className="block lg:flex flex-col justify-center items-center p-2 sm:p-5 w-full h-full">
        <div className="py-6 sm:py-12 px-2 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full">
              <div className="p-3 sm:p-10">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-6 text-gray-800">
                  Customise Meal Request
                </h2>
                <p className="mb-4 text-sm sm:text-base">Steps to use:
                  <ul className="text-sm sm:text-base">
                    <li>1. First select the date and meal type for which you need to make customization request</li>
                    <li>2. Input your requests</li>
                    <li>3. Submit the request</li>
                  </ul>
                  Note: You Can Raise Cutomize Request From 12 Mid Night To Morning 11 For Lunch And 12 Mid Night Till 4:30 PM For Dinner
                </p>
                {message && (
                  <div className="mb-4 text-sm font-medium text-green-600 mt-5">
                    {message}
                  </div>
                )}
                {errorMessage && (
                  <div className="mb-4 text-sm font-medium text-red-700 mt-5">
                    {errorMessage}
                  </div>
                )}
                {items.length > 1 ? (
                  <form onSubmit={handleSubmitCustomiseRequest}>
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        Meal Items
                      </h3>
                      <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto space-y-4">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 items-center p-2 sm:p-4 bg-gray-100 rounded-lg"
                          >
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name
                              </label>
                              <Input
                                type="text"
                                value={item.name}
                                disabled={true}
                                placeholder="Meal name"
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                              />
                            </div>
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <Input
                                type="text"
                                value={item.description}
                                disabled={true}
                                placeholder="Description"
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                              />
                            </div>
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weight
                              </label>
                              <Input
                                type="text"
                                value={item.weight}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "weight",
                                    e.target.value
                                  )
                                }
                                placeholder="Weight"
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                        <Button
                          type="submit"
                          classes="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
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
                          className="w-full sm:w-auto text-red-600 border-2 bg-white border-red-600 hover:bg-red-600 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="startDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Date
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={getTomorrow()}
                            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="mealType"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Meal Type
                          </label>
                          <select
                            id="mealType"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select meal type</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Button type="submit" classes="w-full sm:w-1/4 text-white">
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
