import React, { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import menudata from "./data.json";

const Days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const FoodMenu = () => {
  const [currentDay, setCurrentDay] = useState("Monday");
  const [menuData, setMenuData] = useState(menudata);

  const handleDayClick = (day) => {
    setCurrentDay(day);
  };

  const currentDayMenu = menuData[currentDay];

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="max-w-[1500px]">
          <ul className="flex flex-wrap gap-11 -mb-px text-xl font-medium text-center text-black">
            {Days.map((day, index) => (
              <li
                key={index}
                className="me-2 bg-white px-7 rounded-xl flex justify-center items-center"
              >
                <a
                  href="#"
                  onClick={() => handleDayClick(day)}
                  className="inline-flex items-center justify-center p-4 border-b-2 border-transparent group"
                >
                  {day.slice(0, 3)} <ChevronDownIcon className="h-5 w-5 ml-2" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="max-w-[1500px] w-[1300px] min-h-[500px] flex flex-row gap-10 bg-white p-20 mt-5 rounded-theme-radius">
          {["Proteins", "Carbs", "Salads"].map((section, index) => (
            <div
              key={section}
              className={`text-left basis-1/3 ${
                index < 2 ? "border-r-2 border-gray-300" : ""
              }`}
            >
              <div>
                <h1 className="text-3xl text-black ">{section}</h1>
              </div>
              <div>
                <ul className="mt-4 text-lg">
                  {currentDayMenu[section.toLowerCase()]?.map((item) => (
                    <li key={item.name} className="mt-2 flex items-center">
                      {item.name}
                      <svg
                        width="15"
                        height="16"
                        className="ml-2"
                        viewBox="0 0 15 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="1"
                          width="14"
                          height="14"
                          stroke={item.veg ? "#007F0D" : "#FE0D0D"}
                        />
                        <circle
                          cx="7.5"
                          cy="8"
                          r="3.75"
                          fill={item.veg ? "#007F0D" : "#FE0D0D"}
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default FoodMenu;
