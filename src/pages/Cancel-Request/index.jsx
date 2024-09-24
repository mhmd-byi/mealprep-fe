import React, { useState } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button } from "../../components";

const CancelRequest = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [mealType, setMealType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}subscription/cancel-request`,
        {
          userId,
          date: selectedDate,
          mealType,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Meal cancellation request submitted successfully");
      setSelectedDate("");
      setMealType("");
    } catch (error) {
      setMessage(
        "Error submitting cancellation request: " +
          error.response?.data?.message || error.message
      );
    }
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className=" py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden min-w[350px]">
              <div className="p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                  Cancel Meal Request
                </h2>
                {message && (
                  <div className="mb-4 text-sm font-medium text-green-600">
                    {message}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getTomorrow()}
                        className="block w-full max-w-xs px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="block w-full max-w-xs px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select meal type</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
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
