import React from "react";

function SecretChatModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:text-info backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md max-w-sm">
        <h2 className="text-xl font-bold mb-4">
          Secret Chat Under Construction
        </h2>
        <p className="mb-4">This feature is currently under construction.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecretChatModal;
