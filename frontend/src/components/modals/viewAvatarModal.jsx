import { Avatar } from "primereact/avatar";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

const ViewAvatarModal = ({ currentAvatar, onClose, displayName }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-[rgb(0,7,28)] w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 transform border border-gray-100 dark:border-gray-800 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate pr-4">
            {displayName}'s Avatar
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all duration-200 shrink-0"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center pb-12">
          <div className="relative mx-auto rounded-full p-2 bg-gradient-to-tr from-[#2196F3] to-[#64B5F6] aspect-square shrink-0 flex items-center justify-center shadow-xl">
            <Avatar
              image={currentAvatar}
              label={displayName?.[0]?.toUpperCase()}
              className="w-64 h-64 md:w-72 md:h-72 shadow-inner shrink-0 aspect-square overflow-hidden"
              shape="circle"
              imagestyle={{
                objectFit: "cover",
                borderRadius: "100%",
                width: "100%",
                height: "100%",
              }}
              style={{
                backgroundColor: "#2196F3",
                color: "#ffffff",
                fontSize: "6rem",
                fontWeight: "bold",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ViewAvatarModal };
