import { useState, useEffect } from "react";
import axios from "axios";

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}subscription/${userId}/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsSubscribed(response.data.isSubscribed);
        setCurrentPlan(response.data.subscription);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleSubscribe = async (planName, mealCount, setErrorMessage) => {
    if (isSubscribed) {
      setErrorMessage(
        `You already have an active plan. Please wait until ${currentPlan.plan} expires to subscribe to a new one.`
      );
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    try {
      const res = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}subscription/${userId}/subscription`,
        data: {
          userId,
          plan: planName,
          startDate: new Date().toISOString(),
          meals: mealCount,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsSubscribed(true);
      setCurrentPlan({
        plan: planName,
        subscriptionEndDate: new Date().setDate(
          new Date().getDate() + res.data.duration
        ),
      });
      window.location.reload();
    } catch (error) {
      console.error("Error subscribing:", error);
      alert(
        "Subscription failed: Unable to connect to the server. Please try again later."
      );
    }
  };

  const isSubscribedTo = (planName) => {
    return (
      currentPlan &&
      currentPlan.plan === planName &&
      new Date(currentPlan.subscriptionEndDate) > new Date()
    );
  };

  return {
    isSubscribed,
    handleSubscribe,
    isSubscribedTo,
    currentPlan,
  };
};

export default useSubscription;