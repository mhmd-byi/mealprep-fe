import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { useAllRegisteredUsers } from "./useAllRegisteredUsers";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Popup from "../../../components/common/Popup/Popup";
import FilterPopup from "../../../components/common/FilterPopup/FilterPopup";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { calculateSubEndDate } from "../../../subscriptionUtils";

export const AllRegisteredUsers = () => {
  const { allRegisteredUsers, isLoading, planFilter, downloadCSV } = useAllRegisteredUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showZeroMeals, setShowZeroMeals] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    mealCount: '',
    operator: '>'
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  const filteredUsers = allRegisteredUsers.filter(user => {
    // Name/Email search
    const searchMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Meal count totals
    const totalMeals = (user.mealCounts?.lunchMeals || 0) +
                      (user.mealCounts?.nextDayLunchMeals || 0) +
                      (user.mealCounts?.dinnerMeals || 0) +
                      (user.mealCounts?.nextDayDinnerMeals || 0);

    // Toggle: show users with 0 meals
    const presenceMatch = showZeroMeals ? true : totalMeals > 0;

    // Meal count filter (from FilterPopup)
    let mealCountMatch = true;
    if (filterCriteria.mealCount !== '') {
      const targetCount = parseInt(filterCriteria.mealCount);
      if (filterCriteria.operator === '>') mealCountMatch = totalMeals > targetCount;
      else if (filterCriteria.operator === '<') mealCountMatch = totalMeals < targetCount;
      else if (filterCriteria.operator === '=') mealCountMatch = totalMeals === targetCount;
    }

    return searchMatch && mealCountMatch && presenceMatch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue, bValue;
    if (sortConfig.key === 'name') {
      aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
      bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortConfig.key === 'mealCount') {
      aValue = (a.mealCounts?.lunchMeals || 0) + (a.mealCounts?.nextDayLunchMeals || 0) + 
               (a.mealCounts?.dinnerMeals || 0) + (a.mealCounts?.nextDayDinnerMeals || 0);
      bValue = (b.mealCounts?.lunchMeals || 0) + (b.mealCounts?.nextDayLunchMeals || 0) + 
               (b.mealCounts?.dinnerMeals || 0) + (b.mealCounts?.nextDayDinnerMeals || 0);
    } else if (sortConfig.key === 'startDate') {
      const subA = a.subscriptions?.[a.subscriptions.length - 1];
      const subB = b.subscriptions?.[b.subscriptions.length - 1];
      aValue = subA ? new Date(subA.subscriptionStartDate).getTime() : 0;
      bValue = subB ? new Date(subB.subscriptionStartDate).getTime() : 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="inline-block ml-1 w-3 h-3 text-theme-color-1" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline-block ml-1 w-4 h-4 font-bold text-theme-color-1" />
    ) : (
      <ChevronDown className="inline-block ml-1 w-4 h-4 font-bold text-theme-color-1" />
    );
  };

  return (
    <>
      <DashboardLayoutComponent>
      <div className="block flex-col justify-center items-center p-5 w-full lg:flex">
        <div className="px-4 py-6 w-full max-w-full sm:px-6 lg:px-8">
          <div className="flex flex-col mx-auto mt-8 mb-4">
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="flex flex-col p-5">
                <div className="flex flex-row justify-between items-center p-4 mb-4 bg-white rounded-t-lg">
                  <h2 className="text-2xl font-bold">
                    {planFilter ? `${planFilter} Plan Subscribers` : 'All Users'}
                  </h2>
                  <div className="flex flex-col gap-4 items-center sm:flex-row">
                    <SearchBar 
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search name or email..."
                    />
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 shadow-sm transition-colors hover:bg-gray-100">
                      <input 
                        type="checkbox" 
                        checked={showZeroMeals} 
                        onChange={(e) => setShowZeroMeals(e.target.checked)}
                        className="w-4 h-4 rounded text-theme-color-1 focus:ring-theme-color-1 border-gray-300 cursor-pointer"
                        id="showZeroMeals"
                      />
                      <label htmlFor="showZeroMeals" className="text-sm font-semibold text-gray-700 cursor-pointer whitespace-nowrap select-none">
                        Show users with 0 meals
                      </label>
                    </div>
                    <button
                      onClick={() => setShowFilterPopup(true)}
                      className="flex justify-center items-center px-4 py-2 text-sm font-semibold bg-white rounded-md border-2 shadow-sm transition-colors duration-300 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
                    >
                      <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                      </svg>
                      Filter
                    </button>
                    <button
                      onClick={() => downloadCSV(sortedUsers)}
                      type="button"
                      className="flex justify-center items-center px-4 py-2 text-sm font-semibold text-white rounded-md border-2 shadow-sm transition-colors duration-300 bg-theme-color-1 border-theme-color-1 hover:text-theme-color-1 hover:bg-white"
                    >
                      Export to CSV
                    </button>
                  </div>
                </div>
                <div className="flex flex-col w-full text-center">
                  <div className="mt-4 w-full">
                    {isLoading ? (
                      <div className="flex flex-col justify-center items-center py-20">
                        <div className="w-12 h-12 rounded-full border-b-2 animate-spin" style={{ borderColor: '#3c9b62' }}></div>
                        <p className="mt-4 font-medium text-gray-500">Loading user data...</p>
                      </div>
                    ) : sortedUsers.length > 0 ? (
                      <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full text-left divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                              <tr>
                                <th 
                                  className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort('name')}
                                >
                                  Customer Info <SortIcon columnKey="name" />
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
                                <th 
                                  className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort('mealCount')}
                                >
                                  Meal Counts Left <SortIcon columnKey="mealCount" />
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Allergy
                                </th>
                                <th 
                                  className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort('startDate')}
                                >
                                  Meal Start Date <SortIcon columnKey="startDate" />
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                  Est. End Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sortedUsers.map((user, index) => {
                                const latestSub = user.subscriptions && user.subscriptions.length > 0 
                                  ? user.subscriptions[user.subscriptions.length - 1] 
                                  : null;
                                const lunchCount = (latestSub?.lunchMeals || 0) + (latestSub?.nextDayLunchMeals || 0);
                                const dinnerCount = (latestSub?.dinnerMeals || 0) + (latestSub?.nextDayDinnerMeals || 0);
                                const isZeroMeals = lunchCount === 0 && dinnerCount === 0;

                                return (
                                  <tr key={index} className={`hover:bg-gray-100 ${isZeroMeals ? 'bg-red-50' : 'bg-white'}`}>
                                    <td className="px-4 py-4 text-sm font-medium border-b max-w-[250px]">
                                      <div 
                                        className="font-bold break-words cursor-pointer text-theme-color-1 hover:underline"
                                        onClick={() => setSelectedUser(user)}
                                      >
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 break-all">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words">
                                        {user.mobile}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words max-w-[200px]">
                                        {user.postalAddress}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words">
                                        {latestSub?.plan || 'No active plan'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words">
                                        Lunch: {lunchCount}, Dinner: {dinnerCount}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words">
                                        {latestSub?.allergy || 'None'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 border-b">
                                      <div className="break-words">
                                        {latestSub?.subscriptionStartDate?.split('T')[0].split('-').reverse().join('-') || 'N/A'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-bold text-theme-color-1 border-b">
                                      {calculateSubEndDate(user).formattedDate || calculateSubEndDate(user).status}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="space-y-4 md:hidden">
                          {sortedUsers.map((user, index) => {
                            const latestSub = user.subscriptions && user.subscriptions.length > 0 
                              ? user.subscriptions[user.subscriptions.length - 1] 
                              : null;
                            const lunchCount = (latestSub?.lunchMeals || 0) + (latestSub?.nextDayLunchMeals || 0);
                            const dinnerCount = (latestSub?.dinnerMeals || 0) + (latestSub?.nextDayDinnerMeals || 0);
                            const isZeroMeals = lunchCount === 0 && dinnerCount === 0;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border border-gray-200 shadow-sm ${isZeroMeals ? 'bg-red-50' : 'bg-white'}`}
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between pb-2 border-b">
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
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Email:
                                    </span>
                                    <span className="text-gray-900 text-right break-all max-w-[60%]">
                                      {user.email}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Mobile:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      {user.mobile}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Address:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      {user.postalAddress}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Current Plan:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      {latestSub?.plan || 'No active plan'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Meal Counts Left:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      Lunch: {lunchCount}, Dinner: {dinnerCount}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Allergy:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      {latestSub?.allergy || "None"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pb-2 border-b">
                                    <span className="font-medium text-gray-500">
                                      Meal Start Date:
                                    </span>
                                    <span className="text-gray-900 text-right break-words max-w-[60%]">
                                      {latestSub?.subscriptionStartDate ? new Date(latestSub.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-500">
                                      Est. End Date:
                                    </span>
                                    <span className="text-theme-color-1 font-bold text-right break-words max-w-[60%]">
                                      {calculateSubEndDate(user).formattedDate || calculateSubEndDate(user).status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center py-10">
                        <p className="font-medium text-gray-500">No user data found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
    
    <FilterPopup
      isOpen={showFilterPopup}
      onClose={() => setShowFilterPopup(false)}
      criteria={filterCriteria}
      setCriteria={setFilterCriteria}
    />

    <Popup
      isOpen={!!selectedUser}
      onClose={() => setSelectedUser(null)}
      title="User Details"
      content={
        selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
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

            <div className="flex justify-between items-center p-3 mb-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-500">Meal Counts Left</p>
                <p className="text-lg font-bold text-theme-color-1">
                  Lunch: {(selectedUser.mealCounts?.lunchMeals || 0) + (selectedUser.mealCounts?.nextDayLunchMeals || 0)}, 
                  Dinner: {(selectedUser.mealCounts?.dinnerMeals || 0) + (selectedUser.mealCounts?.nextDayDinnerMeals || 0)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-bold">Subscription History</h3>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                  [...selectedUser.subscriptions].reverse().map((sub, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border shadow-sm">
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
                          <div className="col-span-2"><span className="text-gray-500">Allergy:</span> <span className="font-bold text-red-500">{sub.allergy}</span></div>
                        )}
                        <div><span className="text-gray-500">Remaining L:</span> {sub.lunchMeals} (Today) + {sub.nextDayLunchMeals} (Next)</div>
                        <div><span className="text-gray-500">Remaining D:</span> {sub.dinnerMeals} (Today) + {sub.nextDayDinnerMeals} (Next)</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-gray-500">No subscription history found.</p>
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
