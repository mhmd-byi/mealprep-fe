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
  
  // Create separate state for each plan's details
  const [planDetails, setPlanDetails] = useState(
    plans.reduce((acc, plan) => ({
      ...acc,
      [plan.name]: {
        mealType: 'veg',
        carbType: 'low-carb-high-protein',
        lunchDinner: 'lunch',
      }
    }), {})
  );

  const getAdjustedPlanDetails = (plan) => {
    const multiplier = planDetails[plan.name].lunchDinner === 'lunchAndDinner' ? 2 : 1;
    return {
      price: plan.price * multiplier,
      meals: plan.meals * multiplier,
      duration: plan.duration.replace(/\d+/g, (match) => parseInt(match) * multiplier)
    };
  };

  const handlePlanSubscribe = (planName, mealCount, price, mealType, carbType, lunchDinner) => {
    const plan = plans.find(p => p.name === planName);
    const { price: adjustedPrice, meals: adjustedMeals } = getAdjustedPlanDetails(plan);
    
    handleSubscribe(
      planName, 
      adjustedMeals, 
      adjustedPrice, 
      mealType, 
      carbType, 
      lunchDinner, 
      (message) => {
        setErrorMessages({ ...errorMessages, [planName]: message });
      }
    );
  };

  const handleDetailChange = (planName, field, value) => {
    setPlanDetails(prev => ({
      ...prev,
      [planName]: {
        ...prev[planName],
        [field]: value
      }
    }));
  };

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full lg:h-full my-auto">
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
                  className={`bg-white border-b-2 border-grey-500 pt-5 pb-5 lg:pt-0 rounded-lg lg:rounded-none lg:pb-0 px-4 lg:border-b-0 lg:border-r-2 border-grey-500 flex-1 ${
                    index === plans.length - 1 ? "lg:border-r-0" : ""
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
                          onChange={(e) => handleDetailChange(plan.name, 'mealType', e.target.value)}
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
                          onChange={(e) => handleDetailChange(plan.name, 'lunchDinner', e.target.value)}
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
                          onChange={(e) => handleDetailChange(plan.name, 'carbType', e.target.value)}
                        >
                          <option value="low-carb-high-protein">Low Carb High Protein Meal</option>
                          <option value="balanced-meal">Balanced Meal</option>
                          <option value="high-carb-high-protein">High Carb High Protein Meal</option>
                          <option value="zero-carb">Zero Carb Meal</option>
                          <option value="keto-meal">Keto Meal</option>
                        </select>
                      </div>
                    </div>
                    {isSubscribedTo(plan.name) ? (
                      <p className="text-theme-color-1 font-bold py-3 border-2 rounded-md border-theme-color-1">
                        You are subscribed to this plan
                      </p>
                    ) : (
                      <Button
                        onClick={() => handlePlanSubscribe(
                          plan.name,
                          meals,
                          price,
                          currentPlanDetails.mealType,
                          currentPlanDetails.carbType,
                          currentPlanDetails.lunchDinner
                        )}
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
