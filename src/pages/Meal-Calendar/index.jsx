import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ArrowForwardIos, ArrowBackIos, MoreVert, DeleteOutline } from "@mui/icons-material";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";

const generateDummyMeals = (date) => {
  const meals = [
    { id: 1, name: "Vegetable Stir Fry", isVeg: true, time: "12:00 PM" },
    { id: 2, name: "Grilled Chicken Salad", isVeg: false, time: "2:00 PM" },
    { id: 3, name: "Lentil Soup", isVeg: true, time: "6:00 PM" },
    {
      id: 4,
      name: "Salmon with Roasted Vegetables",
      isVeg: false,
      time: "8:00 PM",
    },
    {
      id: 5,
      name: "Vegetable Stir-Fry with Tofu",
      isVeg: true,
      time: "6:00 PM",
    },
    { id: 6, name: "Paneer Butter Masala", isVeg: true, time: "6:00 PM" },
    {
      id: 7,
      name: "Chickpea and Spinach Curry",
      isVeg: false,
      time: "6:00 PM",
    },
    { id: 8, name: "Vegetable Lasagna", isVeg: true, time: "6:00 PM" },
    { id: 9, name: "Stuffed Bell Peppers", isVeg: false, time: "6:00 PM" },
  ];
  const day = new Date(date).getDate();
  return meals.filter((_, index) => index % day !== 0);
};

const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    const date = new Date(year, month, -i);
    days.unshift({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: false,
    });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: true,
      isToday: date.toDateString() === new Date().toDateString(),
    });
  }
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date: date.toISOString().split("T")[0],
      isCurrentMonth: false,
    });
  }

  return days;
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const MealCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [meals, setMeals] = useState(generateDummyMeals(selectedDate));

  const days = generateCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setMeals(generateDummyMeals(date));
  };

  const handleRemoveMeal = (id) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };
  const VegNonVegIcon = ({ isVeg }) => (
    <svg
      width="15"
      height="16"
      className="inline-block ml-2"
      viewBox="0 0 15 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="1"
        width="14"
        height="14"
        stroke={isVeg ? "#007F0D" : "#FE0D0D"}
      />
      <circle cx="7.5" cy="8" r="3.75" fill={isVeg ? "#007F0D" : "#FE0D0D"} />
    </svg>
  );

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col items-center justify-center w-full p-5 my-auto lg:h-full">
        <div className="w-full p-6 bg-white rounded-lg lg:w-9/12 md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
          <div className="md:pr-14">
            <div className="flex items-center">
              <h2 className="flex-auto text-sm font-semibold text-gray-900">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Previous month</span>
                <ArrowBackIos className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Next month</span>
                <ArrowForwardIos className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
              {days.map((day, dayIdx) => (
                <div
                  key={day.date}
                  className={classNames(
                    dayIdx > 6 && "border-t border-gray-200",
                    "py-2"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDateClick(day.date)}
                    className={classNames(
                      day.date === selectedDate && "text-white",
                      day.date !== selectedDate &&
                        day.isToday &&
                        "text-theme-color-1",
                      day.date !== selectedDate &&
                        !day.isToday &&
                        day.isCurrentMonth &&
                        "text-gray-900",
                      day.date !== selectedDate &&
                        !day.isToday &&
                        !day.isCurrentMonth &&
                        "text-gray-400",
                      day.date === selectedDate &&
                        day.isToday &&
                        "bg-indigo-600",
                      day.date === selectedDate &&
                        !day.isToday &&
                        "bg-theme-color-1",
                      day.date !== selectedDate && "hover:bg-gray-200",
                      (day.date === selectedDate || day.isToday) &&
                        "font-semibold",
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    )}
                  >
                    <time dateTime={day.date}>
                      {day.date.split("-").pop().replace(/^0/, "")}
                    </time>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <section className="mt-4 md:mt-0 md:pl-14">
            <ol className="mt-4 space-y-1 text-sm leading-6 text-left text-gray-500">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-center justify-between px-4 py-2 group rounded-xl focus-within:bg-gray-100 hover:bg-gray-100"
                >
                  <div className="flex-auto">
                    <p className="text-gray-900">
                      {meal.name}
                      <VegNonVegIcon isVeg={meal.isVeg} />
                    </p>
                  </div>
                  {!isPastDate(selectedDate) && (
                    <Menu as="div" className="relative">
                      <MenuButton className="-m-2 flex items-center rounded-full p-1.5 text-gray-500 hover:text-gray-600">
                        <span className="sr-only">Open options</span>
                        <MoreVert className="w-6 h-6" aria-hidden="true" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg w-36 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItems className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleRemoveMeal(meal.id)}
                            className={classNames(
                              active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                              "block w-full text-left px-4 py-2 text-sm flex items-center whitespace-nowrap"
                            )}
                          >
                            <DeleteOutline className="w-5 h-5 mr-2" />
                            <span>Remove this item for me</span>
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                      </MenuItems>
                    </Menu>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
