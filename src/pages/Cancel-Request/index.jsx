import React, { useState } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button } from "../../components";
import { sendEmail } from "../../utils";
import useSubscription from "../Plans/useSubscription";
import { CalendarDays, Utensils, Info, CheckCircle2, AlertTriangle } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const CancelRequest = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mealType, setMealType] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { currentPlan } = useSubscription();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    if (!isValidTimeForCancellation()) {
      setErrorMessage(`Cancellation request for ${mealType} cannot be accepted at this time.`);
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
      sendEmail(userId, "", "Meal Cancellation Request Received", `Dear Customer,\n
        We have received your meal cancellation request.\n
        With our cancel meal request feature, you can cancel meals for today or future dates as per your convenience.\n
        ⏳ Cancellation Timings:\n
        Lunch: 12 Midnight – 11:00 AM\n
        Dinner: 12 Midnight – 4:30 PM\n
        For any queries, feel free to contact us.\n\n
        Team Mealprep\n
          `);
      setStartDate("");
      setEndDate("");
      setMealType("");
    } catch (error) {
      setErrorMessage(
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
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-3xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Cancel Meal Request</p>
            <h2 className="text-2xl font-bold text-gray-900">Cancel Meal Request</h2>
            <p className="text-sm text-gray-500">Skip a meal for a single day or a whole range.</p>
          </div>

          <div className="flex gap-3 items-start p-4 text-sm text-blue-800 bg-blue-50 rounded-2xl border border-blue-200">
            <Info className="flex-shrink-0 mt-0.5 w-4 h-4" />
            <div>
              <p className="font-semibold">Steps to use:</p>
              <ol className="mt-1 ml-4 list-decimal">
                <li>Select a start date and end date to cancel</li>
                <li>Cancelling a single day? Use the same date for both</li>
                <li>Select Lunch, Dinner, or Both</li>
                <li>Submit the request</li>
              </ol>
              <p className="mt-2">
                <strong>Lunch:</strong> request accepted from 12 midnight to 10:00 AM.{" "}
                <strong>Dinner:</strong> request accepted from 12 midnight to 4:00 PM.
              </p>
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
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      Start Date
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
                        }
                      }}
                      min={getTomorrow()}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || getTomorrow()}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div>
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
                    {currentPlan && ((currentPlan.lunchMeals + currentPlan.nextDayLunchMeals) > 0) ? <option value="lunch">Lunch</option> : null}
                    {currentPlan && ((currentPlan.dinnerMeals + currentPlan.nextDayDinnerMeals) > 0) ? <option value="dinner">Dinner</option> : null}
                    {currentPlan && (((currentPlan.dinnerMeals + currentPlan.nextDayDinnerMeals) > 0) && ((currentPlan.lunchMeals + currentPlan.nextDayLunchMeals) > 0)) ? <option value="both">Both</option> : null}
                  </select>
                </div>
                <Button type="submit" classes="w-full justify-center">
                  Submit Cancel Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default CancelRequest;
