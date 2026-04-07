import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useAllRegisteredUsers } from "./useAllRegisteredUsers";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";

export const AllRegisteredUsers = () => {
  const { allRegisteredUsers, downloadCSV } = useAllRegisteredUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = allRegisteredUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <DashboardLayoutComponent>
      <div className="block lg:flex flex-col justify-center items-center p-5 w-full">
        <div className="w-full max-w-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mx-auto mt-8 mb-4">
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <div className="flex flex-col p-5">
                <div className="flex flex-row justify-between items-center mb-4 p-4 bg-white rounded-t-lg">
                  <h2 className="text-2xl font-bold">All Users</h2>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <SearchBar 
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search name or email..."
                    />
                    <button
                      onClick={() => downloadCSV(filteredUsers)}
                      type="button"
                      className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-theme-color-1 shadow-sm border-2 border-theme-color-1 hover:text-theme-color-1 hover:bg-white text-white transition-colors duration-300"
                    >
                      Export to CSV
                    </button>
                  </div>
                </div>
                <div className="flex flex-col text-center w-full">
                  <div className="mt-4 w-full">
                    {filteredUsers.length > 0 ? (
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
                                  Meal Counts Left
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Allergy
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Meal Start Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredUsers.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-4 py-4 text-sm font-medium border-b">
                                    <div 
                                      className="break-words cursor-pointer text-theme-color-1 hover:underline"
                                      onClick={() => setSelectedUser(user)}
                                    >
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
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      Lunch: {(user.subscriptions[user.subscriptions.length - 1]?.lunchMeals || 0) + (user.subscriptions[user.subscriptions.length - 1]?.nextDayLunchMeals || 0)}, Dinner: {(user.subscriptions[user.subscriptions.length - 1]?.dinnerMeals || 0) + (user.subscriptions[user.subscriptions.length - 1]?.nextDayDinnerMeals || 0)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      {user.subscriptions[user.subscriptions.length - 1]?.allergy || 'None'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                    <div className="break-words">
                                      {user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate?.split('T')[0].split('-').reverse().join('-') || 'N/A'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                          {filteredUsers.map((user, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Name:
                                  </span>
                                  <span 
                                    className="text-theme-color-1 cursor-pointer hover:underline text-right break-words max-w-[60%]"
                                    onClick={() => setSelectedUser(user)}
                                  >
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
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Meal Counts Left:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    Lunch: {(user.subscriptions[user.subscriptions.length - 1]?.lunchMeals || 0) + (user.subscriptions[user.subscriptions.length - 1]?.nextDayLunchMeals || 0)}, Dinner: {(user.subscriptions[user.subscriptions.length - 1]?.dinnerMeals || 0) + (user.subscriptions[user.subscriptions.length - 1]?.nextDayDinnerMeals || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="font-medium text-gray-500">
                                    Allergy:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {user.subscriptions[user.subscriptions.length - 1]?.allergy || "None"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-500">
                                    Meal Start Date:
                                  </span>
                                  <span className="text-gray-900 text-right break-words max-w-[60%]">
                                    {new Date(user.subscriptions[user.subscriptions.length - 1]?.subscriptionStartDate).toLocaleDateString()}
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
    
    <Popup
      isOpen={!!selectedUser}
      onClose={() => setSelectedUser(null)}
      title="User Details"
      content={
        selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-semibold">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Mobile</p>
                <p className="font-semibold">{selectedUser.mobile}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Address</p>
                <p className="font-semibold">{selectedUser.postalAddress}</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
              <div>
                <p className="text-gray-500">Meal Counts Left</p>
                <p className="font-bold text-lg text-theme-color-1">
                  Lunch: {(selectedUser.mealCounts?.lunchMeals || 0) + (selectedUser.mealCounts?.nextDayLunchMeals || 0)}, 
                  Dinner: {(selectedUser.mealCounts?.dinnerMeals || 0) + (selectedUser.mealCounts?.nextDayDinnerMeals || 0)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Subscription History</h3>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                  [...selectedUser.subscriptions].reverse().map((sub, i) => (
                    <div key={i} className="border p-3 rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between font-bold text-theme-color-1">
                        <span>{sub.plan}</span>
                        <span>₹{sub.price}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div><span className="text-gray-500">Status:</span> <span className={`${sub.status === 'Active' ? 'text-green-600' : 'text-gray-600'} font-bold`}>{sub.status}</span></div>
                        <div><span className="text-gray-500">Date:</span> {new Date(sub.subscriptionStartDate).toLocaleDateString()}</div>
                        <div><span className="text-gray-500">Meals:</span> {sub.mealType?.charAt(0).toUpperCase() + sub.mealType?.slice(1)}</div>
                        <div><span className="text-gray-500">Carbs:</span> {sub.carbType?.charAt(0).toUpperCase() + sub.carbType?.slice(1)}</div>
                        {sub.allergy && (
                          <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="text-red-500 font-bold">{sub.allergy}</span></div>
                        )}
                        <div><span className="text-gray-500">Remaining L:</span> {sub.lunchMeals} (Today) + {sub.nextDayLunchMeals} (Next)</div>
                        <div><span className="text-gray-500">Remaining D:</span> {sub.dinnerMeals} (Today) + {sub.nextDayDinnerMeals} (Next)</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No subscription history found.</p>
                )}
              </div>
            </div>
          </div>
        )
      }
      buttons={[
        {
          label: "Close",
          onClick: () => setSelectedUser(null),
          className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      ]}
    />
    </>
  );
};
