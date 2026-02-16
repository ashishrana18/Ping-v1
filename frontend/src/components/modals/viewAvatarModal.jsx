import React, { useEffect, useState } from "react";

import AvatarComponent from "../utils/avatar.jsx";
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
            {displayName ? `${displayName}'s Avatar` : "Avatar"}
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
          <div className="relative mx-auto rounded-full p-2 bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] aspect-square shrink-0 flex items-center justify-center shadow-xl">
            <AvatarComponent
              profilePicture={currentAvatar}
              displayName={displayName}
              size={288}
              avatarClasses={
                "shadow-inner shrink-0 aspect-square text-lg font-medium overflow-hidden bg-gray-200 text-gray-900 dark:text-gray-200"
              }
              boringAvatarClasses={
                "shrink-0 overflow-hidden rounded-full shadow-inner"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ViewAvatarModal };
