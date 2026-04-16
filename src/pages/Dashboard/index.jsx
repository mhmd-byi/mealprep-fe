import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { HeroSlider } from "./slider";
import { Services } from "./services";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import { Data } from "./data";
import { AdminServices } from "./adminServices";
export const DashboardPage = () => {
  const { userDetails, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <DashboardLayoutComponent>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-theme-color-1"></div>
        </div>
      </DashboardLayoutComponent>
    );
  }

  return (
    <DashboardLayoutComponent>
      {userDetails.role !== "admin" && <HeroSlider />}
      {userDetails.role === "admin" && <Data />}
      {userDetails.role === "admin" ? <AdminServices /> : <Services />}
    </DashboardLayoutComponent>
  );
};
