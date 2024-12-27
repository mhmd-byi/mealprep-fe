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
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-7xl w-[850px]">
              <div className="p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                  Customise Meal Request
                </h2>
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
                      <h3 className="text-lg font-medium text-gray-900">
                        Meal Items
                      </h3>
                      <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center p-4 bg-gray-100 rounded-lg"
                          >
                            <div>
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
                            <div>
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
                            <div>
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
                      <div className="flex justify-between items-center">
                        <Button
                          type="submit"
                          classes="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
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
                          }
                        }
                          className="text-red-600 border-2 bg-white border-red-600 hover:bg-red-600 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-row space-x-4">
                        <div className="w-1/2">
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
                        <div className="w-1/2">
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
                        <Button type="submit" classes="w-1/4 text-white">
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
