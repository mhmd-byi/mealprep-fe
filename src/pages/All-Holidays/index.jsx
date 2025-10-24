import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Delete } from "@mui/icons-material";

const AllHolidays = () => {
  const [allHolidays, setAllHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  const getAllHolidays = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}holiday/get-holidays`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Sort holidays by date (newest first)
      const sortedHolidays = response.data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setAllHolidays(sortedHolidays);
      setError(null);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setError("Failed to fetch holidays");
      toast.error("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId, holidayDate) => {
    if (!window.confirm(`Are you sure you want to delete the holiday on ${formatDate(holidayDate)}?`)) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}holiday/delete-holiday/${holidayId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Holiday deleted successfully!");
      // Refresh the list
      getAllHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Failed to delete holiday");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description"];
    const rows = allHolidays.map((holiday) => [
      formatDate(holiday.date),
      holiday.description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `holidays_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    getAllHolidays();
  }, []);

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full">
        <div className="w-full max-w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mx-auto mt-8 mb-4">
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col p-5">
                <div className="flex flex-row justify-between items-center mb-4 p-4 bg-white rounded-t-lg">
                  <h2 className="text-2xl font-bold">All Holidays</h2>
                  {allHolidays.length > 0 && (
                    <button
                      onClick={exportToCSV}
                      type="button"
                      className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-theme-color-1 shadow-sm border-2 border-theme-color-1 hover:text-theme-color-1 hover:bg-white text-white transition-colors duration-300"
                    >
                      Export to CSV
                    </button>
                  )}
                </div>
                <div className="flex flex-col text-center w-full">
                  <div className="mt-4 w-full">
                    {loading ? (
                      <p className="text-center py-4 text-gray-500">Loading holidays...</p>
                    ) : error ? (
                      <p className="text-center py-4 text-red-500">{error}</p>
                    ) : allHolidays.length > 0 ? (
                      <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Date
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                                  Description
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {allHolidays.map((holiday, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    <div className="break-words">
                                      {formatDate(holiday.date)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {holiday.description}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <button
                                      onClick={() => handleDeleteHoliday(holiday._id, holiday.date)}
                                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                      title="Delete holiday"
                                    >
                                      <Delete />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                          {allHolidays.map((holiday, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Date:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {formatDate(holiday.date)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">Description:</span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {holiday.description}
                                  </span>
                                </div>
                                <div className="flex justify-end pt-2">
                                  <button
                                    onClick={() => handleDeleteHoliday(holiday._id, holiday.date)}
                                    className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center gap-1"
                                  >
                                    <Delete />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        No holidays found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default AllHolidays;