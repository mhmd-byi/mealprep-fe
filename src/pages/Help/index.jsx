import { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { faqData } from "./data";

export const HelpPage = () => {
  const [openItem, setOpenItem] = useState(0);
  const toggleAccordion = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div>
            <p className="text-sm text-gray-500">Dashboard &rsaquo; FAQs</p>
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500">Find quick answers to common questions. Can't find yours? Reach out on WhatsApp from the sidebar.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
              <div className="flex justify-center items-center mb-3 w-12 h-12 rounded-xl bg-green-50 text-theme-color-1">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-gray-900">Need a hand?</p>
              <p className="mt-1 text-sm text-gray-500">
                Browse the answers alongside, covering meal plans, deliveries, cancellations and billing.
              </p>
            </div>

            <div className="space-y-3 lg:col-span-2">
              {faqData.map((faq, index) => {
                const isOpen = openItem === index;
                return (
                  <div key={index} className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <button
                      type="button"
                      className="flex gap-3 justify-between items-center p-4 w-full text-left hover:bg-gray-50"
                      onClick={() => toggleAccordion(index)}
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="flex-shrink-0 w-4 h-4 text-theme-color-1" />
                      ) : (
                        <ChevronDown className="flex-shrink-0 w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 text-sm text-gray-600 border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
