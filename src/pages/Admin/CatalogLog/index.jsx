import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { CatalogLogList } from "./CatalogLogList";

export const CatalogLog = () => (
  <DashboardLayoutComponent>
    <div className="p-4 w-full text-left sm:p-6 md:p-8">
      <div className="mx-auto space-y-6 w-full max-w-5xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalogue Log</h2>
          <p className="text-sm text-gray-500">
            Every change to plans, À la carte products, categories, delivery slots and carb types: what changed, the old and new values, who did it and when. Entries cannot be edited or deleted.
          </p>
        </div>
        <CatalogLogList />
      </div>
    </div>
  </DashboardLayoutComponent>
);

export default CatalogLog;
