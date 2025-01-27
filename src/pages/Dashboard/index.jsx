import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { HeroSlider } from "./slider";
import { Services } from "./services";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import { Data } from "./data";
export const DashboardPage = () => {
  const { userDetails } = useDashboard();
  return (
    <DashboardLayoutComponent>
      {userDetails.role !== "admin" && <HeroSlider />}
      {userDetails.role === "admin" && <Data />}
      <Services />
    </DashboardLayoutComponent>
  );
};
