import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const Popup = ({ isOpen, onClose, title, content, buttons, maxWidthClass = "max-w-2xl", footerLeft = null }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[100] backdrop-filter backdrop-blur-sm p-4 overflow-y-auto print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={`bg-white rounded-lg shadow-xl p-6 w-full ${maxWidthClass} h-fit max-h-[90vh] flex flex-col my-auto`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="flex items-center justify-between mb-4 flex-none sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-1 -mr-1 transition-transform hover:scale-110 active:scale-90"
              >
                ×
              </button>
            </div>
            <div className="mb-4 overflow-y-auto pr-2 flex-grow">{content}</div>
            <div className="flex justify-between items-center flex-none border-t pt-4">
              <div className="flex flex-wrap gap-2">{footerLeft}</div>
              <div className="flex ml-auto">
                {buttons.map((button, index) => (
                  <motion.button
                    key={index}
                    onClick={button.onClick}
                    className={`${button.className} rounded-md px-4 py-2 mr-2`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {button.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
