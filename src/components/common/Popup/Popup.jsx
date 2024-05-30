import React from "react";

const Popup = ({ isOpen, onClose, title, content, buttons }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-fit">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-4">{content}</div>
        <div className="flex justify-end">
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
