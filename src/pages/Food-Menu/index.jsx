import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { ImageMenu, ImageMenuForUser } from "../../components/common/ImageMenu";

const FoodMenu = () => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [menuImages, setMenuImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");
  useEffect(() => {
    getMenuImages(selectedDate);
  }, [selectedDate]);

  const getMenuImages = async (particularDate) => {
    try {
      setImagesLoading(true);
      await axios
        .get(
          `${process.env.REACT_APP_API_URL}meal/fetch-menu-images?date=${particularDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setMenuImages(response.data.imageUrls);
          setImagesLoading(false);
        })
        .catch((error) => {
          console.error("Error getting menu images:", error);
          setImagesLoading(false);
          return [];
        });
    } catch (error) {
      console.error("Error getting menu images:", error);
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="min-w-[300px] md:min-w-[600px] lg:min-w-[900px] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800">
                  Food Menu
                </h2>
                <div className="flex justify-center mb-8">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full max-w-xs px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {imagesLoading ? (
                  <div>Loading images...</div>
                ) : (
                  menuImages.length > 0 ? (
                    <ImageMenuForUser images={menuImages} />
                  ) : (
                    <div>Menu images not found</div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default FoodMenu;
