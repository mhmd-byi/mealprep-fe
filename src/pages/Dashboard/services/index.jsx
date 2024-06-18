import {
  RestaurantMenu,
  CalendarMonth,
  PublishedWithChanges,
  DashboardCustomize,
  Receipt,
  NotificationsActive,
  Help,
  WhatsApp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
export const Services = () => {
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const navigation = useNavigate();
  return (
    <div className="px-4">
      <section className="mb-10 flex justify-center">
        <div className="bg-[#D5ECDB] p-4 rounded-lg w-fit">
          <p className="text-4xl sm:text-2xl">Our Services</p>
        </div>
      </section>
      <section className="my-20">
        <div className="flex flex-row justify-between gap-2 lg:gap-10 lg:max-w-[1500px] lg:mx-auto">
          <div
            className="w-[calc(25%-0.5rem)] lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-1 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <RestaurantMenu
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "40px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Food Menu
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] h-fit lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <CalendarMonth
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "40px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Meal Calendar
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] h-fit lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <PublishedWithChanges
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "40px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Change Request
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] h-fit lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <DashboardCustomize
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "40px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Customized Meal
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-2 lg:gap-10 lg:max-w-[1500px] lg:mx-auto mt-10">
          <div
            className="w-[calc(25%-0.5rem)] lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <Receipt
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "40px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Receipt
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] h-fit lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <NotificationsActive
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Subscription Plans
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <Help
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Help
            </p>
          </div>
          <div
            className="w-[calc(25%-0.5rem)] h-fit lg:w-[200px] lg:h-[200px] p-2 lg:p-5 flex flex-col gap-2 lg:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
            onClick={() => navigation()}
          >
            <WhatsApp
              className="mb-2 text-theme-color-1 group-hover:text-white"
              sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
            />
            <p
              className="text-[10px] sm:text-lg text-black group-hover:text-white cursor-pointer text-center"
              onClick={() => navigation()}
            >
              Chat on WhatsApp
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
