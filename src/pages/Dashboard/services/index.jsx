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
      <section
        className={`mb-20 mx-auto grid ${
          isSmallScreen ? "grid-cols-2 gap-4" : "grid-cols-4 gap-10"
        } max-w-[1500px]`}
      >
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <RestaurantMenu
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Food Menu
          </p>
        </div>
        <div
          className=" flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <CalendarMonth
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Meal Calendar
          </p>
        </div>
        <div
          className=" flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <PublishedWithChanges
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Change Request
          </p>
        </div>
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <DashboardCustomize
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Custoomized Meal
          </p>
        </div>
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <Receipt
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Receipt
          </p>
        </div>
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <NotificationsActive
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Subscription Plans
          </p>
        </div>
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <Help
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Help
          </p>
        </div>
        <div
          className="flex flex-col w-full h-[150px] sm:w-[200px] sm:h-[200px] p-2 sm:p-5 gap-2 sm:gap-5 justify-center items-center bg-white rounded group hover:bg-theme-color-1 shadow-md cursor-pointer"
          onClick={() => navigation()}
        >
          <WhatsApp
            className="mb-2 text-theme-color-1 group-hover:text-white"
            sx={{ fontSize: isSmallScreen ? "60px" : "100px" }}
          />
          <p
            className="text-sm sm:text-2xl text-black group-hover:text-white cursor-pointer text-center"
            onClick={() => navigation()}
          >
            Chat on WhatsApp
          </p>
        </div>
      </section>
    </div>
  );
};
