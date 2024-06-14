import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header";
import { ProtectedRoute } from "../../security/protectedRoute";
import { Footer } from "../footer";

const DashboardLayoutComponent = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div
          className={`flex flex-1 overflow-hidden ${
            isSidebarOpen ? "bg-gray-900 bg-opacity-50" : ""
          }`}
        >
          <div
            className={`fixed inset-y-0 left-0 transform z-40 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
          >
            <Sidebar closeSidebar={toggleSidebar} />
          </div>
          <main
            className={`flex-1 items-center justify-center overflow-auto bg-theme-bg-2 bg-no-repeat bg-cover ml-0 ${
              isSidebarOpen
                ? "filter blur-sm lg:blur-0 pointer-events-none md:pointer-events-auto"
                : ""
            }`}
            onClick={isSidebarOpen ? toggleSidebar : undefined}
          >
            {children}
          </main>
        </div>
        <div className="block lg:hidden">
        <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayoutComponent;
