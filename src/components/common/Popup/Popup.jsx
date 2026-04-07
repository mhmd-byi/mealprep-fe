import React from "react";

const Popup = ({ isOpen, onClose, title, content, buttons }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-filter backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl h-fit max-h-[90vh] flex flex-col my-auto">
        <h2 className="text-xl font-bold mb-4 flex-none sticky top-0 bg-white pb-2 border-b">{title}</h2>
        <div className="mb-4 overflow-y-auto pr-2 flex-grow">{content}</div>
        <div className="flex justify-end flex-none border-t pt-4">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`${button.className} rounded-md px-4 py-2 mr-2`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Popup;
