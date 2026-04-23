import { useState, useEffect } from "react";
import axios from "axios";
import { sendEmail } from "../../utils";

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [nextPlan, setNextPlan] = useState(null);
  const [hasQueuedPlan, setHasQueuedPlan] = useState(false);
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
        if (response.data.isSubscribed) {
          // Prefer the explicit currentPlan key; fall back to legacy 'subscription' key
          setCurrentPlan(response.data.currentPlan || response.data.subscription);
        }
        if (response.data.nextPlan) {
          setNextPlan(response.data.nextPlan);
          setHasQueuedPlan(true);
        } else {
          setNextPlan(null);
          setHasQueuedPlan(false);
        }
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
    // Block if a queued plan already exists — only 1 plan can be queued at a time
    if (hasQueuedPlan) {
      setErrorMessage(
        `You already have a plan queued up. It will activate once your current plan finishes.`
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
              const isQueued = verifyResponse.data?.isQueued || false;
              activityEntry(userId, planName);

              if (isQueued) {
                // Notification to Customer — queued plan
                sendEmail(userId, "", "Your Next Mealprep Plan is Queued!", `Dear Customer,\n
Thank you for subscribing to our ${planName}! 🥗\n
Your current plan is still active — this new plan has been queued and will activate automatically once your current meals run out.\n\n
Team Mealprep\n`);

                // Notification to Admin
                sendEmail("ermoinzafarsheikh@hotmail.com", "Admin", `Queued Subscription: ${userName}`, `A new subscription has been queued!\n
--- CUSTOMER DETAILS ---
Name: ${userName}\nEmail: ${userEmail}\nUser ID: ${userId}\n
--- QUEUED SUBSCRIPTION DETAILS ---
Plan: ${planName}\nMeals Total: ${mealCount}\nMeal Type: ${mealType}\nCarb Type: ${carbType}\nPreference: ${lunchDinner}\nStart Date: ${mealStartDate}\nAllergy Info: ${allergy || "None"}\n
This plan is QUEUED and will activate when the user's current plan runs out.`);

                setHasQueuedPlan(true);
                setNextPlan({
                  plan: planName,
                  totalMeals: mealCount,
                  mealType,
                  carbType,
                  status: 'queued'
                });
                setTimeout(() => {
                  window.location.href = "/dashboard/my-billing";
                }, 3000);
              } else {
                // Notification to Customer — active plan
                sendEmail(userId, "", "Your Mealprep Subscription is Confirmed!", `Dear Customer,\n
Thank you for subscribing to our ${planName}! 🥗 Your healthy meals are now taken care of.\n
Important Information:\n
✅ Mealprep Kitchen operates from Monday to Saturday.\n
✅ Meal Cancellation & Customization Requests:\nLunch: 12 Midnight – 11:00 AM\nDinner: 12 Midnight – 4:30 PM\n
For any assistance, feel free to reach out.\nWishing you a delicious and healthy journey!\n\n
Team Mealprep\n`);

                // Detailed Notification to Admin
                sendEmail("ermoinzafarsheikh@hotmail.com", "Admin", `New Subscription: ${userName}`, `A new subscription has been received!\n
--- CUSTOMER DETAILS ---
Name: ${userName}\nEmail: ${userEmail}\nUser ID: ${userId}\n
--- SUBSCRIPTION DETAILS ---
Plan: ${planName}\nMeals Total: ${mealCount}\nMeal Type: ${mealType}\nCarb Type: ${carbType}\nPreference: ${lunchDinner}\nStart Date: ${mealStartDate}\nAllergy Info: ${allergy || "None"}\n
Please update the system accordingly.`);

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
              }
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

  // isSubscribedTo: returns true only if this plan is the currently ACTIVE plan (not queued)
  const isSubscribedTo = (planName) => {
    return (
      currentPlan &&
      currentPlan.plan === planName &&
      currentPlan.status !== 'queued' &&
      (currentPlan?.totalAvailableMeals ?? currentPlan?.totalMeals ?? 0) > 0
    );
  };

  // isQueuedTo: returns true if this plan is saved as the next (queued) plan
  const isQueuedTo = (planName) => {
    return nextPlan && nextPlan.plan === planName;
  };

  return {
    isSubscribed,
    handleSubscribe,
    isSubscribedTo,
    isQueuedTo,
    currentPlan,
    nextPlan,
    hasQueuedPlan,
    isLoading,
  };
};

export default useSubscription;
