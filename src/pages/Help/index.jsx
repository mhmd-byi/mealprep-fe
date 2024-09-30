import React, { useState } from "react";
import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

export const HelpPage = () => {
  const [openItem, setOpenItem] = useState(0);
  const toggleAccordion = (index) => {
    setOpenItem(openItem === index ? null : index);
  };
  const faqData = [
    {
      question: "How to create an account?",
      answer:
        "To create an account, find the 'Sign up' or 'Create account' button, fill out the registration form with your personal information, and click 'Create account' or 'Sign up.' Verify your email address if needed, and then log in to start using the platform.",
    },
    {
      question: "Have any trust issue?",
      answer:
        "Our focus on providing robust and user-friendly content management capabilities ensures that you can manage your content with confidence, and achieve your content marketing goals with ease.",
    },
    {
      question: "How can I reset my password?",
      answer:
        "To reset your password, click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to reset your password. Follow the link in the email to create a new password.",
    },
    {
      question: "What is the payment process?",
      answer:
        "Our payment process is secure and straightforward. You can choose from various payment methods including credit/debit cards and PayPal. All transactions are encrypted to ensure your financial information remains safe.",
    },
  ];

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full h-auto lg:h-full">
        <div className="bg-white shadow-md rounded-lg p-3 md:p-10 lg:p-20 block md:block lg:flex lg:gap-20 max-w-[1500px] mx-auto my-auto">
          <div className="lg:w-1/3 mb-10 lg:mb-0">
            <h2 className="text-3xl font-bold text-theme-color-1 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Find quick answers to common questions about our platform. If you can't find what you're looking for, feel free to contact our support team.
            </p>
          </div>
          <div className="lg:w-2/3">
            {faqData.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  className="flex justify-between items-center w-full text-left p-4 bg-[#EBFFF1] hover:bg-[#C2FFD4] rounded-lg transition-all duration-300"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="font-semibold text-theme-color-1">{faq.question}</span>
                  {openItem === index ? (
                    <ExpandLess className="text-theme-color-1" />
                  ) : (
                    <ExpandMore className="text-theme-color-1" />
                  )}
                </button>
                {openItem === index && (
                  <div className="p-4 bg-white border border-indigo-100 rounded-b-lg text-left">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};