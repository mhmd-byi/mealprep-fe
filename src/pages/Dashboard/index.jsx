import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { HeroSlider } from "./slider";
import { Services } from "./services";
export const DashboardPage = () => {
  return (
    <DashboardLayoutComponent showSidebar={false}>
      <HeroSlider />
      <Services />
    </DashboardLayoutComponent>
  );
};
