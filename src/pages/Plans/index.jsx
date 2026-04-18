import React, { useState } from "react";
import { Button } from "../../components";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import data from "./data.json";
import { useSubscription } from "./useSubscription";
import { CheckmarkCircleOutline } from "./circleCheckmark";

const SubscriptionPlans = () => {
  const { plans } = data;
  const { handleSubscribe, isSubscribedTo } = useSubscription();
  const [errorMessages, setErrorMessages] = useState({});

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // If tomorrow is Sunday (0), set it to Monday (add 1 more day)
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    return formatDateLocal(tomorrow);
  };

  const getMinimumDate = (lunchDinner) => {
    // Get current time in IST
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = nowIST.getHours();
    const currentMinutes = nowIST.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    let minDate = new Date(nowIST);

    // Determine if user can select today based on meal type and time
    // Using backend cutoffs: 10:30 AM for lunch, 4:00 PM for dinner
    if (lunchDinner === "lunch") {
      // For lunch only: must book before 10:30 AM
      if (currentTimeInMinutes >= 10.5 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    } else if (lunchDinner === "dinner") {
      // For dinner only: must book before 4:00 PM (16:00)
      if (currentTimeInMinutes >= 16 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    } else if (lunchDinner === "lunchAndDinner") {
      // For both: if lunch time has passed, we should ideally start from tomorrow 
      // to ensure the user gets a full day's worth of meals
      if (currentTimeInMinutes >= 10.5 * 60) {
        minDate.setDate(minDate.getDate() + 1);
      }
    }

    // If minimum date is Sunday (0), set it to Monday
    if (minDate.getDay() === 0) {
      minDate.setDate(minDate.getDate() + 1);
    }

    return formatDateLocal(minDate);
  };

  // Create separate state for each plan's details
  const [planDetails, setPlanDetails] = useState(() =>
    plans.reduce((acc, plan) => {
      const initialLunchDinner = "lunch";
      const initialDate = getMinimumDate(initialLunchDinner);
      return {
        ...acc,
        [plan.name]: {
          mealType: "veg",
          carbType: "low-carb-high-protein",
          lunchDinner: initialLunchDinner,
          mealStartDate: initialDate,
          allergy: "",
        },
      };
    }, {})
  );

  const getAdjustedPlanDetails = (plan) => {
    const multiplier =
      planDetails[plan.name].lunchDinner === "lunchAndDinner" ? 2 : 1;
    return {
      price: plan.price * multiplier,
      meals: plan.meals * multiplier,
      duration: plan.duration.replace(
        /\d+/g,
        (match) => parseInt(match) * multiplier
      ),
    };
  };

  const handlePlanSubscribe = (
    planName,
    mealCount,
    price,
    mealType,
    carbType,
    lunchDinner,
    mealStartDate,
    allergy
  ) => {
    const plan = plans.find((p) => p.name === planName);
    const { price: adjustedPrice, meals: adjustedMeals } =
      getAdjustedPlanDetails(plan);

    handleSubscribe(
      planName,
      adjustedMeals,
      adjustedPrice,
      mealType,
      carbType,
      lunchDinner,
      mealStartDate,
      allergy,
      (message) => {
        setErrorMessages({ ...errorMessages, [planName]: message });
      }
    );
  };

  const handleDetailChange = (planName, field, value) => {
    let finalValue = value;

    // If changing meal start date, check if it's Sunday and adjust to Monday
    if (field === "mealStartDate") {
      const minDate = getMinimumDate(planDetails[planName].lunchDinner);
      if (value < minDate) {
        finalValue = minDate;
      }
      // Parse local date from YYYY-MM-DD
      const [year, month, day] = finalValue.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);

      if (selectedDate.getDay() === 0) {
        selectedDate.setDate(selectedDate.getDate() + 1);
        finalValue = formatDateLocal(selectedDate);
      }
    }

    // If changing lunch/dinner option, update the meal start date based on new minimum
    if (field === "lunchDinner") {
      const currentStartDate = planDetails[planName].mealStartDate;
      const newMinDate = getMinimumDate(value);

      if (currentStartDate < newMinDate) {
        setPlanDetails((prev) => ({
          ...prev,
          [planName]: {
            ...prev[planName],
            [field]: value,
            mealStartDate: newMinDate,
          },
        }));
        return;
      }
    }

    setPlanDetails((prev) => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [field]: finalValue,
      },
    }));
  };

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-start items-center p-5 w-full pt-10">
        <div className="bg-white shadow-md rounded-lg p-5 lg:p-20 w-full max-w-[1500px] lg:w-[1200px]">
          <h2 className="text-2xl lg:text-3xl text-black font-semibold text-center mb-8">
            Subscribe Your Meal Plans
          </h2>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
            {plans.map((plan, index) => {
              const { price, meals, duration } = getAdjustedPlanDetails(plan);
              const currentPlanDetails = planDetails[plan.name];

              return (
                <div
                  key={index}
                  className={`bg-white border-b-2 border-grey-500 pt-5 pb-5 lg:pt-0 rounded-lg lg:rounded-none lg:pb-0 px-4 lg:border-b-0 lg:border-r-2 border-grey-500 flex-1 ${index === plans.length - 1 ? "lg:border-r-0" : ""
                    }`}
                >
                  <div className="py-5">
                    <h2 className="text-2xl font-medium pb-2 border-b-2 border-grey-500">
                      {plan.name}
                    </h2>
                    <h1 className="text-4xl text-black font-bold mt-2">
                      ₹{price}
                    </h1>
                    <p className="mt-4 mb-4">
                      {plan.description} <br />
                      Valid for {duration}
                    </p>
                    <div className="flex flex-col space-y-4 justify-between items-center mb-4">
                      <div className="flex items-center">
                        <label className="mr-2">Meal Type:</label>
                        <select
                          className="border-2 border-grey-500 rounded-md p-1"
                          value={currentPlanDetails.mealType}
                          onChange={(e) =>
                            handleDetailChange(
                              plan.name,
                              "mealType",
                              e.target.value
                            )
                          }
                        >
                          <option value="veg">Veg</option>
                          <option value="non-veg">Non-Veg</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="mr-2">Lunch/Dinner:</label>
                        <select
                          className="border-2 border-grey-500 rounded-md p-1"
                          value={currentPlanDetails.lunchDinner}
                          onChange={(e) =>
                            handleDetailChange(
                              plan.name,
                              "lunchDinner",
                              e.target.value
                            )
                          }
                        >
                          <option value="lunch">Only Lunch</option>
                          <option value="dinner">Only Dinner</option>
                          <option value="lunchAndDinner">Both</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="mr-2">Carb Type:</label>
                        <select
                          className="border-2 border-grey-500 rounded-md p-1"
                          value={currentPlanDetails.carbType}
                          onChange={(e) =>
                            handleDetailChange(
                              plan.name,
                              "carbType",
                              e.target.value
                            )
                          }
                        >
                          <option value="low-carb-high-protein">
                            Low Carb High Protein Meal
                          </option>
                          <option value="balanced-meal">Balanced Meal</option>
                          <option value="high-carb-high-protein">
                            High Carb High Protein Meal
                          </option>
                          <option value="zero-carb">Zero Carb Meal</option>
                          <option value="keto-meal">Keto Meal</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="mr-2">Meal Start Date:</label>
                        <input
                          type="date"
                          className="border-2 border-grey-500 rounded-md p-1"
                          onChange={(e) =>
                            handleDetailChange(
                              plan.name,
                              "mealStartDate",
                              e.target.value
                            )
                          }
                          value={currentPlanDetails.mealStartDate}
                          min={getMinimumDate(currentPlanDetails.lunchDinner)}
                          onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="mr-2">Allergy:</label>
                        <input
                          type="text"
                          placeholder="Any allergies?"
                          className="border-2 border-grey-500 rounded-md p-1 w-full max-w-[200px]"
                          value={currentPlanDetails.allergy}
                          onChange={(e) =>
                            handleDetailChange(
                              plan.name,
                              "allergy",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    {isSubscribedTo(plan.name) ? (
                      <p className="text-theme-color-1 font-bold py-3 border-2 rounded-md border-theme-color-1">
                        You are subscribed to this plan
                      </p>
                    ) : (
                      <Button
                        onClick={() =>
                          handlePlanSubscribe(
                            plan.name,
                            meals,
                            price,
                            currentPlanDetails.mealType,
                            currentPlanDetails.carbType,
                            currentPlanDetails.lunchDinner,
                            currentPlanDetails.mealStartDate,
                            currentPlanDetails.allergy
                          )
                        }
                        classes="w-full"
                      >
                        Select
                      </Button>
                    )}
                    {errorMessages[plan.name] && (
                      <p className="mt-1 error text-red-500">
                        {errorMessages[plan.name]}
                      </p>
                    )}
                  </div>
                  <div className="mt-5 pb-4">
                    <ul className="text-left space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckmarkCircleOutline className="text-theme-color-1 mr-2 h-5 w-5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default SubscriptionPlans;
