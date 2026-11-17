import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const useTrackingSummary = (userId) =>
  useQuery({
    queryKey: ["tracking-summary", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      (
        await axios.get(`${process.env.REACT_APP_API_URL}activity/${userId}/summary`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        })
      ).data,
  });

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const trackingTiles = (summary) => {
  if (!summary) {
    const empty = { value: "—", note: "" };
    return { delivered: empty, cancelled: empty, holidays: empty, completion: empty };
  }

  const { monthLabel, delivered, cancelled, holidays, plan } = summary;
  return {
    delivered: { value: delivered.total, note: `meals in ${monthLabel}` },
    cancelled: { value: cancelled.meals, note: `meals over ${plural(cancelled.days, "day")} in ${monthLabel}` },
    holidays: { value: holidays.days, note: `${holidays.days === 1 ? "day" : "days"} in ${monthLabel}` },
    completion: {
      value: plan.percent === null ? "—" : `${plan.percent}%`,
      note: plan.percent === null ? "" : `${plan.consumed} of ${plural(plan.total, "meal")}`,
    },
  };
};
