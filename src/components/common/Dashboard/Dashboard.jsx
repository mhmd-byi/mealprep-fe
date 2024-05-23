import Header from "../Header";
import Sidebar from "../Sidebar/Sidebar";


const DashboardLayoutComponent = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 items-center justify-center overflow-auto bg-theme-bg-2 bg-no-repeat bg-cover">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutComponent;
