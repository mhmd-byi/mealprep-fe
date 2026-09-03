import { Button } from "../../components";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { sendEmail } from "../../utils";

const AddHoliday = () => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({
      ...prev,
      startDate: selectedDate,
      // Keep endDate valid: if it's now before the new start, snap it to match
      endDate: prev.endDate && prev.endDate < selectedDate ? selectedDate : prev.endDate,
    }));
    setError("");
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, endDate: selectedDate }));
    setError("");
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.startDate) {
      setError("Please select a start date");
      toast.error("Please select a start date");
      return;
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      setError("End date must be on or after the start date");
      toast.error("End date must be on or after the start date");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      setError("Please provide a description");
      toast.error("Please provide a description");
      return;
    }

    setIsLoading(true);
    setError("");

    const rangeLabel =
      formData.endDate && formData.endDate !== formData.startDate
        ? `${formData.startDate} to ${formData.endDate}`
        : formData.startDate;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}holiday/add-holiday`,
        {
          userId,
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || "Holiday added successfully!");
        // Reset form
        setFormData({
          startDate: "",
          endDate: "",
          description: "",
        });
      }
      const todaysDate = new Date();
      const allUsers = await axios.get(
        `${process.env.REACT_APP_API_URL}user/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const usersToNotify = allUsers?.data.filter(user => {
        const mc = user.mealCounts;
        if (!mc) return false;
        const totalLunch = (mc.lunchMeals || 0) + (mc.nextDayLunchMeals || 0);
        const totalDinner = (mc.dinnerMeals || 0) + (mc.nextDayDinnerMeals || 0);
        return totalLunch > 0 || totalDinner > 0;
      });

      usersToNotify.forEach(async (user) => {
        await axios.post(
          `${process.env.REACT_APP_API_URL}activity/add-activity`,
          {
            userId: user._id,
            date: todaysDate.toISOString().split("T")[0],
            description: `Added a new holiday for ${rangeLabel}: ${formData.description}`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        sendEmail(
          user._id,
          "",
          "New Holiday Added!",
          `Dear Customer,\n
                      We wanted to inform you that there is a holiday on ${rangeLabel}, due to ${formData.description}. Please plan accordingly.\n\n
                        Team Mealprep\n
                      `
        );
      });
    } catch (error) {
      console.error("Error adding holiday:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add holiday. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DashboardLayoutComponent>
      <div className="block flex-col justify-center items-center p-5 w-full h-full lg:flex">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden min-w[350px] max-w-xl ">
              <div className="p-6 sm:p-10">
                <h2 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl sm:mb-6">
                  Add Holiday
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="w-full">
                        <label
                          htmlFor="startDate"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={formData.startDate}
                          onChange={handleStartDateChange}
                          min={getTomorrow()}
                          className="block px-4 py-2 w-full text-gray-700 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="endDate"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={formData.endDate}
                          onChange={handleEndDateChange}
                          min={formData.startDate || getTomorrow()}
                          className="block px-4 py-2 w-full text-gray-700 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-normal text-gray-400">(optional — same as start if left blank)</span>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block mb-1 text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        placeholder="Enter holiday description (e.g., Diwali, Christmas, etc.)"
                        className="block px-4 py-2 w-full text-gray-700 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>

                    {error && (
                      <div className="text-sm text-red-500">{error}</div>
                    )}

                    <div>
                      <Button
                        type="submit"
                        classes="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Adding..." : "Add holiday"}
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

export default AddHoliday;
