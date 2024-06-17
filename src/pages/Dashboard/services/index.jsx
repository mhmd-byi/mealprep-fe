import {
    RestaurantMenu,
    CalendarMonth,
    OpenInNew,
    PublishedWithChanges,
    DashboardCustomize,
    Receipt,
    NotificationsActive,
  } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const Services = () => {
    const navigation = useNavigate();
  const items = [
    {
      icon: (
        <RestaurantMenu
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "Food Menu",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "/dashboard/food-menu",
      },
    },
    {
      icon: (
        <CalendarMonth
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "Meal Calendar",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "#",
      },
    },
    {
      icon: (
        <PublishedWithChanges
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "Change Request",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "#",
      },
    },
    {
      icon: (
        <DashboardCustomize
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "Customize your Meal",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "#",
      },
    },
    {
      icon: (
        <Receipt
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "My billing",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "#",
      },
    },
    {
      icon: (
        <NotificationsActive
          className="mb-2 text-theme-color-1"
          sx={{ fontSize: "28px" }}
        />
      ),
      title: "Plans",
      description:
        "Go to this step by step guideline process on how to certify for your weekly benefits:",
      link: {
        text: "Click here",
        path: "/dashboard/plans",
      },
    },
  ];
  return (
    <section className="mb-20 mx-auto grid grid-cols-3 gap-10 lg:max-w-[1500px]">
      {items.map((item, index) => (
        <div
          key={index}
          className="text-left max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow"
        >
          {item.icon}
          <a href={item.link.path}>
            <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {item.title}
            </h5>
          </a>
          <p className="mb-3 font-normal text-gray-500">{item.description}</p>
          <a
            onClick={() => navigation(item.link.path)}
            className="inline-flex font-medium items-center text-theme-color-1 hover:underline cursor-pointer"
          >
            {item.link.text}
            <OpenInNew
              sx={{ fontSize: "15px", fontWeight: "bold", marginLeft: "2px" }}
            />
          </a>
        </div>
      ))}
    </section>
  );
};
