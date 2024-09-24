import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";

export const UserListWithCancelRequest = () => {
  const [cancelledMeals, setCancelledMeals] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCancelledMeals = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching cancelled meals...");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}subscription/cancelled-meals`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        
        console.log("Raw server response:", JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} cancelled meals`);
          setCancelledMeals(response.data);
          setError(null);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Received unexpected data format from server.");
          setCancelledMeals([]);
        }
      } catch (error) {
        console.error("Error fetching cancelled meals:", error);
        setError(`Failed to fetch cancelled meals: ${error.response?.data?.message || error.message}`);
        setCancelledMeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCancelledMeals();
  }, []);

  console.log("Current cancelledMeals state:", cancelledMeals);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <DashboardLayoutComponent>
        <div className="p-5">
          <p>Loading cancelled meals...</p>
        </div>
      </DashboardLayoutComponent>
    );
  }

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="min-w-[300px] md:min-w-[600px] lg:min-w-[900px] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Cancelled Meals</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      {cancelledMeals.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Id
                              </th>
                              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Meal Type
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {cancelledMeals.map((meal, index) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {meal.userId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {meal.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(meal.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                  {meal.mealType}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center py-4">No cancelled meals found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};