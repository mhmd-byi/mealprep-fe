import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
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
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

// Responsive Image Carousel Component
const ImageCarousel = ({ 
  images, 
  onImageClick, 
  className = "", 
  imageClassName = "" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance functionality
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(nextImage, 5000); // Change image every 5 seconds
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
      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 
            bg-gray-500/50 hover:bg-gray-500/75 rounded-full p-2 
            opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 
            bg-gray-500/50 hover:bg-gray-500/75 rounded-full p-2 
            opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </button>
        </>
      )}

      {/* Image Container */}
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

      {/* Image Counter */}
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

export default ImageCarousel;