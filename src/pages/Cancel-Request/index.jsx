import React, { useState } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button } from "../../components";

const CancelRequest = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mealType, setMealType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidTimeForCancellation()) {
      setMessage(`Cancellation request for ${mealType} cannot be accepted at this time.`);
      return;
    }
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}subscription/cancel-request`,
        {
          userId,
          startDate,
          endDate,
          mealType,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Meal cancellation request submitted successfully");
      setStartDate("");
      setEndDate("");
      setMealType("");
    } catch (error) {
      setMessage(
        "Error submitting cancellation request: " +
          error.response?.data?.message || error.message
      );
    }
  };

  const isValidTimeForCancellation = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split('T')[0];

    if (startDate === today) {
        if (mealType === "lunch" && hour >= 11) {
            return false;
        }
        // Check if current time is after 4:30 PM
        if (mealType === "dinner" && (hour > 16 || (hour === 16 && minutes >= 30))) {
            return false;
        }
    }
    return true;
  };


  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden min-w[350px] max-w-xl ">
              <div className="p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                  Cancel Meal Request
                </h2>
                <p className="text-sm"><span className="font-bold">Note:</span>You Can Raise Cancel Request From 12 Mid Night To Morning 11 For Lunch And 12 Mid Night Till 4:30 PM For Dinner</p>
                {message && (
                  <div className="mb-4 text-sm font-medium text-green-600 mt-5">
                    {message}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Date
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
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || getTomorrow()}
                        className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
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
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <Button type="submit" classes="w-full">
                        Submit Cancel Request
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default CancelRequest;