import { useState, useEffect } from "react";
import axios from "axios";

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}user/${userId}/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsSubscribed(response.data.isSubscribed);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleSubscribe = (planName) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    try {
      axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}user/${userId}/subscription`,
        data: {
          userId,
          plan: planName,
          startDate: new Date().toISOString(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("res", res);
          setIsSubscribed(true);
        })
        .catch((err) => {
          console.log("this is err", err);
        });

      alert(`You are now subscribed to the ${planName}!`);
    } catch (error) {
      console.error("Error subscribing:", error);
      alert(
        "Subscription failed: Unable to connect to the server. Please try again later."
      );
    }
  };

  return {
    isSubscribed,
    handleSubscribe,
  };
};

export default useSubscription;
