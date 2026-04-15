import { useState, useEffect } from "react";
import axios from "axios";
import { sendEmail } from "../../utils";

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const currentDate = getCurrentDate();

  const activityEntry = async (userId, mealPlan) => {
    try {
      const res = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}activity/add-activity`,
        data: {
          userId: userId,
          date: currentDate,
          description: `Subscribed to ${mealPlan}`,
        },
      });
    } catch (e) {
      console.error("Error adding activity:", e);
    }
  };

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
        response.data.isSubscribed && setCurrentPlan(response.data.subscription);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  const handleSubscribe = async (
    planName,
    mealCount,
    price,
    mealType,
    carbType,
    lunchDinner,
    mealStartDate,
    allergy,
    setErrorMessage,
  ) => {
    if (isSubscribed) {
      setErrorMessage(
        `Your current subscription still has meals left. You can purchase a new plan once the remaining meals become 0.`
      );
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    const userName = sessionStorage.getItem("userName");
    const userEmail = sessionStorage.getItem("email");

    try {
      const orderResponse = await axios({
        method: "POST",
        url: `${process.env.REACT_APP_API_URL}subscription/create-order`,
        data: {
          amount: price,
          userId,
          plan: planName,
          meals: mealCount,
          mealType,
          carbType,
          lunchDinner,
          mealStartDate,
          allergy,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "Meal Subscription",
        description: `Subscribe to ${planName}`,
        order_id: orderResponse.data.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await axios({
              method: "POST",
              url: `${process.env.REACT_APP_API_URL}subscription/verify-payment`,
              data: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                plan: planName,
                startDate: new Date().toISOString(),
                meals: mealCount,
                mealType,
                carbType,
                lunchDinner,
                mealStartDate,
                allergy,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (verifyResponse.status === 201) {
              activityEntry(userId, planName);

              // Notification to Customer
              sendEmail(userId, "", "Your Mealprep Subscription is Confirmed!", `Dear Customer,\n
                Thank you for subscribing to our ${planName}! 🥗 Your healthy meals are now taken care of.\n
                  Important Information:\n
                  ✅ Mealprep Kitchen operates from Monday to Saturday.\n
                  ✅ Meal Cancellation & Customization Requests:\n
                  Lunch: 12 Midnight – 11:00 AM\n
                  Dinner: 12 Midnight – 4:30 PM\n
                  For any assistance, feel free to reach out.\n
                  Wishing you a delicious and healthy journey!\n\n
                  Team Mealprep\n
                `);

              // Detailed Notification to Admin
              sendEmail("ermoinzafarsheikh@hotmail.com", "Admin", `New Subscription: ${userName}`, `A new subscription has been received!\n
                --- CUSTOMER DETAILS ---
                Name: ${userName}
                Email: ${userEmail}
                User ID: ${userId}

                --- SUBSCRIPTION DETAILS ---
                Plan: ${planName}
                Meals Total: ${mealCount}
                Meal Type: ${mealType}
                Carb Type: ${carbType}
                Preference: ${lunchDinner}
                Start Date: ${mealStartDate}
                Allergy Info: ${allergy || "None"}
                
                Please update the system accordingly.
                `);

              setIsSubscribed(true);
              setCurrentPlan({
                plan: planName,
                subscriptionStartDate: mealStartDate,
                subscriptionEndDate: new Date().setDate(
                  new Date().getDate() + (planName === "Weekly Plan" ? 7 : 30)
                ),
              });
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 5000);
              // window.location.reload();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setErrorMessage("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#3C9B62",
        },
        modal: {
          ondismiss: function () {
            setErrorMessage("Payment cancelled. Please try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        setErrorMessage("Payment failed. Please try again.");
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      setErrorMessage("Unable to initiate payment. Please try again later.");
    }
  };

  const isSubscribedTo = (planName) => {
    return (
      currentPlan &&
      currentPlan.plan === planName &&
      (currentPlan?.totalAvailableMeals ?? currentPlan?.totalMeals ?? 0) > 0
    );
  };

  return {
    isSubscribed,
    handleSubscribe,
    isSubscribedTo,
    currentPlan,
    isLoading,
  };
};

export default useSubscription;
