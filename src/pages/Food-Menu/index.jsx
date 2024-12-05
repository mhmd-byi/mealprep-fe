import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";

// Lightbox Component
const Lightbox = ({ imageUrl, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <XMarkIcon className="h-8 w-8 sm:h-10 sm:w-10" />
        </button>
        <img
          src={imageUrl}
          alt="Full Screen Image"
          className="max-w-full max-h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

// Image Carousel Component
const ImageCarousel = ({
  images,
  onImageClick,
  className = "",
  imageClassName = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, images]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (images.length === 0) return null;

  return (
    <div className={`relative w-full group ${className}`}>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 
            bg-gray-500/50 hover:bg-gray-500/75 rounded-full p-2 
            opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 
            bg-gray-500/50 hover:bg-gray-500/75 rounded-full p-2 
            opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </button>
        </>
      )}

      <div
        className="w-full aspect-video flex items-center justify-center overflow-hidden"
        onClick={() => onImageClick(images[currentIndex])}
      >
        <img
          src={images[currentIndex]}
          alt={`Carousel Image ${currentIndex + 1}`}
          className={`w-full h-full object-cover rounded-lg shadow-lg cursor-pointer 
          transition-transform duration-300 hover:scale-105 ${imageClassName}`}
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-gray-500/50 px-4 py-1 rounded-full text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Food Menu Component
const FoodMenu = () => {
  // Format today's date as YYYY-MM-DD for the input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [menuImages, setMenuImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState(null);

  const token = sessionStorage.getItem("token");

  // Initial fetch when component mounts and whenever selectedDate changes
  useEffect(() => {
    fetchMenuImages(selectedDate);
  }, [selectedDate]);

  const fetchMenuImages = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}meal/get-meal?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.length > 0) {
        const allImageUrls = response.data.flatMap(
          (meal) => meal.imageUrls || []
        );
        setMenuImages(allImageUrls);
      } else {
        setMenuImages([]);
      }
    } catch (error) {
      console.error("Error fetching menu images:", error);
      setError("Failed to load menu images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (imageUrl) => {
    setCurrentLightboxImage(imageUrl);
    setIsLightboxOpen(true);
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
                ) : menuImages.length > 0 ? (
                  <ImageCarousel
                    images={menuImages}
                    onImageClick={openLightbox}
                    className="my-custom-container-class"
                    imageClassName="my-custom-image-class"
                  />
                ) : (
                  <p className="text-xl text-center text-gray-600">
                    No menu images available for this date.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && currentLightboxImage && (
        <Lightbox
          imageUrl={currentLightboxImage}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </DashboardLayoutComponent>
  );
};

export default FoodMenu;