import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { ImageMenuForUser } from "../../components/common/ImageMenu";
import { CalendarDays, Image as ImageIcon } from "lucide-react";

const FoodMenu = () => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [menuImages, setMenuImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  useEffect(() => {
    getMenuImages(selectedDate);
  }, [selectedDate]);

  const getMenuImages = async (particularDate) => {
    try {
      setImagesLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}meal/fetch-menu-images?date=${particularDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenuImages(response.data.imageUrls);
    } catch (error) {
      console.error("Error getting menu images:", error);
    } finally {
      setImagesLoading(false);
    }
  };

  const formatDateLabel = (isoDate) => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; Food Menu</p>
            <h2 className="text-2xl font-bold text-gray-900">Food Menu</h2>
            <p className="text-sm text-gray-500">Pick a date to see what's on the menu. Tap any photo for a closer look.</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              Menu Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 w-full max-w-xs text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1"
            />
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-700">{formatDateLabel(selectedDate)}</p>
            {imagesLoading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="w-10 h-10 rounded-full border-b-2 animate-spin border-theme-color-1"></div>
                <p className="mt-3 text-sm text-gray-500">Loading menu...</p>
              </div>
            ) : menuImages.length > 0 ? (
              <ImageMenuForUser images={menuImages} />
            ) : (
              <div className="flex flex-col justify-center items-center py-16 text-center">
                <div className="flex justify-center items-center mb-3 w-12 h-12 text-gray-400 bg-gray-50 rounded-full">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="font-medium text-gray-500">No menu has been uploaded for this date yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default FoodMenu;
