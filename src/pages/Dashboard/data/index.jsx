import { useData } from "./useData";

export const Data = () => {
  const { allRegisteredUsersCount, cancelledMealsCount, mealDeliveryListCountDinner, mealDeliveryListCountLunch, customisationRequestCount } = useData();
  return (
    <div className="px-4 my-16 lg:mt-0">
      <section className="mb-6 flex justify-center">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Today's Stats</p>
        </div>
      </section>
      <section className="p-8 gap-10 flex flex-col items-center justify-center rounded-lg bg-white border-2 border-theme-color-1 shadow-sm transition-all duration-300 hover:shadow-md hover:border-theme-color-2">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700 hidden md:table" >
          <thead className="bg-gray-50 text-center">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">All Registered Users</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery count</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customised request</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled request</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allRegisteredUsersCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Lunch: {mealDeliveryListCountLunch} <br />Dinner: {mealDeliveryListCountDinner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customisationRequestCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cancelledMealsCount}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};
