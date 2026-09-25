import { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { HeroSlider } from "./slider";
import { Services } from "./services";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import { Data } from "./data";
import { AdminServices } from "./adminServices";
import { FinanceDashboardContent } from "../Admin/Finance-Dashboard";

const MonetaryDashboardSection = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="px-4 mb-8">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setIsVisible((v) => !v)}
          className="px-4 py-2 text-sm font-semibold bg-white rounded-md border-2 shadow-sm text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
        >
          {isVisible ? "Hide Monetary Dashboard" : "Show Monetary Dashboard"}
        </button>
      </div>
      <div hidden={!isVisible}>
        <FinanceDashboardContent />
      </div>
    </div>
  );
};

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
      {userDetails.role === "admin" && <MonetaryDashboardSection />}
      {userDetails.role === "admin" ? <AdminServices /> : <Services />}
    </DashboardLayoutComponent>
  );
};
