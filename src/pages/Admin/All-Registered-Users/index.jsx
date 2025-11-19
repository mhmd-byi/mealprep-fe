"use client";

import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useAllRegisteredUsers } from "./useAllRegisteredUsers";

export const AllRegisteredUsers = () => {
  const { allRegisteredUsers, downloadCSV } = useAllRegisteredUsers();
  console.log('all registered users', allRegisteredUsers)

  return (
    <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full">
        <div className="w-full max-w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mx-auto mt-8 mb-4">
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col p-5">
                <div className="flex flex-row justify-between items-center mb-4 p-4 bg-white rounded-t-lg">
                  <h2 className="text-2xl font-bold">All Users</h2>
                  <button
                    onClick={() => downloadCSV(allRegisteredUsers)}
                    type="button"
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-theme-color-1 shadow-sm border-2 border-theme-color-1 hover:text-theme-color-1 hover:bg-white text-white transition-colors duration-300"
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="flex flex-col text-center w-full">
                  <div className="mt-4 w-full">
                    {allRegisteredUsers.length > 0 ? (
                      <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full divide-y divide-gray-200 dark:divide-neutral-700 text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Mobile
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Address
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Current Plan
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Meal Counts
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Meal Start Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {allRegisteredUsers.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    <div className="break-words">
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {user.email}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {user.mobile}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words max-w-[200px]">
                                      {user.postalAddress}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {user.subscriptions[user.subscriptions.length - 1]?.plan || 'No active plan'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {/* Lunch: {(user.mealCounts.lunchMeals || 0 + user.mealCounts.nextDayLunchMeals || 0)}, Dinner: {(user.mealCounts.dinnerMeals || 0 + user.mealCounts.nextDayDinnerMeals || 0)} */}
                                      Lunch: {user.subscriptions[user.subscriptions.length - 1]?.lunchMeals || 0 + user.subscriptions[user.subscriptions.length - 1]?.nextDayLunchMeals || 0}, Dinner: {user.subscriptions[user.subscriptions.length - 1]?.dinnerMeals || 0 + user.subscriptions[user.subscriptions.length - 1]?.nextDayDinnerMeals || 0}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words">
                                      {user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate.split('T')[0].split('-').reverse().join('-') || 'N/A'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                          {allRegisteredUsers.map((user, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Name:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.firstName} {user.lastName}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Email:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.email}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Mobile:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.mobile}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Address:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.postalAddress}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Current Plan:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.subscriptions[user.subscriptions.length - 1]?.plan || 'No active plan'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">
                                    Meal Counts:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    Lunch: {user.mealCounts.lunchMeals || 0}, Dinner: {user.mealCounts.dinnerMeals || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-4 text-gray-500">
                        No user data found
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
