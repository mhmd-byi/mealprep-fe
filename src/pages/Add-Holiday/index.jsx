import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { CalendarDays, Info } from "lucide-react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { sendEmail } from "../../utils";

const QUICK_HOLIDAYS = ["Diwali", "Christmas", "New Year", "Eid", "Republic Day", "Independence Day"];

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatHolidayDate = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AddHoliday = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [holidays, setHolidays] = useState([]);

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };

  const loadHolidays = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}holiday/get-holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidays(response.data.holidays || []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const upcomingHolidays = holidays
    .map((h) => ({ ...h, dateKey: new Date(h.date).toISOString().slice(0, 10) }))
    .filter((h) => h.dateKey >= getLocalDateKey())
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(0, 5);

  const isSameDay = !formData.endDate;

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({
      ...prev,
      startDate: selectedDate,
      endDate: prev.endDate && prev.endDate < selectedDate ? selectedDate : prev.endDate,
    }));
    setError("");
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, endDate: selectedDate }));
    setError("");
  };

  const handleSameDayToggle = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({ ...prev, endDate: checked ? "" : prev.startDate }));
    setError("");
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setError("");
  };

  const handleQuickAdd = (name) => {
    setFormData((prev) => ({ ...prev, description: name }));
    setError("");
  };

  const handleReset = () => {
    setFormData({ startDate: "", endDate: "", description: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        setFormData({
          startDate: "",
          endDate: "",
          description: "",
        });
        loadHolidays();
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
            category: "holiday",
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

  const inputClass =
    "block w-full px-4 py-2.5 text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto w-full space-y-6">
          <div>
            <p className="text-sm text-gray-500">Home › Holiday › Add Holiday</p>
            <h2 className="text-2xl font-bold text-gray-900">Add Holiday</h2>
            <p className="text-sm text-gray-500">
              Mark your non-operational days. These dates will be blocked for meal deliveries and subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
              <section className="space-y-4">
                <div className="flex gap-3 items-center">
                  <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white rounded-full bg-theme-color-1">1</span>
                  <h3 className="text-base font-semibold text-gray-900">Select Dates</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={handleStartDateChange}
                      min={getTomorrow()}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      value={isSameDay ? formData.startDate : formData.endDate}
                      onChange={handleEndDateChange}
                      min={formData.startDate || getTomorrow()}
                      disabled={isSameDay}
                      className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`}
                    />
                  </div>
                </div>
                <label className="flex gap-3 items-center text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSameDay}
                    disabled={!formData.startDate}
                    onChange={handleSameDayToggle}
                    className="w-4 h-4 rounded border-gray-300 text-theme-color-1 focus:ring-theme-color-1"
                  />
                  Same as start date
                </label>
              </section>

              <section className="space-y-4">
                <div className="flex gap-3 items-center">
                  <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white rounded-full bg-theme-color-1">2</span>
                  <h3 className="text-base font-semibold text-gray-900">Description</h3>
                </div>
                <div>
                  <textarea
                    id="description"
                    rows="4"
                    maxLength={200}
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter holiday description (e.g., Diwali, Christmas, Staff Leave, etc.)"
                    className={inputClass}
                    required
                  ></textarea>
                  <p className="mt-1 text-xs text-right text-gray-400">{formData.description.length}/200</p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-500">Quick add</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_HOLIDAYS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleQuickAdd(name)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border ${
                          formData.description === name
                            ? "bg-theme-color-1 text-white border-theme-color-1"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex gap-3 items-center">
                  <span className="flex justify-center items-center w-7 h-7 text-xs font-bold text-white rounded-full bg-theme-color-1">3</span>
                  <h3 className="text-base font-semibold text-gray-900">Affects</h3>
                </div>
                <div className="flex gap-3 items-start p-4 text-sm text-green-800 bg-green-50 rounded-lg border border-green-100">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Deliveries will be paused on the selected dates. Customers with meals left will be notified
                    automatically.
                  </span>
                </div>
              </section>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex gap-2 items-center px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black disabled:opacity-60"
                >
                  <CalendarDays className="w-4 h-4" />
                  {isLoading ? "Adding..." : "Add Holiday"}
                </button>
              </div>
            </form>

            <aside className="space-y-6">
              <div className="flex flex-col gap-3 items-center p-6 text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-100">
                <div className="flex justify-center items-center w-14 h-14 rounded-2xl bg-white text-theme-color-1 shadow-sm">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <p className="text-base font-bold text-gray-900">Plan Ahead</p>
                <p className="text-sm text-gray-600">
                  Keep your meal operations organized and your customers informed.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-base font-bold text-gray-900">Upcoming Holidays</p>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/all-holiday")}
                    className="text-sm font-semibold text-theme-color-1 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {upcomingHolidays.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingHolidays.map((h) => {
                      const [, month, day] = h.dateKey.split("-");
                      const monthLabel = new Date(Date.UTC(2000, Number(month) - 1, 1)).toLocaleDateString(undefined, { timeZone: "UTC", month: "short" });
                      return (
                        <li key={h._id} className="flex gap-3 items-center">
                          <div className="flex flex-col items-center justify-center w-12 h-12 flex-shrink-0 rounded-lg bg-green-50 text-theme-color-1">
                            <span className="text-base font-bold leading-none">{day}</span>
                            <span className="text-[10px] font-semibold uppercase">{monthLabel}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{h.description}</p>
                            <p className="text-xs text-gray-500">{formatHolidayDate(h.dateKey)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming holidays.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default AddHoliday;
