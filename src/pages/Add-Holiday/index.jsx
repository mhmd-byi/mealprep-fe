import { Button } from "../../components";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { sendEmail } from "../../utils";

const AddHoliday = () => {
  const [formData, setFormData] = useState({
    date: "",
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

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, date: selectedDate }));
    setError("");
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date) {
      setError("Please select a date");
      toast.error("Please select a date");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      setError("Please provide a description");
      toast.error("Please provide a description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}holiday/add-holiday`,
        {
          userId,
          date: formData.date,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Holiday added successfully!");
        // Reset form
        setFormData({
          date: "",
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
      console.log(allUsers?.data)
      allUsers?.data.forEach(async (user) => {
        await axios.post(
          `${process.env.REACT_APP_API_URL}activity/add-activity`,
          {
            userId: user._id,
            date: todaysDate.toISOString().split("T")[0],
            description: `Added a new holiday for date ${formData.date}: ${formData.description}`,
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
                      We wanted to inform you that there is a holiday on ${formData.date}, due to ${formData.description}. Please plan accordingly.\n\n
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
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden min-w[350px] max-w-xl ">
              <div className="p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                  Add Holiday
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={getTomorrow()}
                        className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        placeholder="Enter holiday description (e.g., Diwali, Christmas, etc.)"
                        className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
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
