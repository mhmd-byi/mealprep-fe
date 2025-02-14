import React, { useState, useEffect, useRef } from "react";
import slide1 from "../../../assets/images/dashboard/slide1.jpg";
import slide2 from "../../../assets/images/dashboard/slide2.jpg";
import slide3 from "../../../assets/images/dashboard/slide3.jpg";
import { ArrowCircleLeft, ArrowCircleRight } from "@mui/icons-material";

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef();

  const slides = [
    {
      id: 1,
      image: slide1,
      // heading: "Meal Prep",
      // description:
      //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
      buttonText: "Purchase Plan Now",
    },
    {
      id: 2,
      image: slide2,
      // heading: "Meal Prep",
      // description:
      //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Purchase Plan Now",
    },
    {
      id: 3,
      image: slide3,
      // heading: "Meal Prep",
      // description:
      //   "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
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
    <section className="flex justify-center relative lg:pb-20 px-4">
      <div>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`relative w-full sm:w-[1500px] h-auto mt-10 ${
              index !== currentSlide ? "hidden" : ""
            }`}
          >
            {/* Desktop and Mobile Layout (Combined) */}
            <div className="bg-theme-color-1 rounded-lg overflow-hidden shadow-lg">
              <div className="w-full">
                <img
                  src={slide.image}
                  alt={slide.heading}
                  className="w-full h-[140px] md:h-[450px] lg:h-[500px] cover"
                />
              </div>

              <div className="p-4 md:p-6 lg:p-8 text-white">
                <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 md:mb-4">
                  {slide.heading}
                </h1>
                <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6">
                  {slide.description}
                </p>
                <button className="bg-white text-black py-2 px-4 rounded hover:bg-opacity-90 transition-colors">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute -bottom-5 lg:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white p-1 rounded-full">
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

        {/* Navigation Arrows */}
        <div className="absolute hidden lg:block top-1/2 left-4 -translate-y-1/2 text-white cursor-pointer">
          <span
            className="material-icons"
            onClick={prevSlide}
            style={{ fontSize: "40px", lineHeight: "40px" }}
          >
            <ArrowCircleLeft
              sx={{ fontSize: "40px" }}
              className="text-white/70 hover:text-white"
            />
          </span>
        </div>
        <div className="absolute hidden lg:block top-1/2 right-4 -translate-y-1/2 text-white cursor-pointer">
          <span
            className="material-icons"
            onClick={nextSlide}
            style={{ fontSize: "40px", lineHeight: "40px" }}
          >
            <ArrowCircleRight
              sx={{ fontSize: "40px" }}
              className="text-white/70 hover:text-white"
            />
          </span>
        </div>
      </div>
    </section>
  );
};
