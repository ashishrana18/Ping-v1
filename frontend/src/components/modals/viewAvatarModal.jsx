import React from "react";
import { FiX } from "react-icons/fi";

const ViewAvatarModal = ({ currentAvatar, onClose, displayName }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Close"
        >
          <FiX size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4 dark:text-secondary">
          {displayName}'s Avatar
        </h2>
        <img
          src={currentAvatar}
          alt={displayName}
          className="w-full h-auto rounded"
        />
      </div>
    </div>
  );
};

export { ViewAvatarModal };
