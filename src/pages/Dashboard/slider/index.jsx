import React, { useState, useEffect, useRef } from "react";
import mealimage from "../../../assets/images/dashboard/meal.jpg";
import mealimage2 from "../../../assets/images/dashboard/image2.jpg";
import mealimage3 from "../../../assets/images/dashboard/image3.jpg";
import { useNavigate } from "react-router-dom";
import {
  ArrowCircleLeft,
  ArrowCircleRight,
  RestaurantMenu,
  CalendarMonth,
  OpenInNew,
  PublishedWithChanges,
  DashboardCustomize,
  Receipt,
  NotificationsActive,
  Help,
} from "@mui/icons-material";

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef();

  const slides = [
    {
      id: 1,
      image: mealimage,
      heading: "Meal Prep",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      buttonText: "Purchase Plan Now",
    },
    {
      id: 2,
      image: mealimage2,
      heading: "Meal Prep",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      buttonText: "Purchase Plan Now",
    },
    {
      id: 3,
      image: mealimage3,
      heading: "Meal Prep",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      buttonText: "Purchase Plan Now",
    },
  ];

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  useEffect(() => {
    const slide = () => {
      slideInterval.current = setInterval(() => {
        nextSlide();
      }, 5000);
    };

    slide();

    return () => clearInterval(slideInterval.current);
  }, [currentSlide]);

  return (
    <section className="flex justify-center relative pb-20 px-4">
    <div>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`relative w-full sm:w-[1500px] h-[300px] sm:h-[450px] top-10 ${
            index !== currentSlide ? "hidden" : ""
          }`}
        >
          <img
            src={slide.image}
            className="w-full h-full rounded-lg object-cover"
          />
          <div className="absolute right-0 top-0 w-full sm:w-[50%] h-full bg-black bg-opacity-75 flex flex-col justify-center px-4 sm:px-8 text-left rounded-lg">
            <h1 className="text-white text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
              {slide.heading}
            </h1>
            <p className="text-white text-sm sm:text-lg mb-4 sm:mb-8">
              {slide.description}
            </p>
            <button className="bg-white text-black py-2 px-4 rounded w-fit">
              {slide.buttonText}
            </button>
          </div>
        </div>
      ))}
      <div className="absolute bottom-[12px] lg:bottom-12 left-1/2 -translate-x-1/2 flex space-x-2 bg-white p-1 rounded-full">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`cursor-pointer ${
              index === currentSlide
                ? "bg-theme-color-1 w-5 h-3 rounded-full"
                : "bg-gray-400 w-3 h-3 rounded-full"
            }`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
      <div className="absolute hidden lg:block top-1/2 lg:left-2 sm:left-8 -translate-y-1/2 text-white cursor-pointer">
        <span
          className="material-icons"
          onClick={prevSlide}
          style={{ fontSize: "30px", lineHeight: "30px" }}
        >
          <ArrowCircleLeft
            sx={{ fontSize: "30px" }}
            className="text-theme-color-1 hover:text-white"
          />
        </span>
      </div>
      <div className="absolute hidden lg:block top-1/2 right-2 sm:right-8 -translate-y-1/2 text-white cursor-pointer">
        <span
          className="material-icons"
          onClick={nextSlide}
          style={{ fontSize: "30px", lineHeight: "30px" }}
        >
          <ArrowCircleRight
            sx={{ fontSize: "30px" }}
            className="text-theme-color-1 hover:text-white"
          />
        </span>
      </div>
    </div>
  </section>
  );
};
