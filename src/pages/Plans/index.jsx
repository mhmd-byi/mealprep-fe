import React, { useState } from "react";
import { Button } from "../../components";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import data from "./data.json";
import { useSubscription } from "./useSubscription";

const SubscriptionPlans = () => {
  const { plans } = data;
  const { handleSubscribe, isSubscribedTo } = useSubscription();
  const [errorMessages, setErrorMessages] = useState({});
  const [additionalDetails, setAdditionalDetails] = useState({
    mealType: 'veg',
    carbType: 'low',
    lunchDinner: 'lunch',
  });

  const handlePlanSubscribe = (planName, mealCount, price, mealType, carbType, lunchDinner) => {
    handleSubscribe(planName, mealCount, price, mealType, carbType, lunchDinner, (message) => {
      setErrorMessages({ ...errorMessages, [planName]: message });
    });
  };

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full lg:h-full my-auto">
        <div className="bg-white shadow-md rounded px-4 lg:px-14 py-4 w-fit lg:max-w-[1500px] lg:w-[1200px]">
          <h3 className="text-2xl lg:text-3xl text-black text-center">
            Subscribe Your Meal Plans
          </h3>
        </div>
        <div className="lg:bg-white shadow-md rounded-lg p-0 lg:p-20 flex flex-col lg:flex-row gap-4 lg:gap-0 max-w-[1500px] lg:w-[1200px] mt-7">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white border-b-2 border-grey-500 pt-5 pb-5 lg:pt-0 rounded-lg lg:rounded-none lg:pb-0 px-4 lg:border-b-0 lg:border-r-2 border-grey-500 flex-1 ${
                index === plans.length - 1 ? "lg:border-r-0" : ""
              }`}
            >
              <div className="pb-5">
                <h2 className="text-2xl font-medium pb-2 border-b-2 border-grey-500">
                  {plan.name}
                </h2>
                <h1 className="text-4xl text-black font-bold mt-2">
                  ₹{plan.price}
                </h1>
                <p className="mt-4 mb-4">
                  {plan.description} <br />
                  Valid for {plan.duration}
                </p>
                <div className="flex flex-col space-y-4 justify-between items-center mb-4">
                  <div className="flex items-center">
                    <label className="mr-2">Meal Type:</label>
                    <select
                      className="border-2 border-grey-500 rounded-md p-1"
                      onChange={(e) =>
                        setAdditionalDetails({
                          ...additionalDetails,
                          mealType: e.target.value,
                        })
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
                      onChange={(e) =>
                        setAdditionalDetails({
                          ...additionalDetails,
                          lunchDinner: e.target.value,
                        })
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
                      onChange={(e) =>
                        setAdditionalDetails({
                          ...additionalDetails,
                          carbType: e.target.value,
                        })
                      }
                    >
                      <option value="low">Low Carb</option>
                      <option value="high">High Carb</option>
                    </select>
                  </div>
                </div>
                {isSubscribedTo(plan.name) ? (
                  <p className="text-theme-color-1 font-bold py-3 border-2 rounded-md border-theme-color-1">
                    You are subscribed to this plan
                  </p>
                ) : (
                  <Button
                    onClick={() => handlePlanSubscribe(plan.name, plan.meals, plan.price, additionalDetails.mealType, additionalDetails.carbType, additionalDetails.lunchDinner)}
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
              <div className="mt-5">
                <ul className="text-left space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg
                        width="16"
                        height="16"
                        className="mr-2"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.46732 7.53333C6.20065 7.26666 5.80065 7.26666 5.53398 7.53333C5.26732 7.8 5.26732 8.2 5.53398 8.46666L7.53398 10.4667C7.66732 10.6 7.80065 10.6667 8.00065 10.6667C8.20065 10.6667 8.33398 10.6 8.46732 10.4667L13.134 5.13333C13.334 4.8 13.334 4.4 13.0007 4.2C12.734 4 12.334 4 12.134 4.26666L8.00065 9L6.46732 7.53333Z"
                          fill="#3C9B62"
                        />
                        <path
                          d="M14.0007 7.33331C13.6006 7.33331 13.334 7.59998 13.334 7.99998C13.334 10.9333 10.934 13.3333 8.00065 13.3333C5.06732 13.3333 2.66732 10.9333 2.66732 7.99998C2.66732 6.59998 3.20065 5.26665 4.20065 4.26665C5.20065 3.19998 6.53398 2.66665 8.00065 2.66665C8.40065 2.66665 8.86732 2.73331 9.26732 2.79998C9.60065 2.93331 10.0007 2.73331 10.134 2.33331C10.2673 1.93331 10.0007 1.66665 9.66732 1.53331H9.60065C9.06732 1.39998 8.53398 1.33331 8.00065 1.33331C4.33398 1.33331 1.33398 4.33331 1.33398 8.06665C1.33398 9.79998 2.06732 11.5333 3.26732 12.7333C4.53398 14 6.20065 14.6666 7.93398 14.6666C11.6006 14.6666 14.6006 11.6666 14.6006 7.99998C14.6673 7.59998 14.334 7.33331 14.0007 7.33331Z"
                          fill="#3C9B62"
                        />
                      </svg>
                      {feature}
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

export default SubscriptionPlans;