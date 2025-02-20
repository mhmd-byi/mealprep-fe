import { useData } from "./useData";

export const Data = () => {
  const { allRegisteredUsersCount, cancelledMealsCount, mealDeliveryListCountDinner, mealDeliveryListCountLunch, customisationRequestCount } = useData();

  return (
    <div className="px-4 my-16 lg:mt-4">
      <section className="mb-6 flex justify-center">
        <div className="bg-[#D5ECDB] p-3 rounded-lg w-fit">
          <p className="text-2xl sm:text-xl">Today's Stats</p>
        </div>
      </section>
      
      {/* Table view for medium and larger screens */}
      <section className="p-8 gap-10 hidden md:flex flex-col items-center justify-center rounded-lg bg-white border-2 border-theme-color-1 shadow-sm transition-all duration-300 hover:shadow-md hover:border-theme-color-2">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 text-center">
            <tr>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">All Registered Users</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Delivery count</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Customised request</th>
              <th className="px-6 py-3 text-md font-medium text-gray-500 uppercase tracking-wider">Cancelled request</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{allRegisteredUsersCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">Lunch: {mealDeliveryListCountLunch} <br />Dinner: {mealDeliveryListCountDinner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{customisationRequestCount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{cancelledMealsCount}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Card view for mobile screens */}
      <section className="md:hidden space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">All Registered Users</h3>
          <p className="text-xl font-semibold text-gray-900">{allRegisteredUsersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Delivery Count</h3>
          <div className="space-y-1">
            <p className="text-gray-900">
              <span className="font-medium">Lunch:</span> {mealDeliveryListCountLunch}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Dinner:</span> {mealDeliveryListCountDinner}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Customised Request</h3>
          <p className="text-xl font-semibold text-gray-900">{customisationRequestCount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-theme-color-1 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Cancelled Request</h3>
          <p className="text-xl font-semibold text-gray-900">{cancelledMealsCount}</p>
        </div>
      </section>
    </div>
  );
};
