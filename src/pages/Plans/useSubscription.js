import axios from "axios";

export const useSubscription = () => {
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
    handleSubscribe,
  };
};
