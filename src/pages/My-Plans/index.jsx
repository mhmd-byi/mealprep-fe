import React, { useState, useEffect } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import useSubscription from "../Plans/useSubscription";
import axios from "axios";

export const MyPlan = () => {
  const [activePlan, setActivePlan] = useState(null);
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    const fetchActivePlan = async () => {
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
        setActivePlan(response.data.subscription);
      } catch (error) {
        console.error("Error fetching active plan:", error);
      }
    };

    if (isSubscribed) {
      fetchActivePlan();
    }
  }, [isSubscribed]);

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full lg:h-full my-auto">
        <div className="bg-white shadow-md rounded px-4 lg:px-14 py-4 w-fit lg:max-w-[1500px] lg:w-[1200px]">
          <h3 className="text-2xl lg:text-3xl text-black text-center">
            My Active Subscription Plan
          </h3>
        </div>
        {isSubscribed && activePlan ? (
          <div className="mt-7 bg-white shadow-md rounded-lg p-6 max-w-[1500px] lg:w-[1200px]">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2">Plan Name</th>
                  <th className="text-left py-2">Start Date</th>
                  <th className="text-left py-2">End Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-left">
                  <td className="py-2">{activePlan.plan}</td>
                  <td className="py-2">
                    {new Date(activePlan.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    {new Date(
                      activePlan.subscriptionEndDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-7 bg-white shadow-md rounded-lg p-6 max-w-[1500px] lg:w-[1200px]">
            <p className="text-center text-gray-600">
              You don't have any active subscription plans.
            </p>
          </div>
        )}
      </div>
    </DashboardLayoutComponent>
  );
};
