import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";

const FoodMenu = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [menuImage, setMenuImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (selectedDate) {
      fetchMenuImage(selectedDate);
    }
  }, [selectedDate]);

  const fetchMenuImage = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}get-meal?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.length > 0) {
        const imageUrl = response.data[0].imageUrl;
        setMenuImage(imageUrl);
      } else {
        setMenuImage(null);
      }
    } catch (error) {
      console.error("Error fetching menu image:", error);
      setError("Failed to load menu image. Please try again.");
    } finally {
      setLoading(false);
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
                {loading ? (
                  <p className="text-xl text-center text-gray-600">
                    Loading menu...
                  </p>
                ) : error ? (
                  <p className="text-xl text-center text-red-600">{error}</p>
                ) : selectedDate ? (
                  menuImage ? (
                    <div className="flex justify-center">
                      <img
                        src={menuImage}
                        alt="Food Menu"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <p className="text-xl text-center text-gray-600">
                      No menu image available for this date.
                    </p>
                  )
                ) : (
                  <p className="text-xl text-center text-gray-600">
                    Please select a date to view the menu.
                  </p>
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
