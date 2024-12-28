"use client";

import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useAllRegisteredUsers } from "./useAllRegisteredUsers";

export const AllRegisteredUsers = () => {
  const { allRegisteredUsers, downloadCSV } = useAllRegisteredUsers();

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="min-w-[300px] md:min-w-[600px] lg:min-w-[900px] py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mx-auto mt-48 mb-4">
          <div className="flex flex-row justify-between mb-4">
          <h2 className="text-2xl font-bold">All Users</h2>
          <button
            onClick={() => downloadCSV(allRegisteredUsers)}
            type="button"
            className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-theme-color-1 shadow-sm border-2 border-theme-color-1 hover:text-theme-color-1 hover:bg-white text-white transition-colors duration-300"
          >
            Export to CSV
          </button>
          </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col">
                <div className="flex flex-col p-5 text-center min-w-full">
                  <div className="mt-4 overflow-x-auto">
                    {allRegisteredUsers.length > 0 ? (
                      <div className="min-w-full">
                        {/* Desktop View */}
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left hidden md:table">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mobile
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                              </th>
                              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Meal Counts
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allRegisteredUsers.map((user, index) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.mobile}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.postalAddress}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Lunch: {user.mealCounts.lunchMeals || 0}, Dinner: {user.mealCounts.dinnerMeals || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                          {allRegisteredUsers.map((meal, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Name:
                                  </span>
                                  <span className="text-gray-900">
                                    {meal.name}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Email:
                                  </span>
                                  <span className="text-gray-900">
                                    {meal.email}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">
                                    Address:
                                  </span>
                                  <span className="text-gray-900 text-right">
                                    {meal.address}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        No meal delivery data found
                      </p>
                    )}
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
