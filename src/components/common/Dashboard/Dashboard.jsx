import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header";
import { ProtectedRoute } from "../../security/protectedRoute";
import { Footer } from "../footer";

const DashboardLayoutComponent = ({ children, showSidebar = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen print:h-auto bg-theme-bg-2 md:bg-theme-bg-3 bg-no-repeat bg-cover print:bg-none">
        <div className="print:hidden">
          <Header toggleSidebar={toggleSidebar} />
        </div>
        <div
          className={`flex flex-1 overflow-hidden print:overflow-visible ${
            isSidebarOpen ? "bg-gray-900 bg-opacity-50" : ""
          }`}
        >
          {showSidebar && (
            <div
              className={`fixed inset-y-0 left-0 transform z-40 print:hidden ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
            >
              <Sidebar closeSidebar={toggleSidebar} />
            </div>
          )}
          <main
            className={`flex-1 overflow-auto print:overflow-visible ml-0 ${
              isSidebarOpen
                ? "filter blur-sm lg:blur-0 pointer-events-none md:pointer-events-auto"
                : ""
            }`}
            onClick={isSidebarOpen ? toggleSidebar : undefined}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <div className="block lg:hidden print:hidden">
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayoutComponent;